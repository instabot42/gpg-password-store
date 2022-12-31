import terminal from 'terminal-kit'
import Database from '../common/db.js'

const term = terminal.terminal

export default async function listCommand(options) {
    term.brightGreen('Password Store\n')

    const db = new Database()
    const all = await (
        await db.allTitles()
    ).sort((a, b) => {
        const al = a.toLowerCase()
        const bl = b.toLowerCase()
        return al < bl ? -1 : +(al > bl)
    })

    if (all.length === 0) {
        term.dim.white('  empty\n')
    } else {
        all.forEach((entry) => term.brightCyan(`${entry}\n`))
    }
}
