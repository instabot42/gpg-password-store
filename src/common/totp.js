import crypto from 'node:crypto'

// base32 table to map a character (like A) to it's 5 bit value
const charMap = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    F: 5,
    G: 6,
    H: 7,
    I: 8,
    J: 9,
    K: 10,
    L: 11,
    M: 12,
    N: 13,
    O: 14,
    P: 15,
    Q: 16,
    R: 17,
    S: 18,
    T: 19,
    U: 20,
    V: 21,
    W: 22,
    X: 23,
    Y: 24,
    Z: 25,
    2: 26,
    3: 27,
    4: 28,
    5: 29,
    6: 30,
    7: 31,
}

/**
 * Convert a base32 encoded string to a Buffer
 * @param {*} msg
 * @returns
 */
function base32ToBuffer(msg) {
    // Give up quick if we can
    if (msg === '') {
        return Buffer.from([])
    }

    const regex = /^[A-Z2-7=]+$/i
    if (!regex.test(msg)) {
        throw new Error('Invalid base32 string')
    }

    // Get rid of the = padding characters now
    let base32Str = msg.replace(/=/g, '').toUpperCase()

    // 8 characters in the message = 5 bytes in the output
    const strLen = base32Str.length
    const byteLen = Math.floor((strLen * 5) / 8)
    let blocks = Math.floor(strLen / 8)
    const remain = byteLen - blocks * 5

    // If there is a part block at the end, pad it with 0 bits and
    // we'll slice off the extra bytes generated at the end
    if (remain > 0) {
        blocks += 1
        let pad = 8 - remain
        while (pad > 0) {
            base32Str += 'A'
            pad -= 1
        }
    }

    // Convert each 8 character block into 5 bytes
    const base32Arr = base32Str.split('')
    const bytes = []
    for (let i = 0; i < blocks; i += 1) {
        // Extract the 8 chars for this block
        const offset = i * 8
        const c1 = charMap[base32Arr[offset + 0]]
        const c2 = charMap[base32Arr[offset + 1]]
        const c3 = charMap[base32Arr[offset + 2]]
        const c4 = charMap[base32Arr[offset + 3]]
        const c5 = charMap[base32Arr[offset + 4]]
        const c6 = charMap[base32Arr[offset + 5]]
        const c7 = charMap[base32Arr[offset + 6]]
        const c8 = charMap[base32Arr[offset + 7]]

        // Shuffle the bits around to assemble the 5 bytes produced
        bytes.push(((c1 << 3) | (c2 >>> 2)) & 255)
        bytes.push(((c2 << 6) | (c3 << 1) | (c4 >>> 4)) & 255)
        bytes.push(((c4 << 4) | (c5 >>> 1)) & 255)
        bytes.push(((c5 << 7) | (c6 << 2) | (c7 >>> 3)) & 255)
        bytes.push(((c7 << 5) | c8) & 255)
    }

    // Strip off the extra padding on the end
    return Buffer.from(bytes.slice(0, byteLen))
}

/**
 * Generates a 2FA TOTP value using the given secret (base32 encoded)
 * @param {*} keyBase32
 * @param {*} time - the current time (in ms, eg Date.now())
 * @returns
 */
export default function generateOTP(keyBase32, time) {
    // decode the key
    const key = base32ToBuffer(keyBase32)

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
    const digest = crypto.createHmac('sha1', key).update(b).digest('hex')

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
