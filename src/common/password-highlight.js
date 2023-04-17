import { styles } from '../input/terminal.js'

/**
 * True if str matches the regex given
 * @param {*} regex
 * @param {*} str
 */
function match(regex, str) {
    return regex.exec(str) !== null
}

/**
 * Log the password out (with syntax colouring)
 * @param {*} p
 */
export function passwordColoured(p) {
    // split into chars in a way that support unicode
    const chars = [...p]

    // decide how to display each one...
    let result = ''
    chars.forEach((char) => {
        if (match(/[a-z]/i, char)) {
            result += styles.primary(char)
        } else if (match(/[0-9]/i, char)) {
            result += styles.warning(char)
        } else {
            result += styles.bright(char)
        }
    })

    return result
}
