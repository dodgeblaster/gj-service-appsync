const logic = require('../logic')
const { checksum } = require('../../../utils')


const defaultSlsYml = {
    app: 'app',
    component: 'appsync',
    name: 'NEW API',
    inputs: {}
}


describe('buildStateLogic', () => {
    test('returns something', async () => {
        const slsYml = defaultSlsYml
        const slsState = 'EMPTY'
        const schema = ''
        const resolvers = {}
        const aws = {}

        const result = await logic({ slsYml, slsState, schema, resolvers, aws })

        expect(result.graphQLApi.rootResource).toBe('CREATE')
    })
})