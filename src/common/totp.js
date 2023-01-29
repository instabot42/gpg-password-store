import crypto from 'node:crypto'
import base32 from 'thirty-two'

const base32Decode = base32.default.decode

export default function generateOTP(keyBase32, time) {
    // decode the key
    const key = base32Decode(keyBase32)

    // Counter for the time
    let counter = Math.floor(time / 1000 / 30)

    // get the counter as bytes in a buffer
    const counterBytes = new Array(8)
    for (let i = 7; i >= 0; i--) {
        counterBytes[i] = counter & 0xff
        counter = counter >> 8
    }
    const b = Buffer.from(counterBytes)

    // calculate sha1 hmac
    const digest = crypto.createHmac('sha1', Buffer.from(key)).update(b).digest('hex')

    // get the digest as bytes
    const bytes = []
    for (let i = 0; i < digest.length; i += 2) {
        bytes.push(parseInt(digest.slice(i, i + 2), 16))
    }

    // Extract the current token from the results
    const offset = bytes[19] & 0xf
    let tokenVal =
        ((bytes[offset] & 0x7f) << 24) |
        ((bytes[offset + 1] & 0xff) << 16) |
        ((bytes[offset + 2] & 0xff) << 8) |
        (bytes[offset + 3] & 0xff)

    // Clamp and convert to a string and zero pad it
    let str = `${tokenVal % 1000000}`
    while (str.length < 6) {
        str = '0' + str
    }

    return str
}
