import terminal from 'terminal-kit'
import { copyToClipboard } from '../common/clip.js'
import * as input from '../common/input.js'
import Database from '../common/db.js'

const term = terminal.terminal


export default async function insertCommand(options) {
    const db = new Database()

    term.brightGreen('Name of new entry: ')
    const entryName = await input.createEntry(options.baseDir)

    // ask for a password, or generate one
    term.brightGreen('\nPassword (tab to generate one): ')
    const password = await input.password(options.wordCount, options.maxWordLen, options.randomJoin ? true : options.joinText)

    term.brightGreen('Username: ')
    const username = await input.username()

    // Ask about extra notes
    term.brightGreen('\nDo you want to add notes (y or Enter), or skip (n, Esc)\n')
    const wantNotes = await input.yesNo()
    let notes = ''
    if (wantNotes) {
        notes = await input.editor('Additional Notes\n\n')
    }

    // combine all responses into a single doc
    let fullEntry = `${password}\n`
    if (username != '') { fullEntry += `\nUsername: ${username}\n` }
    if (notes !== '') { fullEntry += `${notes}\n` }
    term.brightCyan(fullEntry)

    // encrypt it
    db.create(entryName, fullEntry)
    term.dim.white('Encrypted and saved\n')

    // clipboard
    term.brightCyan(`Password copied to clipboard\n`)
    copyToClipboard(password)
}