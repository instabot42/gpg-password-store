import terminal from 'terminal-kit'
const term = terminal.terminal

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
    for (let i = 0; i < p.length; i += 1) {
        const char = p[i]
        if (match(/[a-z]/i, char)) {
            term.brightWhite(char)
        } else if (match(/[0-9]/i, char)) {
            term.brightYellow(char)
        } else {
            term.brightCyan(char)
        }
    }
    term('\n')
}
