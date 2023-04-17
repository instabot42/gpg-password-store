import { copyToClipboard } from '../common/clip.js'
import findRecordFromTitle from '../input/find-record.js'
import pickField from '../input/pick-field.js'
import Database from '../common/db.js'
import FileServices from '../common/file-services.js'
import Gpg from '../common/gpg.js'
import generateOTP from '../common/totp.js'
import term from '../input/terminal.js'
import textPrompt from '../input/text-prompt.js'

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
    const name = await textPrompt('Restore file to: ', `./${defaultName}`)
    const fullpath = FileServices.resolvePath(name)

    const content = await db.getBinary(id)

    const finalName = FileServices.writeFileFullPathWithRefCount(fullpath, content)
    term.result(`Wrote content to ${finalName}\n`)
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
    term.info(`${FullTitle}\n`)

    // fetch the content
    const filename = await db.idToFilename(id)
    if (filename !== null) {
        return restoreFile(db, id, filename)
    }

    const content = await db.get(id)

    // Show it
    if (options.showAll) {
        term.write(`${content}\n`)
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
        const index = await pickField(items, selectedIndex)
        if (index === null) {
            return
        }

        // copy it and go around again, or cancel
        if (index > items.length - 1) {
            selectedIndex = 0
            term.write(`${content}\n`)
        } else {
            const name = items[index].name
            const value = convertValue(name, items[index].value)

            // copy to clipboard
            copyToClipboard(value)
            term.result(`\n>>'${name}' copied<<\n\n`)

            // default to the next entry
            selectedIndex = index + 1
        }
    }
}

function convertValue(name, v) {
    // one time password gen?
    if (name.toLowerCase().includes('totp')) {
        const value = generateOTP(v, Date.now())
        term.info(`\nOne Time Password generated to clipboard:\n`)
        term.result(`${value.slice(0, 3)} ${value.slice(3)}\n`)

        const time = Math.floor(Date.now() / 1000)
        const age = time - Math.floor(time / 30) * 30
        term.muted(`Valid for ${30 - age} seconds\n`)

        return value
    }

    return v;
}
