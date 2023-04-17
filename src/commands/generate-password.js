import password from '../input/password.js'
import { copyToClipboard } from '../common/clip.js'
import { passwordColoured } from '../common/password-highlight.js'
import { term } from '../input/terminal.js'

export default async function generatePasswordCommand() {
    // Make a new password, copy it to the clipboard and log it out
    const pass = await password(true)

    // show it
    term.write(passwordColoured(pass))
    term.write('\n')

    // copy it
    copyToClipboard(pass)
}
