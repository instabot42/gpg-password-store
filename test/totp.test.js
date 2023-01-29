import sinon from 'sinon'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import generateOTP from '../src/common/totp.js'

chai.use(chaiAsPromised)
const expect = chai.expect
const assert = sinon.assert

describe('Database', () => {
    beforeEach(() => {})

    afterEach(() => {})

    it('It can generate a totp token', async () => {
        const key = '12345678901234567890'
        const time = 1674946081000
        expect(generateOTP(key, time)).to.be.equal('072715')
    })
})
