import terminal from 'terminal-kit'
import Database from '../common/db.js'
import FileServices from '../common/file-services.js'
import Gpg from '../common/gpg.js'

const term = terminal.terminal

function sortRecords(records, options) {
    if (options.sortAccessed) {
        return records.sort((a, b) => {
            const ac = a.accessedAt || 0
            const bc = b.accessedAt || 0
            return ac - bc
        })
    } else if (options.sortModified) {
        return records.sort((a, b) => {
            const ac = a.modifiedAt || 0
            const bc = b.modifiedAt || 0
            return ac - bc
        })
    } else if (options.sortCreated) {
        return records.sort((a, b) => {
            const ac = a.createdAt || 0
            const bc = b.createdAt || 0
            return ac - bc
        })
    } else {
        return records.sort((a, b) => {
            const al = a.title.toLowerCase()
            const bl = b.title.toLowerCase()
            return al < bl ? -1 : +(al > bl)
        })
    }
}

export default async function listCommand(options) {
    term.brightGreen('Password Store\n')

    const db = new Database(FileServices, Gpg)
    const records = await db.all()
    const all = sortRecords(records, options)

    const keyCount = await db.getKeyCount()
    const keys = await db.getKeyIds()
    term.dim(`Found ${all.length} entries, encrypted with ${keyCount} GPG key.\n`)
    term.dim(`Keys: ${keys.join(', ')}\n`)
    if (all.length === 0) {
        term.dim.white('  empty\n')
    } else {
        all.forEach((entry) => term.brightCyan(`${entry.title}\n`))
    }
}
