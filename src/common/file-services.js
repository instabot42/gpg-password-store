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

    static filenameFromPath(fullpath) {
        return path.basename(fullpath)
    }

    static fullPathExists(fullpath) {
        try {
            fs.readFileSync(fullpath)
            return true
        } catch (err) {
            // does not exist, or some of ther error (permission)
        }

        return false
    }

    static fileExists(filename) {
        return FileServices.fullPathExists(`${baseDir}${filename}`)
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

    static writeFileFullPathWithRefCount(fullpath, content) {
        let refCount = 0
        let name = fullpath
        const maxTries = 40
        while (refCount < maxTries && FileServices.fullPathExists(name)) {
            refCount += 1
            name = `${fullpath}.${refCount}`
        }

        if (refCount >= maxTries) {
            throw new Error(`Unable to write to ${fullpath}. File exists already.`)
        }

        fs.writeFileSync(name, content)

        return name
    }

    static writeFile(filename, content) {
        return fs.writeFileSync(`${baseDir}${filename}`, content)
    }

    static readFileRaw(fullPath) {
        return fs.readFileSync(fullPath)
    }

    static readFile(filename) {
        return fs.readFileSync(`${baseDir}${filename}`).toString()
    }

    static writeWithBackup(filename, content) {
        if (!FileServices.fileExists(filename)) {
            // if the file does not exist yet, just do a normal write operation
            return FileServices.writeFile(filename, content)
        }

        // prepare the backup folder
        FileServices.rotateBackupFolder()

        // pick a name
        const timestamp = Date.now().valueOf()
        const backupName = `bak/${filename}.${timestamp}.bak`

        // remove the existing backup file (if it exists)
        if (FileServices.fileExists(backupName)) {
            fs.unlinkSync(`${baseDir}${backupName}`)
        }

        // move the existing file to the backup file
        FileServices.renameFile(filename, backupName)

        // write the new file
        return FileServices.writeFile(filename, content)
    }

    static renameFile(from, to) {
        fs.renameSync(`${baseDir}${from}`, `${baseDir}${to}`)
    }

    static rotateBackupFolder() {
        // Keep the last N files in the backup folder
        const backupFolder = `${baseDir}bak/`
        FileServices.ensureFolderExists(backupFolder)

        // Find all the backup files
        const filenames = fs.readdirSync(backupFolder).sort()
        if (filenames.length < 25) {
            // less than 25, so leave it
            return
        }

        // clear down to 20 (so we clear out 5 from time to time)
        const toDelete = filenames.slice(0, filenames.length - 20)
        toDelete.forEach((file) => {
            const filename = `${backupFolder}${file}`
            fs.unlinkSync(filename)
        })
    }
}

function setBaseFolder(folder) {
    baseDir = FileServices.resolvePath(folder)
    if (!baseDir.endsWith(path.sep)) {
        baseDir += path.sep
    }
}

setBaseFolder(process.env.GPG_PASS_DIR || '~/.gpg-store')
