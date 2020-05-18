const fs = require('fs')

module.exports = async (projectRoot) => {
    try {
        return require(projectRoot + '/src/resolvers.js')
    } catch (e) {
        return {
            Query: {},
            Mutation: {}
        }
    }
}