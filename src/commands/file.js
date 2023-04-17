import pickName from '../input/pick-name.js'
import Database from '../common/db.js'
import FileServices from '../common/file-services.js'
import Gpg from '../common/gpg.js'
import term from '../input/terminal.js'


export default async function insertFileCommand(filename) {
    const db = new Database(FileServices, Gpg)

    const fullpath = FileServices.resolvePath(filename)
    if (!FileServices.fullPathExists(fullpath)) {
        throw new Error(`The file "${fullpath} does not exist.`)
    }

    // Pick a unique name for the record
    const baseName = FileServices.filenameFromPath(fullpath)
    const entryName = await pickName(db, `files/${baseName}`)

    // Read the file contents
    term.muted(`\nReading ${baseName}...\n`)
    const fileContent = FileServices.readFileRaw(fullpath)

    // Write it out encrypted
    term.muted('Encrypting and Writing...\n')
    await db.insert(entryName, fileContent, baseName)
    term.result('Encrypted and saved\n\n')
}
