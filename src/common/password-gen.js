import crypto from 'node:crypto'
import wordlist from './wordlist.js'

/**
 * Random 32 bit int
 */
function randInt() {
    return crypto.randomInt(2 ** 38)
}

/**
 * Random int in the range 0 to len-1
 * @param {*} len
 */
function randLen(len) {
    return randInt() % len
}

/**
 * Generate a random "join" string to use between words
 */
function randomJoin() {
    return randomChar('.,!@#$%^&*()_-+=;:|')
}

/**
 * Random Character from the list of possible characters
 * @param {*} dictionary
 * @returns
 */
function randomChar(dictionary) {
    const rndNum = randLen(dictionary.length)

    return dictionary[rndNum]
}

/**
 * Generate a random number string of up to 3 digits (2-9 : no 1's or 0's)
 */
function numberString() {
    let i = 0
    while (i < 100) {
        const rndNum = randInt()
        const numStr = `${rndNum}`.replace(/[01]/g, '')

        if (numStr.length > 0) {
            return numStr.slice(0, 3)
        }

        i += 1
    }
}

/**
 * Makes a new password
 * @param {*} words How many words to use
 * @param {*} maxLen How long can each word be (max length)
 * @param {*} joinStr  String to use to join the words (for a function that returns a string)
 * @returns A new password
 */
export function passwordWordGen(options) {
    let passwords = []
    let w = 0
    let numberCount = 0

    const words = options.wordCount || 5
    const joinStr = options.join || '-'
    const maxLen = options.shortWordsOnly ? 5 : 99
    while (w < words) {
        // try and find another word
        const offset = randLen(wordlist.length)
        const nextWord = wordlist[offset]

        if (nextWord.length <= maxLen) {
            passwords.push(nextWord[0].toUpperCase() + nextWord.slice(1))
            w += 1

            // Add a number?
            if (options.addDigits && randLen(100) > 70) {
                passwords.push(numberString())
                numberCount += 1
            }
        }
    }

    if (options.addDigits && numberCount === 0) {
        passwords.push(numberString())
    }

    return passwords.reduce(
        (p, w, i) => (i === 0 ? w : `${p}${joinStr === true ? randomJoin() : joinStr}${w}`),
        ''
    )
}

export function passwordLetterGen(options) {
    const special = '.,!@#$%^&*()_-+=;:|'
    let lower = 'abcdefghijklmnopqrstuvwxyz'
    let digits = '0123456789'

    // remove ambiguous characters?
    if (!options.ambiguous) {
        lower = lower.replace(/o|i|l/i, '')
        digits = digits.replace(/0|1/i, '')
    }

    // which sets of characters should be used

    // lower case more common...
    let all = lower + lower

    // add in other options
    all += options.upper ? lower.toUpperCase() : ''
    all += options.digits ? digits : ''
    all += options.special ? special : ''

    let c = options.charCount || 12
    let str = ''
    while (c > 0) {
        str += randomChar(all)
        c -= 1
    }

    return str
}
