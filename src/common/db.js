import { v4 as uuidv4 } from 'uuid'
import term from '../input/terminal.js'

const currentDBVersion = 3
const dbFilename = 'db'

export default class Database {
    /**
     * Set up an empty DB
     */
    constructor(fs, gpg) {
        // a FileServices
        this.fs = fs

        // the GPG class (encrypt and decrypt)
        this.gpg = gpg

        // create a default empty db
        this.db = {
            version: currentDBVersion,
            passwords: [],
            settings: [],
            gpgIds: [],
        }

        this.loaded = false
    }

    /**
     * If the DB does not exist, create a new one and saves it with the given keys
     * @param {*} idList
     */
    async initDB(idList) {
        if (this.fs.fileExists(dbFilename)) {
            // Already exists, so update the keys
            await this.load()

            const newKeys = this.parseIdList(idList)
            if (newKeys.length === 0) {
                throw new Error('Failed to update. No valid keys given.')
            }

            // show what we are changing
            term.muted(`Updating keys\nfrom ${this.db.gpgIds.join(', ')}\n`)
            term.muted(`to   ${newKeys.join(', ')}\n`)

            // update and save
            this.db.gpgIds = newKeys
            await this.save()

            // then re-encrypt every entry
            await this.reEncyptAll()
        } else {
            // No DB yet, so keep the keys and try and save
            this.db.gpgIds = this.parseIdList(idList)
            if (this.db.gpgIds.length === 0) {
                throw new Error('No valid key IDs given')
            }

            // save the DB
            await this.save()
        }
    }

    /**
     * Load in the DB from the filesystem
     * @returns
     */
    async load() {
        if (this.loaded) {
            return
        }

        // no db yet, save the empty one
        if (!this.fs.fileExists(dbFilename)) {
            // See if the old version of the file is still there (we changed from .db to db at some point)
            if (this.fs.fileExists('.db')) {
                term.muted('Found legacy DB file - moved to new version...\n')
                this.fs.renameFile('.db', dbFilename)
            } else {
                throw new Error("DB not found. use 'pass init' to setup DB")
            }
        }

        // notice, so we know to touch a yubikey
        term.muted('Decrypting db...\n')

        const dbEncrypted = this.fs.readFile(dbFilename)
        const dbJson = await this.gpg.decryptToString(dbEncrypted)

        this.validateOrFail(JSON.parse(dbJson))
        this.loaded = true
    }

    /**
     * Save the DB to disk (encrypted), backing up the old version
     */
    async save() {
        const dbJson = JSON.stringify(this.db)
        const dbEncrypted = await this.gpg.encrypt(dbJson, this.db.gpgIds)

        this.fs.writeWithBackup(dbFilename, dbEncrypted)
    }

    /**
     * Check that the loaded DB file appears to contain the data we need.
     * Will also offer a way to upgrade out of date databases by looking at the version numbers
     * @param {*} db
     */
    validateOrFail(db) {
        if (!db.version || !db.passwords || !db.settings || !Array.isArray(db.passwords)) {
            throw new Error('Database invalid')
        }

        // Version 1 did not have gpg keys inside the DB. Upgrade from v1 to current version
        if (db.version === 1) {
            // Get a cleaned gpg key name
            const gpgIdFileContents = this.fs.readFile('.gpgid')
            db.gpgIds = gpgIdFileContents
                .split(',')
                .map((v) => v.replace(/\s+/g, ''))
                .filter((v) => v !== '')
        }

        // Changed settings to an array in v3
        // Since it was not used before v3, we can just change it to an empty array
        if (db.version < 3) {
            db.settings = []
        }

        // Settings should be an array now
        if (!Array.isArray(db.settings)) {
            throw new Error('Database invalid (settings)')
        }

        // Saul Goodman
        this.db = {
            version: currentDBVersion,
            passwords: db.passwords,
            settings: db.settings,
            gpgIds: db.gpgIds,
        }
    }

    /**
     * How many keys are we encoding with
     * @returns
     */
    async getKeyCount() {
        await this.load()
        return this.db.gpgIds.length
    }

    /**
     * Get the key ids used to sign everything
     * @returns
     */
    async getKeyIds() {
        await this.load()
        return this.db.gpgIds
    }

    /**
     * Get a named setting (or null if no setting exists)
     * @returns
     */
    async getConfigValue(name) {
        await this.load()
        const index = this.db.settings.findIndex((s) => s.name === name)
        if (index === -1) {
            return null
        }

        return this.db.settings[index].value
    }

    /**
     * Update or add a specific settings into the DB
     * @param {*} name
     * @param {*} value
     */
    async setConfigValue(name, value) {
        await this.load()

        // replace the current value
        this.db.settings = this.db.settings.filter((s) => s.name !== name)
        this.db.settings.push({ name, value })

        // save db
        await this.save()
    }

    /**
     * Get all the password entries (just their id and title - no content)
     * @returns [{id, title}, ...]
     */
    async all() {
        await this.load()
        return this.db.passwords
    }

    async allTitles() {
        await this.load()
        return this.db.passwords.map((p) => p.title)
    }

    async titleToId(title) {
        if (!title) {
            return null
        }

        const all = await this.all()
        const i = all.findIndex((item) => item.title === title)
        if (i === -1) {
            return null
        }

        return all[i].id
    }

