import terminal from 'terminal-kit'
import * as utils from '../common/file-utils.js'
import { encrypt, decrypt } from '../common/encryption.js'
import { findEntry, editor } from '../common/input.js'

const term = terminal.terminal


export default async function editCommand(defaultName, options) {
    term.brightGreen('Find an entry to edit : ')
    const entryName = await findEntry(defaultName, options.baseDir)

    // Find and decrypt the the content
    let fullPath = `${options.baseDir}${utils.pathSeparator()}${entryName}.gpg`
    const content = utils.readFile(fullPath)
    const decrypted = await decrypt(content.toString(), options.gpgId)

    // edit it
    const updated = await editor(decrypted)
    if (updated === decrypted) {
        term.brightCyan('No changes made.\n')
    } else {
        // encrypt it and write it back
        const encrypted = await encrypt(updated, options.gpgId)
        utils.writeFile(fullPath, encrypted)
        term.brightCyan(`${entryName} updated\n`)
    }
}
