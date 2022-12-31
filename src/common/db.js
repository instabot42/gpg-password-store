import { v4 as uuidv4 } from 'uuid'
import { encrypt, decrypt } from './encryption.js'
import * as utils from '../common/file-utils.js'

export default class Database {
    /**
     * Set up an empty DB
     */
    constructor() {
        // Get a cleaned gpg key name
        const gpgIdFileContents = utils.readFile('.gpgid')
        const ids = gpgIdFileContents.split(',')
        this.gpgIds = ids.map((v) => v.replace(/\s+/g, '')).filter((v) => v !== '')
        console.log(this.gpgIds)

        // create a default empty db
        this.db = {
            version: 1,
            passwords: [],
            settings: {},
        }

        this.loaded = false
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
        if (!utils.fileExists('.db')) {
            return this.save()
        }

        const dbEncrypted = utils.readFile('.db')
        const dbJson = await decrypt(dbEncrypted)

        this.validateOrFail(JSON.parse(dbJson))
        this.loaded = true
    }

    /**
     * Save the DB to disk (encrypted), backing up the old version
     */
    async save() {
        const dbJson = JSON.stringify(this.db)
        const dbEncrypted = await encrypt(dbJson, this.gpgIds)

        utils.writeWithBackup('.db', dbEncrypted)
    }

    /**
     * Check that the loaded DB file appears to contain the data we need.
     * Will also offer a way to upgrade out of date databases by looking at the version numbers
     * @param {*} db
     */
    validateOrFail(db) {
        if (
            !db.version ||
            !db.passwords ||
            !db.settings ||
            !Array.isArray(db.passwords) ||
            typeof db.settings !== 'object'
        ) {
            throw new Error('Database invalid')
        }

        // Saul Goodman
        this.db = { version: db.version, passwords: db.passwords, settings: db.settings }
    }

    /**
     * Get all the settings stored in the DB
     * @returns
     */
    async getConfig() {
        await this.load()
        return this.settings
    }

    /**
     * Update or add a specific settings into the DB
     * @param {*} name
     * @param {*} value
     */
    async setConfig(name, value) {
        await this.load()
        this.settings[name] = value

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
        const all = await this.all()

        const i = all.findIndex((item) => item.title === title)
        if (i === -1) {
            return null
        }

        return all[i].id
    }

    /**
     * Creates a new entry in the DB
     * Writes the content to disk (encrypted)
     * Saves the DB back to disk (also encrypted)
     * @param {*} title
     * @param {*} content
     * @returns id of the new entry
     */
    async create(title, content) {
        await this.load()

        // generate new id
        const id = uuidv4()

        // encrypt the content
        const encrypted = await encrypt(content, this.gpgIds)

        // write the content to disk
        utils.writeFile(id, encrypted)

        // insert entry into db
        this.db.passwords.push({ id, title })

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
        await this.load()

        // look up the id in the db
        const i = this.db.passwords.findIndex((p) => p.id === id)
        if (i === -1) {
            throw new Error(`No password entry with id ${id}`)
        }

        if (!utils.fileExists(id)) {
            throw new Error(`No content file for id ${id}`)
        }

        // get the contents of id (decrypted)
        const encrypted = utils.readFile(id)
        return decrypt(encrypted)
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
    async update(id, title, content) {
        await this.load()

        // look up the id in the db
        const i = this.db.passwords.findIndex((p) => p.id === id)
        if (i === -1) {
            throw new Error(`No password entry with id ${id}`)
        }

        if (!utils.fileExists(id)) {
            throw new Error(`No content file for id ${id}`)
        }

        // encrypt and write the content
        const encrypted = await encrypt(content, this.gpgIds)
        utils.writeFile(id, encrypted)

        // update the db
        this.db.passwords[i].title = title

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

        if (!utils.fileExists(id)) {
            throw new Error(`No content file for id ${id}`)
        }

        if (utils.deleteFile(id)) {
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

        if (!utils.fileExists(id)) {
            return false
        }

        return true
    }
}
