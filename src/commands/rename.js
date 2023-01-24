import terminal from 'terminal-kit'
import findRecordFromTitle from '../common/find-record.js'
import pickName from '../common/pick-name.js'
import Database from '../common/db.js'
import FileServices from '../common/file-services.js'
import Gpg from '../common/gpg.js'

const term = terminal.terminal

export default async function renameCommand(defaultName, options) {
    // See if the title given is a match
    const db = new Database(FileServices, Gpg)
    const id = await findRecordFromTitle(db, defaultName)

    // Find the current name
    const FullTitle = await db.idToTitle(id)
    term.brightCyan(`Rename ${FullTitle}...\n`)

    // Find a new name
    const entryName = await pickName(db)

    // Actually rename the record
    await db.rename(id, entryName)
    term.brightCyan(`Renamed from ${FullTitle} to ${entryName}\n`)
}
