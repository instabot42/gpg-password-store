import Database from '../common/db.js'
import FileServices from '../common/file-services.js'
import Gpg from '../common/gpg.js'
import term from '../input/terminal.js'
import textPrompt from '../input/text-prompt.js'


export default async function initCommand(gpgIds) {
    if (FileServices.createBaseFolder()) {
        let keys = gpgIds
        if (!keys) {
            keys = await textPrompt('Enter name of GPG Keys to use for encryption/decrption (comma separate multiple keys):')
            if (!keys || keys === '') {
                throw new Error('must provide a GPG key id / name')
            }
        }

        // Attempt to create a new DB, giving it the keys given
        const db = new Database(FileServices, Gpg)
        await db.initDB(keys)

        term.result(`gpg store at ${FileServices.getBaseFolder()} ready\n`)
    } else {
        term.error(`Unable to create ${path}\n`)
        term.error(err)
        term.error('\n')
    }
}
