#!/usr/bin/env node
import { Command } from 'commander'
import { clearClipboardIfNeeded, disableClipboard, hasClipboardBeenChanged } from './common/clip.js'
import { styles, term } from './input/terminal.js'

import showCommand from './commands/show.js'
import initCommand from './commands/init.js'
import editCommand from './commands/edit.js'
import renameCommand from './commands/rename.js'
import insertCommand from './commands/insert.js'
import insertFileCommand from './commands/file.js'
import deleteCommand from './commands/delete.js'
import generatePasswordCommand from './commands/generate-password.js'
import listCommand from './commands/list.js'

const program = new Command()


// Clear the clipboard after a while
function clipboardProgressBar() {
    if (!hasClipboardBeenChanged()) {
        return
    }

    // progress bar settings
    let progress = 0
    const timeStep = 100

    // Some escape sequences to draw stuff
    const ESC = '\u001b['
    const clearLine = `${ESC}2K${ESC}${1}G`
    const hide = `${ESC}?25l`
    //const show = `${ESC}?25h`

    // Hide the cursor
    term.write(hide)

    // A timeout that will draw some progress
    function doProgress() {
        progress += timeStep / 15000
        if (progress > 1) {
            setTimeout(() => {
                // clear clipboard if we used it...
                clearClipboardIfNeeded()
                term.write(clearLine)
                term.muted('clipboard cleared\n')
            }, timeStep)
        } else {
            setTimeout(doProgress, 50)
        }

        // if we clear the clipboard on some time along the way, we can exit now
        if (!hasClipboardBeenChanged()) {
            progress = 2
        }

        // draw some progress
        const dots = Math.floor((1 + Math.sin(progress * 2 * 3.1415 * 4)) * 5)
        term.write(clearLine)
        term.muted('Waiting for clipboard to clear:')
        term.warning(`${'='.repeat(dots+1)}`)
    }

    doProgress()
}

// Declare the program
program
    .name('pass')
    .description(styles.warning('A simple password manager / store that leans on GPG'))
    .version(styles.warning('1.6.1'))
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
        styles.info(
            'Create the target folder that will be used to store everything, and define which GPG keys will be used for encryption / decryption. To encrypt to many key pairs, comma separate them'
        )
    )
    .action(async (gpgKeyPair) => initCommand(gpgKeyPair, program.opts()))

// The insert command
program
    .command('insert')
    .alias('i')
    .alias('add')
    .description(styles.info('Insert a new password into the DB'))
    .action(async () => insertCommand())

// Insert a file
program
    .command('file')
    .argument('filename', 'the path of the file to store')
    .description(styles.info('Store a file in the encrypted data store'))
    .action(async (filename) => insertFileCommand(filename))

// The show command
program
    .command('get', { isDefault: true })
    .alias('show')
    .alias('s')
    .alias('g')
    .argument('[entryName]', 'the name of the entry to lookup', '')
    .option('-s, --show-all', 'Output the whole entry to the terminal', false)
    .description(styles.info('Search for and show password details'))
    .action(async (entryName, options) => showCommand(entryName, { ...program.opts(), ...options }))

// The edit command
program
    .command('edit')
    .alias('e')
    .argument('[entryName]', 'the name of the entry to lookup', '')
    .description(styles.info('Edit an existing entry'))
    .action(async (entryName) => editCommand(entryName, program.opts()))

// The rename command
program
    .command('rename')
    .argument('[entryName]', 'the name / part name of the entry to rename', '')
    .description(styles.info('Change the name of an entry'))
    .action(async (entryName) => renameCommand(entryName, program.opts()))

// The Delete command
program
    .command('delete')
    .alias('rm')
    .argument('[entryName]', 'the name of the entry to lookup', '')
    .description(styles.info('Delete an item from the store'))
    .action(async (entryName) => deleteCommand(entryName, program.opts()))

// The Generate Password command
program
    .command('generate-password')
    .alias('gen')
    .description(styles.info('Generate a random password, show it and copy it to the clipboard'))
    .action(async () => generatePasswordCommand())

// The List all passwords command
program
    .command('list')
    .alias('ls')
    .alias('l')
    .argument('[search]', 'Limit the result to only those including the search term', '')
    .option('-c, --sort-created', 'Sort by creation date (oldest first)')
    .option('-m, --sort-modified', 'Sort by modified date (oldest first)')
    .option('-a, --sort-accessed', 'Sort by last accessed date (oldest first)')
    .description(styles.info('List all the passwords'))
    .action(async (search, options) => listCommand(search, { ...program.opts(), ...options }))

// pass setting downloads path
// sets the default downloads folder where files will be restored to

// pass setting username a,b,c
// Sets some default usernames you commonly use (eg email addresses) that insert can suggest

// Add Search

try {
    // go go go...
    await program.parseAsync(process.argv)
} catch (err) {
    term.error(`${err.message}\n`)
}
