import path from 'path';
import os from 'os';
import fs from 'fs'

export function resolvePath(filePath) {
    if (!filePath || typeof (filePath) !== 'string') {
        return ''
    }

    // '~/folder/path' or '~' not '~alias/folder/path'
    if (filePath.startsWith('~/') || filePath === '~') {
        return filePath.replace('~', os.homedir())
    }

    return path.resolve(filePath)
}

export function isFilenameAvailable(filePath) {
    try {
        const fileStat = fs.lstatSync(filePath);
        return false
    } catch (err) {
        if (err.code !== 'ENOENT') {
            // Something else went wrong, so treat as the file is not available
            return false
        }
    }

    return true
}

export function fileExists(filePath) {
    try {
        fs.readFileSync(filePath)
        return true
    } catch (err) {
        // does not exist, or some of ther error (permission)
    }

    return false
}

export function deleteFile(filePath) {
    try {
        fs.unlinkSync(filePath)
        return true
    } catch (err) {
        return false
    }
}

export function createDeepFolder(folder) {
    try {
        fs.mkdirSync(folder, { recursive: true })
        return true
    } catch (err) {
        return false
    }
}

export function createFileFolder(filePath) {
    try {
        const folder = path.dirname(filePath)
        return createDeepFolder(folder)
    } catch (err) {
        return false
    }
}

export function pathSeparator() {
    return path.sep
}

export function writeFile(fullpath, content) {
    return fs.writeFileSync(fullpath, content)
}

export function readFile(fullpath, content) {
    return fs.readFileSync(fullpath).toString()
}