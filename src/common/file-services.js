import path from 'path'
import os from 'os'
import fs from 'fs'

// Global holding the base folder (set below)
let baseDir = ''

export default class FileServices {
    static getBaseFolder() {
        return baseDir
    }

    static resolvePath(filePath) {
        if (!filePath || typeof filePath !== 'string') {
            return ''
        }

        // '~/folder/path' or '~' not '~alias/folder/path'
        if (filePath.startsWith('~/') || filePath === '~') {
            return filePath.replace('~', os.homedir())
        }

        return path.resolve(filePath)
    }

    static fileExists(filename) {
        try {
            fs.readFileSync(`${baseDir}${filename}`)
            return true
        } catch (err) {
            // does not exist, or some of ther error (permission)
        }

        return false
    }

    static deleteFile(filename) {
        try {
            fs.unlinkSync(`${baseDir}${filename}`)
            return true
        } catch (err) {
            return false
        }
    }

    static createBaseFolder() {
        return FileServices.ensureFolderExists(baseDir)
    }

    static ensureFolderExists(folder) {
        try {
            fs.mkdirSync(folder, { recursive: true })
            return true
        } catch (err) {
            return false
        }
    }

    static pathSeparator() {
        return path.sep
    }

    static writeFile(filename, content) {
        return fs.writeFileSync(`${baseDir}${filename}`, content)
    }

    static readFile(filename) {
        return fs.readFileSync(`${baseDir}${filename}`).toString()
    }

    static writeWithBackup(filename, content) {
        if (!FileServices.fileExists(filename)) {
            // if the file does not exist yet, just do a normal write operation
            return writeFile(filename, content)
        }

        FileServices.ensureFolderExists(`${baseDir}bak/`)
        const timestamp = Date.now().valueOf()
        const backupName = `bak/${filename}.${timestamp}.bak`

        // remove the existing backup file (if it exists)
        if (FileServices.fileExists(backupName)) {
            fs.unlinkSync(`${baseDir}${backupName}`)
        }

        // move the existing file to the backup file
        fs.renameSync(`${baseDir}${filename}`, `${baseDir}${backupName}`)

        // write the new file
        return FileServices.writeFile(filename, content)
    }
}

function setBaseFolder(folder) {
    baseDir = FileServices.resolvePath(folder)
    if (!baseDir.endsWith(path.sep)) {
        baseDir += path.sep
    }
}

setBaseFolder(process.env.GPG_PASS_DIR || '~/.gpg-store')
