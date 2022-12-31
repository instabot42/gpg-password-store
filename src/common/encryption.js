import gpg from 'gpg'

export function encrypt(content, id) {
    return new Promise((resolve, reject) => {
        gpg.encrypt(
            content,
            [`-r ${id}`, '--armor'], // "--throw-keyids"
            (err, msg, stderr) => {
                if (err) {
                    return reject(new Error(err))
                }

                return resolve(msg.toString())
            }
        )
    })
}

export function decrypt(content, id) {
    return new Promise((resolve, reject) => {
        gpg.decrypt(content, ['--armor'], (err, msg, stderr) => {
            if (err) {
                return reject(new Error(err))
            }

            return resolve(msg.toString())
        })
    })
}
