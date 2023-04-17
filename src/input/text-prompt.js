import { styles } from './terminal.js'
import enquirer from 'enquirer'

/**
 * Ask a question, get an answer
 * @returns
 */
export default async function textPrompt(question, def = '') {
    try {
        const prompt = new enquirer.Input({
            message: styles.heading(question),
            initial: def,
        })

        const answer = await prompt.run()

        return answer
    } catch (err) {
        throw new Error('Cancelling...')
    }
}
