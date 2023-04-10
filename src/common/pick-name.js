import { createEntry } from '../common/input.js'
import term from '../input/terminal.js'

export default async function pickName(db, defaultEntry = '') {
    // Pick a name that has not been used
    let entryName = defaultEntry
    let id = true
    while (id !== null) {
        term.heading('Choose a name for the record: ')
        entryName = await createEntry(entryName)

        if (entryName === '') {
            throw new Error('No record name. Cancelling...')
        }

        // look it up (will be null if there is no existing entry with this name)
        id = await db.titleToId(entryName)
        if (id !== null) {
            term.error(`There is already a record called "${entryName}"\n`)
        }
    }

    return entryName
}
