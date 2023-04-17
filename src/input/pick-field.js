import { styles, term } from './terminal.js'
import AutoCompleteTimeout from './autocomplete-timeout.js'

export default async function pickField(items, selectedIndex) {
    // mask password on-screen
    const choices = items.map((i, index) => {
        const n = i.name.toLowerCase()
        let v = i.value
        if (n.includes('pass') || n.includes('2fa') || n.includes('pin') || n.includes('totp')) {
            v = '*********'
        }

        return {
            name: `${i.name} => ${v}`,
            value: index,
        }
    })

    // add an entry to show everything
    choices.push({ name: 'Show Full Record', value: choices.length })

    try {
        // no match yet, so ask the user
        const prompt = new AutoCompleteTimeout({
            message: styles.heading('Choose item to copy to the clipboard'),
            footer: styles.warning('================'),
            limit: 12,
            timeoutDelay: 30 * 1000,
            initialSearch: '',
            initial: selectedIndex,
            choices,
            styles,
        })

        return await prompt.run()
    } catch (err) {
        term.error('Cancelled...\n')
        return null
    }
}
