import terminal from 'terminal-kit'
import * as utils from '../common/file-utils.js'
import * as input from '../common/input.js'
import Database from '../common/db.js'
const term = terminal.terminal

export default async function initCommand(gpgIds) {
    if (utils.createBaseFolder()) {
        let keys = gpgIds
        if (!keys) {
            term.brightGreen(
                'Enter name of GPG Keys to use for encryption/decrption (comma separate multiple keys):\n'
            )
            keys = await input.text()
        }

        // Attempt to create a new DB, giving it the keys given
        const db = new Database()
        await db.initDB(keys)

        term.brightCyan(`gpg store at ${utils.getBaseFolder()} ready\n`)
    } else {
        term.brightRed.error(`Unable to create ${path}\n`)
        term.dim.white.error(err)
        term.error('\n')
    }
}
