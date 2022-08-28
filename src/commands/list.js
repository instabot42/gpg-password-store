import availableEntries from '../common/available-entries.js'
import { pathSeparator } from '../common/file-utils.js'
import treeify from 'treeify'
import terminal from 'terminal-kit';

const term = terminal.terminal

export default async function listCommand(options) {
    term.brightGreen('Password Store\n')

    const all = availableEntries(options.baseDir)

    if (all.length === 0) {
        term.dim.white('  empty\n')
    } else {
        const tree = {}

        all.forEach((entry) => {
            let node = tree
            entry.split(pathSeparator()).forEach((part) => {
                if (typeof node[part] !== 'object') {
                    node[part] = {}
                }

                node = node[part]
            })
        })

        term.brightCyan(treeify.asTree(tree))
    }
}