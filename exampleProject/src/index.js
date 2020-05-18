const resolvers = require('./resolvers')

module.exports.handler = async (event) => {
    try {
        // const path = './resolvers/' + event.info.parentTypeName + '/' + event.info.fieldName + '.js'
        // const resolver = require(path)
        const x = await resolvers
        [event.info.parentTypeName]
        [event.info.fieldName]
            (event)

        return x
    } catch (e) {
        throw new Error(e)
        // error handling that covers missing resolver file
    }
}