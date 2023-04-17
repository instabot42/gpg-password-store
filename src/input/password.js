import { styles } from './terminal.js'
import enquirer from 'enquirer'
import ValueSelect from './select.js'
import { passwordLetterGen, passwordWordGen } from '../common/password-gen.js'
import { passwordColoured } from '../common/password-highlight.js'

/**
 * Generate a password, asking many questions along the way...
 * @param {*} forceGenerate
 * @returns
 */
export default async function password(forceGenerate) {
    try {
        // Skip asking about manual password creation
        if (forceGenerate) {
            return await randomPassword()
        }

        // manual entry or generate one?
        const manualPrompt = new enquirer.Toggle({
            message: styles.heading('Generate Password, or manually enter one?'),
            enabled: 'Manual',
            disabled: 'Generate',
        })

        const answer = await manualPrompt.run()
        const result = answer ? await manualPassword() : await randomPassword()

        return result
    } catch (err) {
        console.log(err)
        throw new Error('Cancelling...')
    }
}

async function randomPassword() {
    const stylePrompt = new enquirer.Select({
        name: 'style',
        message: styles.heading('Random words or random letters?'),
        choices: ['Words', 'Letters'],
    })

    const styleAnswer = await stylePrompt.run()
    return styleAnswer === 'Words' ? randomWordsPassword() : randomLettersPassword()
}

/**
 * Pick a random password made from words
 * @returns
 */
async function randomWordsPassword() {
    // Figure out all the options
    const options = await enquirer.prompt([
        {
            type: 'numeral',
            name: 'wordCount',
            message: styles.heading('Number of words to use (2-12)'),
            min: 2,
            max: 11,
            float: false,
            initial: 4,
        },
        {
            type: 'toggle',
            name: 'shortWordsOnly',
            message: styles.heading('Limit to shorter words?'),
            enabled: 'Short',
            disabled: 'Long',
            initial: false,
        },
        {
            type: 'toggle',
            name: 'addDigits',
            message: styles.heading('Add some numbers in there?'),
            enabled: 'Numbers',
            disabled: 'Nope',
            initial: true,
        },
    ])

    const join = new ValueSelect({
        name: 'join',
        message: styles.heading('Join words using...'),
        choices: [
            { name: 'Random Characters', value: true },
            { name: 'Dot (.)', value: '.' },
            { name: 'Hyphen (-)', value: '-' },
            { name: 'Underscore (_)', value: '_' },
        ],
    })

    const r = await join.run()
    options.join = r

    const result = await pickFromPasswordSelection(() => passwordWordGen(options))
    return result
}

/**
 * Ask how you'd like a random letters password to look
 * @returns
 */
async function randomLettersPassword() {
    // Figure out all the options
    const options = await enquirer.prompt([
        {
            type: 'numeral',
            name: 'charCount',
            message: styles.heading('Number of characters (8-32)'),
            min: 8,
            max: 32,
            float: false,
            initial: 16,
        },
        {
            type: 'toggle',
            name: 'ambiguous',
            message: styles.heading('Allow ambiguous characters (like oO0 or 1il)?'),
            enabled: 'Ambiguous',
            disabled: 'Nope',
            initial: false,
        },
        {
            type: 'toggle',
            name: 'upper',
            message: styles.heading('Include upper case letters?'),
            enabled: 'Upper',
            disabled: 'Nope',
            initial: true,
        },
        {
            type: 'toggle',
            name: 'digits',
            message: styles.heading('Include digits?'),
            enabled: 'Digits',
            disabled: 'Nope',
            initial: true,
        },
        {
            type: 'toggle',
            name: 'special',
            message: styles.heading("Include 'special' characters?"),
            enabled: 'Special',
            disabled: 'Nope',
            initial: true,
        },
    ])

    // offer a selection of passwords using the above settings until they pick one
    const result = await pickFromPasswordSelection(() => passwordLetterGen(options))

    return result
}

/**
 * Generate a selection of passwords using the function given and let them pick one
 * @param {*} genPassword
 * @returns
 */
async function pickFromPasswordSelection(genPassword) {
    const moreString = 'More...'
    let result = moreString

    while (result === moreString) {
        const choices = [...Array(6).keys()].map((x) => {
            const p = genPassword()
            return { name: passwordColoured(p), value: p }
        })

        choices.push({ name: moreString, value: moreString })
        const passwordList = new enquirer.Select({
            name: 'style',
            message: styles.heading('Pick a password...'),
            choices,
        })

        await passwordList.run()
        result = passwordList.selected.value
    }

    return result
}

/**
 * Just let them type out a password
 * @returns
 */
async function manualPassword() {
    const prompt = new enquirer.Input({
        message: styles.heading('Enter your new password...'),
    })

    const result = await prompt.run()
    return result
}
