import terminal from 'terminal-kit'
import passwordGen from '../common/password-gen.js'
import { copyToClipboard } from '../common/clip.js'
import { passwordColoured } from '../common/password-highlight.js'

const term = terminal.terminal

export default async function generatePasswordCommand(options) {
    // Make a new password, copy it to the clipboard and log it out
    const password = passwordGen(
        options.wordCount,
        options.maxWordLen,
        options.randomJoin ? true : options.joinText
    )

    // show it
    passwordColoured(password)

    // copy it
    copyToClipboard(password)
}
