import terminal from 'terminal-kit'
import * as input from '../common/input.js'
import findRecordFromTitle from '../common/find-record.js'
import Database from '../common/db.js'
import FileServices from '../common/file-services.js'
import Gpg from '../common/gpg.js'

const term = terminal.terminal

export default async function deleteCommand(defaultTitle, options) {
    // See if the title given is a match
    const db = new Database(FileServices, Gpg)

    term.brightRed('Maybe DELETE Record...\n')
    const id = await findRecordFromTitle(db, defaultTitle)
    const title = await db.idToTitle(id)

    let response = ''
    while (response !== 'DELETE') {
        term.brightRed(
            `Type DELETE to confirm you want to delete "${title}", or SHOW to see record\n`
        )
        response = await input.text()
        if (response !== 'DELETE' && response !== 'SHOW') {
            term.brightRed('Cancelled. Item has NOT been deleted.\n')
            return
        }

        // show the content...
        if (response === 'SHOW') {
            const content = await db.get(id)
            term.dim(content)
        }
    }

    term.brightRed(
        `OK. Delete "${title}". Are you really sure? (y to delete, n or enter to cancel)\n`
    )
    const confirm = await input.yesNo()
    if (confirm) {
        term.brightRed(`Going to delete ${title}...\n`)

        await db.delete(id)

        term.brightRed(`...annnnd, it's gone.\n`)
    } else {
        term.brightRed('Cancelled. Item has NOT been deleted.\n')
    }
}
