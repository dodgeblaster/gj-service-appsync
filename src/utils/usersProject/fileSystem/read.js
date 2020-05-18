const fs = require('fs')

module.exports = (loc) => {
    return new Promise((res, rej) => {
        fs.readFile(loc, 'utf8', function (err, data) {
            if (err) {
                rej(err)
            }
            res(data)
        })
    })
}


