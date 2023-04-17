import findRecordFromTitle from '../input/find-record.js'
import Database from '../common/db.js'
import FileServices from '../common/file-services.js'
import Gpg from '../common/gpg.js'
import term from '../input/terminal.js'
import textPrompt from '../input/text-prompt.js'
import yesNo from '../input/yes-no.js'

export default async function deleteCommand(defaultTitle, options) {
    // See if the title given is a match
    const db = new Database(FileServices, Gpg)

    term.warning('Maybe DELETE Record...\n')
    const id = await findRecordFromTitle(db, defaultTitle)
    const title = await db.idToTitle(id)

    let response = ''
    while (response !== 'delete') {
        term.danger(
            `Type DELETE to confirm you want to delete "${title}", or SHOW to see record, Esc to cancel\n`
        )
        response = await textPrompt('Confirm action:')
        response = response.toLowerCase()
        if (response !== 'delete' && response !== 'show') {
            term.danger('Cancelled. Item has NOT been deleted.\n')
            return
        }

        // show the content...
        if (response === 'show') {
            const content = await db.get(id)
            term.muted(content)
        }
    }

    const confirm = await yesNo('Are you really sure?', 'DELETE IT', 'No no no no', false)
    if (confirm) {
        term.danger(`Going to delete ${title}...\n`)

        await db.delete(id)

        term.danger(`...annnnd, it's gone. 💥\n`)
    } else {
        term.warning('Cancelled. Item has NOT been deleted.\n')
    }
}
