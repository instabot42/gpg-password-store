import { tryAutocomplete } from '../common/input.js'
import { styles } from './terminal.js'
import AutoCompleteTimeout from './autocomplete-timeout.js'

export default async function findRecordFromTitle(db, defaultTitle) {
    // See if we get an exact match
    let id = await db.titleToId(defaultTitle)
    if (id) {
        return id
    }

    try {
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
        const choices = all.map((r) => ({ name: r.title }))
        const prompt = new AutoCompleteTimeout({
            message: styles.heading('Choose record'),
            footer: styles.warning('================'),
            limit: 12,
            timeoutDelay: 60 * 1000,
            initialSearch: defaultTitle,
            choices,
            styles,
        })

        const choice = await prompt.run()
        id = await db.titleToId(choice)
    } catch (err) {
        throw new Error(`Cancelled...`)
    }

    if (id === null) {
        throw new Error(`No matching entry found`)
    }

    return id
}
