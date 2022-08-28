import terminal from 'terminal-kit'
import * as utils from '../common/file-utils.js'
import { copyToClipboard } from '../common/clip.js'
import { decrypt } from '../common/encryption.js'
import { findEntry, listItems } from '../common/input.js'

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

function nameToPath(home, name) {
    return `${home}${utils.pathSeparator()}${name}.gpg`
}

export default async function showCommand(defaultKey, options) {
    let askUser = true
    let fullPath = ''

    // If we were given a key, see if it is the full key
    if (defaultKey !== '') {
        fullPath = nameToPath(options.baseDir, defaultKey)
        if (utils.fileExists(fullPath)) {
            askUser = false
        }
    }

    // no match yet, so ask the user
    if (askUser) {
        term.brightGreen('Search (tab for autocomplete):\n')
        const entryName = await findEntry(defaultKey, options.baseDir)

        // Build the name from the user input
        fullPath = nameToPath(options.baseDir, entryName)
    }

    // After all that, see if we have something valid
    if (!utils.fileExists(fullPath)) {
        term.brightRed.error(`${entryName} could not be found.\n`)
        return
    }

    // decrypt and enjoy
    const content = utils.readFile(fullPath)
    const decrypted = await decrypt(content, options.gpgId)

    // Show it
    term.brightWhite(decrypted)
    term('\n')

    // skip the clipboard?
    if (options.skipClipboard) {
        return
    }

    // pick stuff for clipping
    const items = extractItems(decrypted)
    if (items.length > 0) {
        let keepGoing = true
        while (keepGoing) {
            // show the list of items to copy to the clipboard
            term.brightGreen('Copy fields to clipboard? (ESC to abort)')
            const result = await listItems(items.map((i) => `${i.name} => ${i.value}`))

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
