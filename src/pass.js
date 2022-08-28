#!/usr/bin/env node
import terminal from 'terminal-kit'
import { Command } from 'commander';
import { clearClipboardIfNeeded, disableClipboard, hasClipboardBeenChanged } from './common/clip.js'
import extendOptions from './common/extend-options.js';

import showCommand from './commands/show.js'
import initCommand from './commands/init.js'
import editCommand from './commands/edit.js'
import insertCommand from './commands/insert.js'
import deleteCommand from './commands/delete.js'
import defaultCommand from './commands/default.js'
import generatePasswordCommand from './commands/generate-password.js'
import listCommand from './commands/list.js'

const term = terminal.terminal
const program = new Command();

// override defaults from env
const defaultFolder = process.env.GPG_PASS_DIR || '~/.gpg-store'
const defaultWordCount = +(process.env.GPG_PASS_WORD_COUNT || 5)
const defaultMaxWordLen = +(process.env.GPG_PASS_MAX_WORD_LEN || 10)
const defaultJoinText = process.env.GPG_PASS_JOIN_TEXT || '.'
const defaultRandomJoin = defaultJoinText.toLowerCase() === 'true'

// generic ctrl-c handler to terminate
term.on('key', function (name, matches, data) {
    if (name === 'CTRL_C') {
        term.red('\nTerminating by ctrl-c (clipboard may not be cleared)\n')
        term.grabInput(false);
        setTimeout(function () { process.exit() }, 100);
    }
});

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
        percent: true
    });

    // called every 100ms to update
    function doProgress() {
        progress += timeStep / 15000
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
    .version('1.0.0')
    .option('-d, --dir <folder>', 'Folder to find and store passwords in', defaultFolder)
    .option('-k, --skip-clipboard', "skip the clipboard")
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

    // Default command is either list or show
    .argument('[entryName]', 'the name of the entry to lookup', '')
    .action(async (entryName) => defaultCommand(entryName, extendOptions(program.opts())))


// The init command
program
    .command('init')
    .argument('<gpgKeyPair>', 'name of the GPG keypair that will be used for encryption/decryption')
    .description('Create the target folder that will be used to store everything')
    .action(async (gpgKeyPair) => initCommand(gpgKeyPair, program.opts()))

// The insert command
program
    .command('insert')
    .alias('i')
    .alias('add')
    .option('-w, --word-count <wordcount>', 'how many words should the password contain', defaultWordCount)
    .option('-m, --max-word-len <maxlen>', 'the maximum length of each word used (can be shorted, but no longer)', defaultMaxWordLen)
    .option('-j, --join-text <jointext>', 'the character (or characters) used between each word', defaultJoinText)
    .option('-r, --random-join', 'use a random special character between each pair of words (overrides -j', defaultRandomJoin)
    .description('Insert a new password into the DB')
    .action(async (options) => insertCommand(extendOptions({ ...program.opts(), ...options })))

// The edit command
program
    .command('edit')
    .alias('e')
    .argument('[entryName]', 'the name of the entry to lookup', '')
    .description('Edit an existing entry')
    .action(async (entryName) => editCommand(entryName, extendOptions(program.opts())))

// The show command
program
    .command('show')
    .alias('s')
    .alias('get')
    .argument('[entryName]', 'the name of the entry to lookup', '')
    .description('Search for and show password details')
    .action(async (entryName) => showCommand(entryName, extendOptions(program.opts())))

// The Delete command
program
    .command('delete')
    .alias('rm')
    .argument('[entryName]', 'the name of the entry to lookup', '')
    .description('Delete an item from the store')
    .action(async (entryName) => deleteCommand(entryName, extendOptions(program.opts())))

// The Generate Password command
program
    .command('generate-password')
    .alias('g')
    .alias('gen')
    .option('-w, --word-count <wordcount>', 'how many words should the password contain', defaultWordCount)
    .option('-m, --max-word-len <maxlen>', 'the maximum length of each word used (can be shorted, but no longer)', defaultMaxWordLen)
    .option('-j, --join-text <jointext>', 'the character (or characters) used between each word', defaultJoinText)
    .option('-r, --random-join', 'use a random special character between each pair of words (overrides -j', defaultRandomJoin)
    .description('Generate a random password, show it and copy it to the clipboard')
    .action(async (options) => generatePasswordCommand(extendOptions({ ...program.opts(), ...options })))

// The List all passwords command
program
    .command('list')
    .alias('ls')
    .alias('l')
    .description('List all the passwords')
    .action(async () => listCommand(extendOptions(program.opts())))

// The Help command
program
    .command('help')
    .description('Show this help page')
    .action(async () => program.help())

try {
    // go go go...
    await program.parseAsync(process.argv)
} catch (err) {
    term.brightRed.error('\nError handling command\n')
    term.brightRed.error(`${err.message}\n`)
}