    async idToTitle(id) {
        if (!id) {
            return null
        }

        const all = await this.all()

        const i = all.findIndex((p) => p.id === id)
        if (i === -1) {
            return null
        }

        return all[i].title
    }

    /**
     * Inserts a new entry in the DB
     * Writes the content to disk (encrypted)
     * Saves the DB back to disk (also encrypted)
     * @param {*} title
     * @param {*} content
     * @param {*} filename
     * @returns id of the new entry
     */
    async insert(title, content, filename = null) {
        await this.load()

        // generate new id
        const id = uuidv4()

        // encrypt the content
        const encrypted = await this.gpg.encrypt(content, this.db.gpgIds)

        // write the content to disk
        this.fs.writeFile(id, encrypted)

        // insert entry into db
        const now = Date.now()
        this.db.passwords.push({
            id,
            title,
            filename,
            createdAt: now,
            accessedAt: now,
            modifiedAt: now,
        })

        // save db
        await this.save()

        return id
    }

    /**
     * Gets the content linked to a DB entry (decrypted)
     * Throws errors if the id is bad, or the content is missing, or decryption fails
     * @param {*} id
     * @returns string
     */
    async get(id) {
        const encrypted = await this.getEncryptedContent(id)
        return this.gpg.decryptToString(encrypted)
    }

    async getBinary(id) {
        const encrypted = await this.getEncryptedContent(id)
        return this.gpg.decrypt(encrypted)
    }

    async getEncryptedContent(id) {
        await this.load()

        // look up the id in the db
        const i = this.db.passwords.findIndex((p) => p.id === id)
        if (i === -1) {
            throw new Error(`No password entry with id ${id}`)
        }

        if (!this.fs.fileExists(id)) {
            throw new Error(`No content file for id ${id}`)
        }

        // update access times
        this.db.passwords[i].accessedAt = Date.now()
        await this.save()

        term.muted('Decrypting record...\n')

        // get the contents of id (decrypted)
        return this.fs.readFile(id)
    }

    /**
     * Is this record a file?
     * @param {*} id
     * @returns
     */
    async idToFilename(id) {
        await this.load()

        // look up the id in the db
        const i = this.db.passwords.findIndex((p) => p.id === id)
        if (i === -1) {
            return null
        }

        if (!this.db.passwords[i].filename) {
            return null
        }

        return this.db.passwords[i].filename
    }

    /**
     * Updates an existing entry
     * Throws an error if the entry is missing
     * Saves the new content to disk (encrypted)
     * Updates the DB and saves that too (encrypted)
     * @param {*} id
     * @param {*} title
     * @param {*} content
     * @returns
     */
    async update(id, content, modified = true) {
        await this.load()

        // look up the id in the db
        const i = this.db.passwords.findIndex((p) => p.id === id)
        if (i === -1) {
            throw new Error(`No password entry with id ${id}`)
        }

        if (!this.fs.fileExists(id)) {
            throw new Error(`No content file for id ${id}`)
        }

        // encrypt and write the content
        const encrypted = await this.gpg.encrypt(content, this.db.gpgIds)
        this.fs.writeFile(id, encrypted)

        if (modified) {
            this.db.passwords[i].modifiedAt = Date.now()
        }

        // save db
        await this.save()
        return id
    }

    async rename(id, newTitle) {
        await this.load()

        // look up the id in the db
        const i = this.db.passwords.findIndex((p) => p.id === id)
        if (i === -1) {
            throw new Error(`No password entry with id ${id}`)
        }

        // update the name
        this.db.passwords[i].title = newTitle
        this.db.passwords[i].modifiedAt = Date.now()

        // save db
        await this.save()
        return id
    }

    /**
     * Delete an existing entry from the DB
     * Throws errors if the entry does not exist
     * Deletes the content file and removes the entry from the DB
     * The DB is saved (encrypted)
     * @param {*} id
     */
    async delete(id) {
        await this.load()

        // look up the id in the db
        const i = this.db.passwords.findIndex((p) => p.id === id)
        if (i === -1) {
            throw new Error(`No password entry with id ${id}`)
        }

        if (!this.fs.fileExists(id)) {
            throw new Error(`No content file for id ${id}`)
        }

        if (this.fs.deleteFile(id)) {
            this.db.passwords = this.db.passwords.filter((p) => p.id !== id)
        }

        // save db
        await this.save()
    }

    /**
     * Does the given id exist in the DB
     * @param {*} id
     * @returns true|false
     */
    async exists(id) {
        await this.load()

        // look up the id in the db
        const i = this.db.passwords.findIndex((p) => p.id === id)
        if (i === -1) {
            return false
        }

        if (!this.fs.fileExists(id)) {
            return false
        }

        return true
    }

    /**
     * decrypt all entries, and re-encrypt them with the current set of keys
     */
    async reEncyptAll() {
        await this.load()
        for (const p of this.db.passwords) {
            term.bright(`re-encrypting ${p.title}\n`)
            const content = await this.get(p.id)
            await this.update(p.id, content, false)
        }
    }

    parseIdList(ids) {
        return ids
            .split(',')
            .map((v) => v.replace(/\s+/g, ''))
            .filter((v) => v !== '')
    }
}
