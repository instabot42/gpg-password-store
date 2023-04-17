import terminal from 'terminal-kit'
import { edit } from 'external-editor'

const term = terminal.terminal

async function inputFieldGeneric(opts) {
    return new Promise((resolve, reject) => {
        // prepare the options
        const inputOptions = {
            autoCompleteMenu: {
                style: term.white,
                selectedStyle: term.brightYellow,
            },
            style: term.brightBlue,
            hintStyle: term.red,
            ...opts,
        }

        // ask to choose an option
        term.inputField(inputOptions, (error, input) => {
            term.grabInput(false)
            term('\n')

            if (error) {
                return reject(error)
            }

            if (input === undefined) {
                return reject(new Error('aborted...'))
            }

            return resolve(input)
        })
    })
}

export async function createEntry(defaultEntry = '') {
    return inputFieldGeneric({
        default: defaultEntry,
        cancelable: true,
    })
}


export async function filename(defaultFilename = '') {
    return createEntry(defaultFilename)
}


export async function text() {
    return inputFieldGeneric({ cancelable: true })
}


export async function editor(content) {
    return edit(content)
}

