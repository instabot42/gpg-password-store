import { styles } from './terminal.js'
import AutoCompleteTimeout from './autocomplete-timeout.js'
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
    const autoComplete = findPerfectMatch(defaultTitle, all)
    if (autoComplete) {
        // Only one matching result, so try that...
        id = await db.titleToId(autoComplete)
        if (id) {
            return id
        }
    }

    // no match yet, so ask the user
    const choices = all.map((r) => ({ name: r.title }))
    if (choices.length === 0) {
        throw new Error('No matching records found')
    }

    try {
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

    if (!id) {
        throw new Error(`No matching entry found`)
    }

    return id
}

function findPerfectMatch(inputStr, all) {
    // no input = no matches
    if (inputStr.length === 0) {
        return null
    }

    // match any entry that contains the typed text
    const lowerStr = inputStr.toLowerCase()
    const matches = all.filter((w) => w.title.toLowerCase().includes(lowerStr))
    if (matches.length !== 1) {
        return null
    }

    // There was exactly 1 match. return it's title
    return matches[0].title
}
