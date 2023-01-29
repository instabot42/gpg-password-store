import terminal from 'terminal-kit'
import { copyToClipboard } from '../common/clip.js'
import { listItems, filename } from '../common/input.js'
import findRecordFromTitle from '../common/find-record.js'
import Database from '../common/db.js'
import FileServices from '../common/file-services.js'
import Gpg from '../common/gpg.js'
import generateOTP from '../common/totp.js'

const term = terminal.terminal

/**
 *
 * @param {*} content
 * @returns
 */
function extractItems(content) {
    // Extract the first line
    const lines = content.split('\n')
    if (lines.length === 0) {
        return []
    }

    // Look for fields in the rest of the lines
    const items = []
    for (let i = 1; i < lines.length; i += 1) {
        const regex = /^([a-z0-9 #._-]+):\s*(.*)$/i
        const m = regex.exec(lines[i])
        if (m !== null) {
            items.push({ name: m[1], value: m[2] })
        }
    }

    return items
}

/**
 *
 * @param {*} db
 * @param {*} id
 * @param {*} defaultName
 */
async function restoreFile(db, id, defaultName) {
    term.brightGreen('Restore file to: ')
    const name = await filename(`./${defaultName}`)
    const fullpath = FileServices.resolvePath(name)

    const content = await db.getBinary(id)

    const finalName = FileServices.writeFileFullPathWithRefCount(fullpath, content)
    term.brightYellow(`Wrote content to ${finalName}\n`)
}

/**
 *
 * @param {*} defaultTitle
 * @param {*} options
 * @returns
 */
export default async function showCommand(defaultTitle, options) {
    // See if the title given is a match
    const db = new Database(FileServices, Gpg)
    const id = await findRecordFromTitle(db, defaultTitle)

    // Find the title and show that
    const FullTitle = await db.idToTitle(id)
    term.brightYellow(`${FullTitle}\n`)

    // fetch the content
    const filename = await db.idToFilename(id)
    if (filename !== null) {
        return restoreFile(db, id, filename)
    }

    const content = await db.get(id)

    // Show it
    if (options.showAll) {
        term.noFormat(`${content}\n`)
    }

    // skip the clipboard?
    if (options.skipClipboard) {
        return
    }

    // pick stuff for clipping
    const items = extractItems(content)
    let keepGoing = true
    let selectedIndex = 0
    while (keepGoing) {
        // show the list of items to copy to the clipboard
        term.brightGreen('Copy fields to clipboard? (ESC to abort)')

        // mask password on-screen
        const mappedItems = items.map((i) => {
            const n = i.name.toLowerCase()
            if (
                n.includes('pass') ||
                n.includes('2fa') ||
                n.includes('pin') ||
                n.includes('totp')
            ) {
                return `${i.name} => ************`
            }

            return `${i.name} => ${i.value}`
        })

        // add an entry to show everything
        mappedItems.push('Show Full Record')

        const result = await listItems(mappedItems, selectedIndex)

        // copy it and go around again, or cancel
        if (result?.canceled) {
            keepGoing = false
        } else {
            const index = result.selectedIndex
            if (index > items.length - 1) {
                selectedIndex = 0
                term.noFormat(`${content}\n`)
            } else {
                const name = items[index].name
                let value = items[index].value

                // one time password gen?
                if (name.toLowerCase().includes('totp')) {
                    value = generateOTP(value, Date.now())
                    term.brightCyan(`\nOne Time Password generated to clipboard:\n`)
                    term.brightYellow(`${value.slice(0, 3)} ${value.slice(3)}\n`)

                    const time = Math.floor(Date.now() / 1000)
                    const age = time - Math.floor(time / 30) * 30
                    term.dim(`Valid for ${30 - age} seconds\n`)
                }

                // copy to clipboard
                copyToClipboard(value)
                term.brightCyan(`\n>>'${name}' copied<<\n\n`)

                // default to the next entry
                selectedIndex = index + 1
            }
        }
    }
}
