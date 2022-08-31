import terminal from 'terminal-kit'
import { edit } from "external-editor";
import passwordGen from './password-gen.js'

const term = terminal.terminal


async function inputFieldGeneric(opts) {
    return new Promise((resolve, reject) => {
        // prepare the options
        const inputOptions = {
            autoCompleteMenu: {
                style: term.white,
                selectedStyle: term.brightYellow
            },
            style: term.brightBlue,
            hintStyle: term.red,
            ...opts
        }

        // ask to choose an option
        term.inputField(inputOptions, (error, input) => {
            term.grabInput(false);
            term('\n')
            if (error) {
                return reject(error)
            }

            return resolve(input)
        })
    })
}

export async function createEntry(baseDir) {
    // Find all possible entries
    const all = []

    // function to filter results
    function autoComplete(inputStr) {
        // match any folder that starts with the typed text
        const lowerStr = inputStr.toLowerCase()
        const matches = all.filter((w) => w.toLowerCase().startsWith(lowerStr))
        if (matches.length === 0) {
            return inputStr
        }

        return matches
    }

    return inputFieldGeneric({
        autoComplete,
        autoCompleteHint: true,
    })
}


export async function findEntry(defaultEntry, all) {

    // function to filter results
    function autoComplete(inputStr) {
        // match any entry that contains the typed text
        const lowerStr = inputStr.toLowerCase()
        const matches = all.filter((w) => w.toLowerCase().includes(lowerStr))
        if (matches.length === 0) {
            return inputStr
        }

        return matches
    }

    return inputFieldGeneric({
        default: defaultEntry,
        autoComplete,
        autoCompleteHint: true,
    })
}

export async function username() {
    return inputFieldGeneric({})
}

export async function text() {
    return inputFieldGeneric({})
}

export async function password(words = 4, maxWordLen = 7, joinText = '.') {
    return inputFieldGeneric({
        // generate a random password when auto-complete is used
        autoComplete: (input) => passwordGen(words, maxWordLen, joinText),
        autoCompleteHint: true,
    })
}

export async function yesNo() {
    // Ask if they want to add 
    const response = await term.yesOrNo({ yes: ['y', 'ENTER'], no: ['n', 'ESCAPE', 'BACKSPACE'] }).promise
    term.grabInput(false)

    return response
}

export async function editor(content) {
    return edit(content)
}


export async function listItems(items) {
    return new Promise((resolve, reject) => {
        const options = {
            style: term.white,
            selectedStyle: term.brightYellow,
            oneLineItem: true,
            cancelable: true,
            leftPadding: '- ',
            selectedLeftPadding: '> ',
            submittedLeftPadding: '= '
        }

        term.grabInput({ mouse: 'button' });

        term.singleColumnMenu(items, options, function (error, response) {
            term.grabInput(false)
            if (error) {
                return reject(error)
            }

            return resolve(response)
        });
    })
}
