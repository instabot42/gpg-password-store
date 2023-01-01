import terminal from 'terminal-kit'
import * as utils from '../common/file-utils.js'
import Database from '../common/db.js'
const term = terminal.terminal

export default async function initCommand(gpgIds) {
    if (utils.createBaseFolder()) {
        // Attempt to create a new DB, giving it the keys given
        const db = new Database()
        await db.initDB(gpgIds)

        term.brightCyan(`gpg store at ${utils.getBaseFolder()} ready\n`)
    } else {
        term.brightRed.error(`Unable to create ${path}\n`)
        term.dim.white.error(err)
        term.error('\n')
    }
}
