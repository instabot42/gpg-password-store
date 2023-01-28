import terminal from 'terminal-kit'
import pickName from '../common/pick-name.js'
import Database from '../common/db.js'
import FileServices from '../common/file-services.js'
import Gpg from '../common/gpg.js'

const term = terminal.terminal

export default async function insertFileCommand(filename, options) {
    const db = new Database(FileServices, Gpg)

    const fullpath = FileServices.resolvePath(filename)
    if (!FileServices.fullPathExists(fullpath)) {
        throw new Error(`The file "${fullpath} does not exist.`)
    }

    // Pick a unique name for the record
    const baseName = FileServices.filenameFromPath(fullpath)
    const entryName = await pickName(db, `files/${baseName}`)

    // Read the file contents
    term.dim(`\nReading ${baseName}...\n`)
    const fileContent = FileServices.readFileRaw(fullpath)

    // Write it out encrypted
    term.dim('Encrypting and Writing...\n')
    await db.insert(entryName, fileContent, baseName)
    term.white('Encrypted and saved\n\n')
}
