import findRecordFromTitle from '../input/find-record.js'
import pickName from '../common/pick-name.js'
import Database from '../common/db.js'
import FileServices from '../common/file-services.js'
import Gpg from '../common/gpg.js'
import term from '../input/terminal.js'


export default async function renameCommand(defaultName, options) {
    // See if the title given is a match
    const db = new Database(FileServices, Gpg)
    const id = await findRecordFromTitle(db, defaultName)

    // Find the current name
    const FullTitle = await db.idToTitle(id)
    term.heading(`Rename ${FullTitle}...\n`)

    // Find a new name
    const entryName = await pickName(db)

    // Actually rename the record
    await db.rename(id, entryName)
    term.result(`Renamed from ${FullTitle} to ${entryName}\n`)
}
