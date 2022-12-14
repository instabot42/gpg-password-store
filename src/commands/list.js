import terminal from 'terminal-kit'
import Database from '../common/db.js'
import FileServices from '../common/file-services.js'
import Gpg from '../common/gpg.js'

const term = terminal.terminal

export default async function listCommand(options) {
    term.brightGreen('Password Store\n')

    const db = new Database(FileServices, Gpg)
    const all = await (
        await db.allTitles()
    ).sort((a, b) => {
        const al = a.toLowerCase()
        const bl = b.toLowerCase()
        return al < bl ? -1 : +(al > bl)
    })

    const keyCount = await db.getKeyCount()
    const keys = await db.getKeyIds()
    term.dim(`Found ${all.length} entries, encrypted with ${keyCount} GPG key.\n`)
    term.dim(`Keys: ${keys.join(', ')}\n`)
    if (all.length === 0) {
        term.dim.white('  empty\n')
    } else {
        all.forEach((entry) => term.brightCyan(`${entry}\n`))
    }
}
