import terminal from 'terminal-kit'
import { copyToClipboard } from '../common/clip.js'
import { findEntry, listItems } from '../common/input.js'
import Database from '../common/db.js'

const term = terminal.terminal


function extractItems(content) {
    // Extract the first line
    const lines = content.split('\n')
    if (lines.length === 0) {
        return []
    }

    // Look for fields in the rest of the lines
    const items = [{ name: 'password', value: lines[0] }]
    for (let i = 1; i < lines.length; i += 1) {
        const regex = /^([a-z0-9 #._-]+):\s*(.*)$/i
        const m = regex.exec(lines[i])
        if (m !== null) {
            items.push({ name: m[1], value: m[2] })
        }
    }

    return items
}

export default async function showCommand(defaultTitle, options) {
    // See if the title given is a match
    const db = new Database()
    let id = await db.titleToId(defaultTitle)
    let title = defaultTitle
    if (id === null) {
        // no match yet, so ask the user
        term.brightGreen('Search (tab for autocomplete):\n')

        const all = await db.all()
        title = await findEntry(defaultTitle, all.map(i => i.title))
        id = await db.titleToId(title)
    }

    // Check we got one
    if (id === null) {
        throw new Error(`No entry found with the title of '${title}'`)
    }

    // fetch the content
    const content = await db.get(id)

    // Show it
    term.brightWhite(content)
    term('\n')

    // skip the clipboard?
    if (options.skipClipboard) {
        return
    }

    // pick stuff for clipping
    const items = extractItems(content)
    if (items.length > 0) {
        let keepGoing = true
        while (keepGoing) {
            // show the list of items to copy to the clipboard
            term.brightGreen('Copy fields to clipboard? (ESC to abort)')
            const result = await listItems(items.map((i) => i.name.toLowerCase().includes('password') ? `${i.name} => ************` : `${i.name} => ${i.value}`))

            // copy it and go around again, or cancel
            if (result?.canceled) {
                keepGoing = false
            } else {
                const value = items[result.selectedIndex].value
                copyToClipboard(value)
                term.brightCyan(`\n>>'${items[result.selectedIndex].name}' copied<<\n\n`)
            }
        }
    }
}

