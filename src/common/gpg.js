import { spawn } from 'node:child_process'

async function executeGPG(input, args) {
    return new Promise((resolve, reject) => {
        const gpgArgs = args || []
        const buffers = []
        let buffersLength = 0
        let error = ''

        // Spawn GPG command line
        const gpg = spawn('gpg', gpgArgs)

        // Handle different events
        // Errors
        gpg.on('error', (err) => reject(err))

        // Normal output
        gpg.stdout.on('data', (buf) => {
            buffers.push(buf)
            buffersLength += buf.length
        })

        // Error output
        gpg.stderr.on('data', (buf) => (error += buf.toString('utf8')))

        // Command closed
        gpg.on('close', (code) => {
            var msg = Buffer.concat(buffers, buffersLength)
            if (code !== 0) {
                // If error is empty, we probably redirected stderr to stdout (for verifySignature, import, etc)
                return reject(new Error(error || msg))
            }

            resolve({ msg, error })
        })

        // pass the input
        gpg.stdin.end(input)
    })
}

export default class Gpg {
    static async encrypt(content, ids) {
        // All the keys are receipient (so any of them can decrypt)
        const options = ids.map((id) => `-r ${id}`)

        // What we want to do...
        options.push('--encrypt')
        options.push('--armor')

        // Don't include information in the encrypted file about WHO can decrypt them
        // Means that decrypt just has to try all known keys to see if any of them work.
        // Might be good as an option, as it make the encrypted data harder to target
        // options.push('--throw-keyids')

        // Actually do the work
        const response = await executeGPG(content, options)

        // return the encrypted message
        return response.msg.toString()
    }

    static async decrypt(content) {
        // What we want to do
        const options = ['--armor', '--decrypt']

        // If throw-keyids was used, to prevent gpg trying every key you have, you can
        // set '--default-key name', which it try first
        // To give it a list of keys to try, use many '--try-secret-key name'

        // Do the work
        const response = await executeGPG(content, options)

        // return the clear text message
        return response.msg.toString()
    }
}
