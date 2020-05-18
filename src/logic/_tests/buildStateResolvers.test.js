const logic = require('../logic')
const { checksum } = require('../../../utils')

const defaultSlsYml = {
    app: 'app',
    component: 'appsync',
    name: 'NEW API',
    inputs: {}
}


describe('buildStateDatasources', () => {
    test('will add lambda datasource to create array if state is empty', async () => {
        const slsYml = defaultSlsYml
        const slsState = 'EMPTY'
        const schema = `Query Something...`
        const resolvers = {}
        const aws = {}

        const result = await logic({ slsYml, slsState, schema, resolvers, aws })
        expect(result.datasources.create).toEqual([
            {
                "iamRole": "CREATE",
                "name": "NEWAPIlambdadatasource",
                "type": "LAMBDA",
            },
        ])

        expect(result.datasources.update).toEqual([])
        expect(result.datasources.remove).toEqual([])
    })

    test.skip('will include no items in create array if state is not empty', async () => {
        const slsYml = defaultSlsYml
        const slsState = {
            schemaChecksum: checksum(`Query Something...`)
        }
        const schema = `Query Something...`
        const resolvers = {}
        const aws = {}

        const result = await logic({ slsYml, slsState, schema, resolvers, aws })
        expect(result.datasources.create).toEqual([])
        expect(result.datasources.update).toEqual([])
        expect(result.datasources.remove).toEqual([])
    })
})