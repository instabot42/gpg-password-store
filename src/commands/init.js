import terminal from 'terminal-kit';
import * as utils from '../common/file-utils.js'
const term = terminal.terminal

export default function initCommand(gpgidRaw) {
    if (utils.createBaseFolder()) {
        if (utils.fileExists('.gpgid')) {
            throw new Error('The folder has already been initialised')
        }

        // Sanitise the key name a bit and save it
        const regex = /[^\w. -]/gi
        const gpgId = gpgidRaw.replace(regex, '')
        utils.writeFile('.gpgid', gpgId)

        term.brightCyan(`gpg store at ${utils.getBaseFolder()} ready\n`)
    } else {
        term.brightRed.error(`Unable to create ${path}\n`)
        term.dim.white.error(err)
        term.error('\n')
    }
}
