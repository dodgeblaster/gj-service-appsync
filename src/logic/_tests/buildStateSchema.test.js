const logic = require('../logic')
const { checksum } = require('../../../utils')

const defaultSlsYml = {
    app: 'app',
    component: 'appsync',
    name: 'NEW API',
    inputs: {}
}


describe('buildStateChema', () => {
    test('will create if state is not defined', async () => {
        const slsYml = defaultSlsYml
        const slsState = 'EMPTY'
        const schema = `Query Something...`
        const resolvers = {}
        const aws = {}

        const result = await logic({ slsYml, slsState, schema, resolvers, aws })

        expect(result.schema).toBe('CREATE')
    })

    test('will update if state and file are not the same', async () => {
        const slsYml = defaultSlsYml
        const slsState = {
            schemaChecksum: checksum(`Query Something...`)
        }
        const schema = `Query SomethingElse...`
        const resolvers = {}
        const aws = {}

        const result = await logic({ slsYml, slsState, schema, resolvers, aws })

        expect(result.schema).toBe('UPDATE')
    })

    test('will skip if state and file are the same', async () => {
        const slsYml = defaultSlsYml
        const slsState = {
            schemaChecksum: checksum(`Query Something...`)
        }
        const schema = `Query Something...`
        const resolvers = {}
        const aws = {}

        const result = await logic({ slsYml, slsState, schema, resolvers, aws })

        expect(result.schema).toBe('SKIP')
    })
})