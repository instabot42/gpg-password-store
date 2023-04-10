import { editor } from '../common/input.js'
import findRecordFromTitle from '../common/find-record.js'
import Database from '../common/db.js'
import FileServices from '../common/file-services.js'
import Gpg from '../common/gpg.js'
import term from '../input/terminal.js'

export default async function editCommand(defaultName, options) {
    // See if the title given is a match
    const db = new Database(FileServices, Gpg)
    const id = await findRecordFromTitle(db, defaultName)

    // fetch the content
    const content = await db.get(id)
    const FullTitle = await db.idToTitle(id)

    // edit it
    const updated = await editor(content)
    if (updated === content) {
        term.result('No changes made.\n')
    } else {
        // encrypt it and write it back
        await db.update(id, updated)
        term.result(`${FullTitle} updated\n`)
    }
}
