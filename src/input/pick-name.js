import { styles, term } from './terminal.js'
import enquirer from 'enquirer'

export default async function pickName(db, defaultEntry = '') {
    // Pick a name that has not been used
    let entryName = defaultEntry
    let id = true
    while (id !== null) {
        try {
            const p = new enquirer.Input({
                message: styles.heading('Choose new records name:'),
                initial: entryName,
            })
            entryName = await p.run()
        } catch (err) {
            entryName = ''
        }

        if (!entryName || entryName === '') {
            throw new Error('No record name. Cancelling...')
        }

        // look it up (will be null if there is no existing entry with this name)
        id = await db.titleToId(entryName)
        if (id !== null) {
            term.warning(`There is already a record called "${entryName}"\n`)
        }
    }

    return entryName
}
