import terminal from 'terminal-kit'
import * as input from '../common/input.js'
import Database from '../common/db.js'

const term = terminal.terminal


export default async function deleteCommand(defaultTitle, options) {
    // See if the title given is a match
    const db = new Database()
    let id = await db.titleToId(defaultTitle)
    let title = defaultTitle
    if (id === null) {
        // no match yet, so ask the user
        term.brightRed('Search for item to DELETE (tab for autocomplete):\n')

        const all = await db.all()
        title = await input.findEntry(defaultTitle, all.map(i => i.title))
        id = await db.titleToId(title)
    }

    // After all that, see if we have something valid
    if (id === null) {
        term.brightRed.error(`${title} could not be found.\n`)
        return
    }

    term.brightRed(`Type DELETE to confirm you want to delete ${title}\n`)
    const mustBeDelete = await input.text()
    if (mustBeDelete !== 'DELETE') {
        term.brightRed('Cancelled. Item has NOT been deleted.')
        return
    }

    term.brightRed(`OK. Delete ${title}. Are you really sure? (y or enter to delete, n to cancel)\n`)
    const confirm = await input.yesNo()
    if (confirm) {
        term.brightRed(`Going to delete ${title}...\n`)

        await db.delete(id)

        term.brightRed(`...annnnd, it's gone.\n`)
    }
}
