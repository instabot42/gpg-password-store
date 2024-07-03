import Database from '../src/common/db.js'
import sinon from 'sinon'
import {expect, use} from 'chai'
import chaiAsPromised from 'chai-as-promised'

use(chaiAsPromised)

describe('Database', () => {
    beforeEach(() => {})

    afterEach(() => {})

    it('It can spot a bad database', async () => {
        const fs = {
            fileExists: sinon.stub().returns(true),
            readFile: sinon.stub().returns(''),
        }

        const gpg = {
            decrypt: sinon.stub().returns('{}'),
        }

        const db = new Database(fs, gpg)
        expect(db.load()).to.be.rejected
    })

    it('It can read a missing config value', async () => {
        const fs = {
            fileExists: sinon.stub().returns(true),
            readFile: sinon.stub().returns(''),
        }

        const gpg = {
            decryptToString: sinon
                .stub()
                .returns('{"version":3,"passwords":[], "gpgIds": [], "settings":[]}'),
        }

        const db = new Database(fs, gpg)
        expect(await db.getConfigValue('test')).to.be.equal(null)
    })

    it('It can read a config value', async () => {
        const fs = {
            fileExists: sinon.stub().returns(true),
            readFile: sinon.stub().returns(''),
        }

        const dbcontent = {
            version: 3,
            passwords: [],
            gpgIds: [],
            settings: [{ name: 'test', value: '42' }],
        }
        const gpg = {
            decryptToString: sinon.stub().returns(JSON.stringify(dbcontent)),
        }

        const db = new Database(fs, gpg)
        expect(await db.getConfigValue('test')).to.be.equal('42')
    })

    it('It can update a config value', async () => {
        const fs = {
            writeWithBackup: sinon.stub().returns(true),
            fileExists: sinon.stub().returns(true),
            readFile: sinon.stub().returns(''),
        }

        const dbcontent = {
            version: 3,
            passwords: [],
            gpgIds: [],
            settings: [{ name: 'test', value: '42' }],
        }

        const dbExpected = {
            version: 3,
            passwords: [],
            settings: [{ name: 'test', value: 'fish' }],
            gpgIds: [],
        }

        const gpg = {
            decryptToString: sinon.stub().returns(JSON.stringify(dbcontent)),
            encrypt: sinon.stub().returns(''),
        }

        const db = new Database(fs, gpg)
        await db.setConfigValue('test', 'fish')

        sinon.assert.calledWith(gpg.encrypt, JSON.stringify(dbExpected), [])
    })
})
