
import fs from 'fs'


export default function availableEntries(baseDir, opts = {}) {
    try {
        const options = { files: true, folders: false, addTrailingSlash: true, ...opts }
        const baseLen = baseDir.length
        const files = filetree(baseDir, options)

        return files.map((f) => f.slice(baseLen + 1).replace(/\.gpg$/, '')).sort()
    } catch (e) {
        return []
    }
}

function filetree(path, options) {
    const results = []

    // incoming path must be a folder
    const dirStats = fs.lstatSync(path);
    if (!dirStats.isDirectory()) {
        throw new Error(path + ' must be a directory');
    }

    // Check the path is readable: throws if not
    fs.accessSync(path, fs.R_OK);

    // Get a list of files/folders in the folder
    const files = fs.readdirSync(path);
    const numFiles = files.length
    for (let i = 0; i < numFiles; i++) {
        try {
            if (files[i][0] === '.') {
                // Skip hidden files
                continue;
            }

            // full path
            const file = path + '/' + files[i];

            /// Exists? throws if not
            const fileStat = fs.lstatSync(file);

            // permission? (throws if not)
            fs.accessSync(file, fs.R_OK);

            // See if it is a directory
            const isDir = fileStat.isDirectory();
            if ((options.folders && isDir) || (options.files && !isDir)) {
                results.push(isDir && options.addTrailingSlash ? `${file}/` : file)
            }

            if (isDir) {
                // recurse into folders
                const subTree = filetree(file, options);
                results.push(...subTree)
            }
        } catch (e) {
            // Files does not exist or has no permission, or something else broke
            continue;
        }
    }

    return results
}
