import gpg from 'gpg'

export default class Gpg {
    static encrypt(content, ids) {
        return new Promise((resolve, reject) => {
            const options = ids.map((id) => `-r ${id}`)
            options.push('--armor')
            // options.push('--throw-keyids')
            gpg.encrypt(content, options, (err, msg, stderr) => {
                if (err) {
                    return reject(new Error(err))
                }

                return resolve(msg.toString())
            })
        })
    }

    static decrypt(content) {
        return new Promise((resolve, reject) => {
            gpg.decrypt(content, ['--armor'], (err, msg, stderr) => {
                if (err) {
                    return reject(new Error(err))
                }

                return resolve(msg.toString())
            })
        })
    }
}
