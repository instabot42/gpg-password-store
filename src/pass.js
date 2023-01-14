#!/usr/bin/env node
import terminal from 'terminal-kit'
import { Command } from 'commander'
import { clearClipboardIfNeeded, disableClipboard, hasClipboardBeenChanged } from './common/clip.js'

import showCommand from './commands/show.js'
import initCommand from './commands/init.js'
import editCommand from './commands/edit.js'
import insertCommand from './commands/insert.js'
import deleteCommand from './commands/delete.js'
import generatePasswordCommand from './commands/generate-password.js'
import listCommand from './commands/list.js'

const term = terminal.terminal
const program = new Command()

// override defaults from env
const defaultWordCount = +(process.env.GPG_PASS_WORD_COUNT || 5)
const defaultMaxWordLen = +(process.env.GPG_PASS_MAX_WORD_LEN || 10)
const defaultJoinText = process.env.GPG_PASS_JOIN_TEXT || '.'
const defaultRandomJoin = defaultJoinText.toLowerCase() === 'true'

// generic ctrl-c handler to terminate
term.on('key', function (name, matches, data) {
    if (name === 'CTRL_C') {
        term.red('\nTerminating by ctrl-c (clipboard may not be cleared)\n')
        term.grabInput(false)
        setTimeout(function () {
            process.exit()
        }, 100)
    }
})

// Clear the clipboard after a while
function clipboardProgressBar() {
    if (!hasClipboardBeenChanged()) {
        term.grabInput(false)
        return
    }

    let progress = 0
    const timeStep = 100

    // capture input
    term.grabInput(true)
    term.on('key', function (name) {
        if (name === 'ESCAPE') {
            progress = 2
        }
    })

    // create a progress bar
    const progressBar = term.progressBar({
        width: 80,
        title: 'Clearing clipboard in...',
        eta: true,
        percent: true,
    })

    // called every 100ms to update
    function doProgress() {
        progress += timeStep / 15000

        // if we clear the clipboard on some time along the way, we can exit now
        if (!hasClipboardBeenChanged()) {
            progress = 2
        }

        progressBar.update(progress)
        if (progress > 1) {
            setTimeout(() => {
                // clear clipboard if we used it...
                clearClipboardIfNeeded()

                // release the input
                term.grabInput(false)
                term('\n')
            }, timeStep)
        } else {
            setTimeout(doProgress, timeStep)
        }
    }

    doProgress()
}

// Declare the program
program
    .name('pass')
    .description('A simple password manager / store that leans on GPG')
    .version('1.6.1')
    .option('-k, --skip-clipboard', 'skip the clipboard')
    .hook('preAction', (thisCommand, actionCommand) => {
        const opts = program.opts()
        if (opts.skipClipboard) {
            disableClipboard()
        }
    })
    .hook('postAction', (thisCommand, actionCommand) => {
        const opts = program.opts()
        clipboardProgressBar()
    })

// The init command
program
    .command('init')
    .argument(
        '[gpgKeyPairId,gpgKeyPairId]',
        'name / ID of the GPG keypairs that will be used for encryption/decryption.'
    )
    .description(
        'Create the target folder that will be used to store everything, and define which GPG keys will be used for encryption / decryption. To encrypt to many key pairs, comma separate them'
    )
    .action(async (gpgKeyPair) => initCommand(gpgKeyPair, program.opts()))

// The insert command
program
    .command('insert')
    .alias('i')
    .alias('add')
    .option(
        '-w, --word-count <wordcount>',
        'how many words should the password contain',
        defaultWordCount
    )
    .option(
        '-m, --max-word-len <maxlen>',
        'the maximum length of each word used (can be shorted, but no longer)',
        defaultMaxWordLen
    )
    .option(
        '-j, --join-text <jointext>',
        'the character (or characters) used between each word',
        defaultJoinText
    )
    .option(
        '-r, --random-join',
        'use a random special character between each pair of words (overrides -j',
        defaultRandomJoin
    )
    .description('Insert a new password into the DB')
    .action(async (options) => insertCommand({ ...program.opts(), ...options }))

// The show command
program
    .command('get', { isDefault: true })
    .alias('show')
    .alias('s')
    .alias('g')
    .argument('[entryName]', 'the name of the entry to lookup', '')
    .option('-s, --show-all', 'Output the whole entry to the terminal', false)
    .description('Search for and show password details')
    .action(async (entryName, options) => showCommand(entryName, { ...program.opts(), ...options }))

// The edit command
program
    .command('edit')
    .alias('e')
    .argument('[entryName]', 'the name of the entry to lookup', '')
    .description('Edit an existing entry')
    .action(async (entryName) => editCommand(entryName, program.opts()))

// The Delete command
program
    .command('delete')
    .alias('rm')
    .argument('[entryName]', 'the name of the entry to lookup', '')
    .description('Delete an item from the store')
    .action(async (entryName) => deleteCommand(entryName, program.opts()))

// The Generate Password command
program
    .command('generate-password')
    .alias('gen')
    .option(
        '-w, --word-count <wordcount>',
        'how many words should the password contain',
        defaultWordCount
    )
    .option(
        '-m, --max-word-len <maxlen>',
        'the maximum length of each word used (can be shorted, but no longer)',
        defaultMaxWordLen
    )
    .option(
        '-j, --join-text <jointext>',
        'the character (or characters) used between each word',
        defaultJoinText
    )
    .option(
        '-r, --random-join',
        'use a random special character between each pair of words (overrides -j',
        defaultRandomJoin
    )
    .description('Generate a random password, show it and copy it to the clipboard')
    .action(async (options) => generatePasswordCommand({ ...program.opts(), ...options }))

// The List all passwords command
program
    .command('list')
    .alias('ls')
    .alias('l')
    .description('List all the passwords')
    .action(async () => listCommand(program.opts()))

// Files
// pass file filename
// Would read the file and write an encrypted copy of it into the password store
// The entry would be marked as a file and the original filename remembered
// When you get an entry and we see if it is a file, it should write it to the 'downloads' folder

// pass setting downloads path
// sets the default downloads folder where files will be restored to

// pass setting username a,b,c
// Sets some default usernames you commonly use (eg email addresses) that insert can suggest

// Add Search

try {
    // go go go...
    await program.parseAsync(process.argv)
} catch (err) {
    term.brightRed.error('\nError handling command\n')
    term.brightRed.error(`${err.message}\n`)
}
