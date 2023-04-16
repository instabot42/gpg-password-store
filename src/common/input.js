import terminal from 'terminal-kit'
import { edit } from 'external-editor'
import { passwordWordGen } from './password-gen.js'

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

function autoCompleteSorted(inputStr, all) {
    // match any entry that contains the typed text
    const lowerStr = inputStr.toLowerCase()
    const matches = all.filter((w) => w.title.toLowerCase().includes(lowerStr))
    if (matches.length === 0) {
        return inputStr
    }

    return matches
        .sort((a, b) => {
            // sort by access time
            const at = a.accessedAt ?? 0
            const bt = b.accessedAt ?? 0
            if (at === bt) {
                // fall back to title
                const al = a.title.toLowerCase()
                const bl = b.title.toLowerCase()
                return al < bl ? -1 : +(al > bl)
            }

            return bt - at
        })
        .map((e) => e.title)
}

export async function tryAutocomplete(inputStr, all) {
    return autoCompleteSorted(inputStr, all)
}

export async function createEntry(defaultEntry = '') {
    return inputFieldGeneric({
        default: defaultEntry,
        cancelable: true,
    })
}

export async function findEntry(defaultEntry, all) {
    // function to filter results
    function autoComplete(inputStr) {
        return autoCompleteSorted(inputStr, all)
    }

    return inputFieldGeneric({
        default: defaultEntry,
        autoComplete,
        autoCompleteHint: true,
        cancelable: true,
    })
}

export async function filename(defaultFilename = '') {
    return createEntry(defaultFilename)
}

export async function username() {
    return inputFieldGeneric({ cancelable: true })
}

export async function text() {
    return inputFieldGeneric({ cancelable: true })
}

export async function password(words = 4, maxWordLen = 7, joinText = '.') {
    return inputFieldGeneric({
        // generate a random password when auto-complete is used
        autoComplete: (input) =>
            passwordWordGen({ wordCount: words, shortWordsOnly: maxWordLen <= 5, join: joinText }),
        autoCompleteHint: true,
        cancelable: true,
    })
}

export async function yesNo() {
    // Ask if they want to add
    const response = await term.yesOrNo({ yes: ['y'], no: ['n', 'ENTER', 'ESCAPE', 'BACKSPACE'] })
        .promise
    term.grabInput(false)

    return response
}

export async function editor(content) {
    return edit(content)
}

export async function listItems(items, selectedIndex = 0) {
    return new Promise((resolve, reject) => {
        const options = {
            style: term.white,
            selectedStyle: term.brightCyan,
            oneLineItem: true,
            cancelable: true,
            leftPadding: '  ',
            selectedLeftPadding: '> ',
            submittedLeftPadding: '= ',
            selectedIndex,
        }

        term.grabInput({ mouse: 'button' })

        term.singleColumnMenu(items, options, function (error, response) {
            term.grabInput(false)
            if (error) {
                return reject(error)
            }

            return resolve(response)
        })
    })
}
