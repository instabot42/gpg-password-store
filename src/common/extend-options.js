import * as utils from './file-utils.js'


export default function extendOptions(opts) {
    try {
        const baseDir = utils.resolvePath(opts.dir)
        const gpgIdFileContents = utils.readFile(`${baseDir}${utils.pathSeparator()}.gpgid`)

        // strip anything except letters etc
        const regex = /[^\w. -]/gi;
        const gpgId = gpgIdFileContents.replace(regex, '');

        return {
            ...opts,
            baseDir,
            gpgId
        }
    } catch (err) {
        throw new Error('Problem finding config. Have you used "init" yet. See help for more.')
    }
}