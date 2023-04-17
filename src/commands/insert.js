import { copyToClipboard } from '../common/clip.js'
import * as input from '../common/input.js'
import Database from '../common/db.js'
import FileServices from '../common/file-services.js'
import pickName from '../input/pick-name.js'
import Gpg from '../common/gpg.js'
import term from '../input/terminal.js'
import password from '../input/password.js'
import textPrompt from '../input/text-prompt.js'
import yesNo from '../input/yes-no.js'

export default async function insertCommand(options) {
    const db = new Database(FileServices, Gpg)

    // Pick a unique name for the record
    const entryName = await pickName(db)

    // Ask the username
    const username = await textPrompt('Username:')

    // ask for a password, or generate one
    const pass = await password()

    // Ask about extra notes
    const wantNotes = await yesNo('Do you want to add notes?', 'Add Notes', 'Nope')
    const notes = wantNotes ? await input.editor('') : ''

    // combine all responses into a single doc
    const fullEntry = `${entryName}\n\nUsername: ${username}\nPassword: ${pass}\n\n${notes}`

    // encrypt it
    term.muted('\nWriting...\n')
    await db.insert(entryName, fullEntry)
    term.muted('Encrypted and saved\n\n')
    term.write(fullEntry)

    // clipboard
    term.result(`Password copied to clipboard\n`)
    copyToClipboard(pass)
}
