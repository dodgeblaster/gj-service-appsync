const fs = require('fs')

module.exports = async (projectRoot) => {
    return fs.readFileSync(projectRoot + '/src/schema.graphql', 'utf8')
}