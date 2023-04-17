import { styles } from './terminal.js'
import enquirer from 'enquirer'

/**
 * Ask a question, get an answer
 * @returns
 */
export default async function yesNo(question, enabled = 'yep', disabled = 'nope', def = true) {
    try {
        const prompt = new enquirer.Toggle({
            message: styles.heading(question),
            enabled,
            disabled,
            initial: def,
        })

        const answer = await prompt.run()

        return answer
    } catch (err) {
        throw new Error('Cancelling...')
    }
}
