import { findEntry, tryAutocomplete } from '../common/input.js'
import term from '../input/terminal.js'

export default async function findRecordFromTitle(db, defaultTitle) {
    // See if we get an exact match
    let id = await db.titleToId(defaultTitle)
    if (id) {
        return id
    }

    // Find all the DB entries...
    const all = await db.all()

    // Attempt to autocomplete...
    const autoComplete = await tryAutocomplete(defaultTitle, all)
    if (autoComplete.length === 1) {
        // Only one matching result, so try that...
        id = await db.titleToId(autoComplete[0])
        if (id) {
            return id
        }
    }

    // no match yet, so ask the user
    term.heading('Search (tab for autocomplete):\n')

    const SearchedTitle = await findEntry(defaultTitle, all)
    id = await db.titleToId(SearchedTitle)
    if (id === null) {
        throw new Error(`No matching entry found`)
    }

    return id
}
