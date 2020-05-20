const resolvers = require('./code')

module.exports.handler = async (event) => {
    try {
        const x = await resolvers
        [event.info.parentTypeName]
        [event.info.fieldName]
            (event)

        return x
    } catch (e) {
        throw new Error(e)
    }
}