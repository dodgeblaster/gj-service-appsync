const fs = require('fs')

module.exports = async (projectRoot) => {
    return fs.readFileSync(projectRoot + '/src/api.graphql', 'utf8')
}