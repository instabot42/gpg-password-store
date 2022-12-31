import terminal from 'terminal-kit'
import { findEntry, editor } from '../common/input.js'
import Database from '../common/db.js'

const term = terminal.terminal

export default async function editCommand(defaultName, options) {
    // See if the title given is a match
    const db = new Database()
    let id = await db.titleToId(defaultName)
    let title = defaultName
    if (id === null) {
        // no match yet, so ask the user
        term.brightGreen('Search (tab for autocomplete):\n')

        const all = await db.all()
        title = await findEntry(defaultName, all)
        id = await db.titleToId(title)
    }

    // fetch the content
    const content = await db.get(id)

    // edit it
    const updated = await editor(content)
    if (updated === content) {
        term.brightCyan('No changes made.\n')
    } else {
        // encrypt it and write it back
        await db.update(id, title, updated)
        term.brightCyan(`${title} updated\n`)
    }
}
