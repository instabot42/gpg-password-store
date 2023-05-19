import Database from '../common/db.js'
import FileServices from '../common/file-services.js'
import Gpg from '../common/gpg.js'
import term from '../input/terminal.js'


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

export default async function listCommand(search, options) {
    term.heading('Password Store\n')

    const db = new Database(FileServices, Gpg)
    const records = await db.all()

    // filter the results to anything provided
    const lowerStr = search.toLowerCase()
    let matches = records.filter((w) => w.title.toLowerCase().includes(lowerStr))
    if (matches.length === 0) {
        matches = records
    }

    // Sort the results
    const sorted = sortRecords(matches, options)

    // Show the results
    const keyCount = await db.getKeyCount()
    const keys = await db.getKeyIds()
    term.muted(`Found ${sorted.length} matching entries, encrypted with ${keyCount} GPG key.\n`)
    term.muted(`Keys: ${keys.join(', ')}\n`)
    term.muted(`Path: ${FileServices.getBaseFolder()}\n`)
    if (sorted.length === 0) {
        term.result('  empty\n')
    } else {
        sorted.forEach((entry) => term.result(`${entry.title}\n`))
    }
}
