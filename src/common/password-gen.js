import sodium from 'sodium-native'
import wordlist from './wordlist.js'

/**
 * Random 32 bit int
 */
function randInt() {
    return sodium.randombytes_random()
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
    const special = ".,!@#$%^&*()_-+=;:|"
    const rndNum = randLen(special.length)

    return special[rndNum]
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
export default function passwordGen(words, maxLen, joinStr) {
    let passwords = []
    let w = 0
    let numberCount = 0

    while (w < words) {
        // try and find another word
        const offset = randLen(wordlist.length)
        const nextWord = wordlist[offset]

        if (nextWord.length <= maxLen) {
            passwords.push(nextWord[0].toUpperCase() + nextWord.slice(1))
            w += 1

            // Add a number?
            if (randLen(100) > 70) {
                passwords.push(numberString())
                numberCount += 1
            }
        }
    }

    if (numberCount === 0) {
        passwords.push(numberString())
    }

    return passwords.reduce((p, w, i) => i === 0 ? w : `${p}${joinStr === true ? randomJoin() : joinStr}${w}`, '')
}
