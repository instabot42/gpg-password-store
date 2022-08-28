import gpg from 'gpg'



export function encrypt(content, id) {
    return new Promise((resolve, reject) => {
        gpg.encrypt(content, [`-r ${id}`, '-a'], (err, msg, stderr) => {
            if (err) {
                reject(new Error('Problem encrypting data'))
            }

            resolve(msg.toString())
        })
    })
}


export function decrypt(content, id) {
    return new Promise((resolve, reject) => {
        gpg.decrypt(content, [`-r ${id}`], (err, msg, stderr) => {
            if (err) {
                reject(new Error('Problem decrypting data'))
            }

            resolve(msg.toString())
        })
    })
}