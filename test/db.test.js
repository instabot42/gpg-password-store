import Database from '../src/common/db.js'
import sinon from 'sinon'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const expect = chai.expect

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
})
