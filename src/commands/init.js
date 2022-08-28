import terminal from 'terminal-kit';
import * as utils from '../common/file-utils.js'
const term = terminal.terminal

export default function initCommand(gpgidRaw, options) {
    const baseDir = utils.resolvePath(options.dir)
    if (utils.createDeepFolder(baseDir)) {
        const idFilename = `${baseDir}${utils.pathSeparator()}.gpgid`
        if (utils.fileExists(idFilename)) {
            throw new Error('The folder has already been initialised')
        }

        // Sanitise the key name a bit
        const regex = /[^\w. -]/gi;
        const gpgId = gpgidRaw.replace(regex, '');

        utils.writeFile(`${baseDir}${utils.pathSeparator()}.gpgid`, gpgId)
        term.brightCyan(`gpg store at ${baseDir} ready\n`)
    } else {
        term.brightRed.error(`Unable to create ${path}\n`)
        term.dim.white.error(err)
        term.error('\n')
    }
}
