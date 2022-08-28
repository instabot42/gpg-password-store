import terminal from 'terminal-kit'
import * as utils from '../common/file-utils.js'
import * as input from '../common/input.js'

const term = terminal.terminal

function nameToPath(home, name) {
    return `${home}${utils.pathSeparator()}${name}.gpg`
}

export default async function deleteCommand(defaultKey, options) {
    let askUser = true
    let fullPath = ''
    let entryName = defaultKey

    // If we were given a key, see if it is the full key
    if (defaultKey !== '') {
        fullPath = nameToPath(options.baseDir, defaultKey)
        if (utils.fileExists(fullPath)) {
            askUser = false
        }
    }

    // no match yet, so ask the user
    if (askUser) {
        term.brightRed('Search for item to DELETE (tab for autocomplete):\n')
        entryName = await input.findEntry(defaultKey, options.baseDir)

        // Build the name from the user input
        fullPath = nameToPath(options.baseDir, entryName)
    }

    // After all that, see if we have something valid
    if (!utils.fileExists(fullPath)) {
        term.brightRed.error(`${entryName} could not be found.\n`)
        return
    }

    term.brightRed(`Type DELETE to confirm you want to delete ${entryName}\n`)
    const mustBeDelete = await input.text()
    if (mustBeDelete !== 'DELETE') {
        term.brightRed('Cancelled. Item has NOT been deleted.')
        return
    }

    term.brightRed(`OK. Delete ${entryName}. Are you really sure? (y or enter to delete, n to cancel)\n`)
    const confirm = await input.yesNo()
    if (confirm) {
        term.brightRed(`Going to delete ${entryName}...\n`)

        utils.deleteFile(fullPath)

        term.brightRed(`...annnnd, it's gone.\n`)
    }
}
