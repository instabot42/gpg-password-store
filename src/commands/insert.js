import terminal from 'terminal-kit'
import * as utils from '../common/file-utils.js'
import { copyToClipboard } from '../common/clip.js'
import { encrypt } from '../common/encryption.js'
import * as input from '../common/input.js'
import { passwordColoured } from '../common/password-highlight.js'

const term = terminal.terminal


function toValidPath(entryName, baseDir) {
    if (entryName.length === 0) {
        throw new Error('No name given')
    }

    // base name (to check for overlapping folders)
    let fullPath = `${baseDir}${utils.pathSeparator()}${entryName}`
    if (!utils.isFilenameAvailable(fullPath)) {
        throw new Error('Entry already in use')
    }

    // add an extension and recheck
    fullPath += '.gpg'
    if (!utils.isFilenameAvailable(fullPath)) {
        throw new Error('Entry already in use')
    }

    return fullPath
}


export default async function insertCommand(options) {
    term.brightGreen('Name of new entry: ')
    const entryName = await input.createEntry(options.baseDir)
    const validPath = toValidPath(entryName, options.baseDir)

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
    const encrypted = await encrypt(fullEntry, options.gpgId)

    // create the folders
    utils.createFileFolder(validPath)

    // write the encrypted data to the file
    utils.writeFile(validPath, encrypted)
    term.dim.white('Encrypted and saved\n')

    // clipboard
    term.brightCyan(`Password copied to clipboard\n`)
    copyToClipboard(password)
}