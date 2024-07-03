import {expect, use} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import generateOTP from '../src/common/totp.js'

use(chaiAsPromised)

describe('Database', () => {
    beforeEach(() => {})

    afterEach(() => {})

    it('It can generate a totp token', async () => {
        const key = 'abCDEFGHIJKLMNOPQRSTUVWXYZ234567'

        expect(generateOTP(key, 1674946081000)).to.be.equal('541294')
        expect(generateOTP(key, 1674946071000)).to.be.equal('966651')
        expect(generateOTP(key, 1674946061000)).to.be.equal('966651')
        expect(generateOTP(key, 1674976241000)).to.be.equal('034420')
    })

    it('It can generate a totp with long base32 strings', async () => {
        const key = 'KN2HE2LQEBXWMZRAORUGKIDFPB2HEYJAOBQWIZDJNZTSA33OEB2GQZJAMVXGI==='

        expect(generateOTP(key, 1674946081000)).to.be.equal('404758')
        expect(generateOTP(key, 1674946071000)).to.be.equal('691703')
        expect(generateOTP(key, 1674946061000)).to.be.equal('691703')
        expect(generateOTP(key, 1674976241000)).to.be.equal('382415')
    })
})
