import terminal from 'terminal-kit'
import { copyToClipboard } from '../common/clip.js'
import * as input from '../common/input.js'
import Database from '../common/db.js'
import FileServices from '../common/file-services.js'
import Gpg from '../common/gpg.js'

const term = terminal.terminal

export default async function insertCommand(options) {
    const db = new Database(FileServices, Gpg)

    term.brightGreen('Name of new entry: ')
    const entryName = await input.createEntry(options.baseDir)

    term.brightGreen('Username: ')
    const username = await input.username()

    // ask for a password, or generate one
    term.brightGreen('\nPassword (tab to generate one): ')
    const password = await input.password(
        options.wordCount,
        options.maxWordLen,
        options.randomJoin ? true : options.joinText
    )

    // Ask about extra notes
    term.brightGreen('\nDo you want to add notes (y or Enter), or skip (n, Esc)\n')
    const wantNotes = await input.yesNo()
    const notes = wantNotes ? await input.editor('') : ''

    // combine all responses into a single doc
    const fullEntry = `${entryName}\n\nUsername: ${username}\nPassword: ${password}\n\n${notes}`

    // encrypt it
    term.dim.white('\nWriting...\n')
    await db.insert(entryName, fullEntry)
    term.dim.white('Encrypted and saved\n\n')
    term.brightCyan(fullEntry)

    // clipboard
    term.brightCyan(`Password copied to clipboard\n`)
    copyToClipboard(password)
}
