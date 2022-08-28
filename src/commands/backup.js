import terminal from 'terminal-kit'
import * as utils from '../common/file-utils.js'
import availableEntries from '../common/available-entries.js'
import { encrypt } from '../common/encryption.js'

const term = terminal.terminal

function nameToPath(home, name) {
    return `${home}${utils.pathSeparator()}${name}.gpg`
}

export default async function backupCommand(targetFolder, options) {
    // Find all passwords in the store
    const all = availableEntries(options.baseDir)

    // For each one
    const allContent = all.map((name) => {
        // read in the file
        const fullPath = nameToPath(options.baseDir, name)
        const content = utils.readFile(fullPath)

        return { name, content }
    })

    const encrypted = await encrypt(JSON.stringify(allContent), options.gpgId)
    const timestamp = new Date().toISOString()
    const filename = `${targetFolder}/backup.${timestamp}.gpg`

    if (utils.isFilenameAvailable(filename)) {
        utils.writeFile(filename, encrypted)
        term.brightCyan(`Backup written to ${filename}`)
    } else {
        throw new Error(`Error - Failed to write backup to ${filename}`)
    }
}