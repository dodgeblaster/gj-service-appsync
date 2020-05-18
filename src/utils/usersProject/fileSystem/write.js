const fs = require('fs')

module.exports = (loc, content) => {
    const x = 'module.exports = ' + JSON.stringify(content)
    return new Promise((res, rej) => {
        fs.writeFile(loc, x, function (err) {
            if (err) rej(err)
            res('success')
        })
    })
}