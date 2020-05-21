const fs = require('fs')

module.exports = async (projectRoot) => {
    try {
        return require(projectRoot + '/src/code.js')
    } catch (e) {
        return {
            Query: {},
            Mutation: {}
        }
    }
}