import path from 'path';
import os from 'os';
import fs from 'fs'

let baseDir = ''

export function setBaseFolder(folder) {
    baseDir = resolvePath(folder)
    if (!baseDir.endsWith(path.sep)) {
        baseDir += path.sep
    }
}

setBaseFolder(process.env.GPG_PASS_DIR || '~/.gpg-store')

export function getBaseFolder() {
    return baseDir
}

function resolvePath(filePath) {
    if (!filePath || typeof (filePath) !== 'string') {
        return ''
    }

    // '~/folder/path' or '~' not '~alias/folder/path'
    if (filePath.startsWith('~/') || filePath === '~') {
        return filePath.replace('~', os.homedir())
    }

    return path.resolve(filePath)
}


export function fileExists(filename) {
    try {
        fs.readFileSync(`${baseDir}${filename}`)
        return true
    } catch (err) {
        // does not exist, or some of ther error (permission)
    }

    return false
}

export function deleteFile(filename) {
    try {
        fs.unlinkSync(`${baseDir}${filename}`)
        return true
    } catch (err) {
        return false
    }
}

export function createBaseFolder() {
    try {
        fs.mkdirSync(baseDir, { recursive: true })
        return true
    } catch (err) {
        return false
    }
}

export function pathSeparator() {
    return path.sep
}

export function writeFile(filename, content) {
    return fs.writeFileSync(`${baseDir}${filename}`, content)
}

export function readFile(filename) {
    return fs.readFileSync(`${baseDir}${filename}`).toString()
}

export function writeWithBackup(filename, content) {
    if (!fileExists(filename)) {
        // if the file does not exist yet, just do a normal write operation
        return writeFile(filename, content)
    }

    const backupName = filename + '.bak'

    // remove the existing backup file (if it exists)
    if (fileExists(backupName)) {
        fs.unlinkSync(`${baseDir}${backupName}`)
    }

    // move the existing file to the backup file
    fs.renameSync(`${baseDir}${filename}`, `${baseDir}${backupName}`)

    // write the new file
    return writeFile(filename, content)
}