const logic = require('../logic')
const { checksum } = require('../../../utils')


const defaultSlsYml = {
    app: 'app',
    component: 'appsync',
    name: 'NEW API',
    inputs: {}
}


describe('buildStateLogic', () => {
    test('will CREATE iam role if state is empty', async () => {
        const slsYml = defaultSlsYml
        const slsState = 'EMPTY'
        const schema = ''
        const resolvers = {}
        const aws = {}

        const result = await logic({ slsYml, slsState, schema, resolvers, aws })
        expect(result.monolambda.iamRole).toBe('CREATE')
    })

    test('will skip iam role if defined in state', async () => {
        const slsYml = defaultSlsYml
        const slsState = {
            lambdaRole: '1234'
        }
        const schema = ''
        const resolvers = {}
        const aws = {}

        const result = await logic({ slsYml, slsState, schema, resolvers, aws })
        expect(result.monolambda.iamRole).toBe('SKIP')
    })

    test('will skip update config if they are the same', async () => {
        const slsYml = {
            app: 'app',
            component: 'appsync',
            name: 'NEW API',
            inputs: {
                environment: [
                    {
                        ENV1: '1'
                    },
                    {
                        ENV2: '2'
                    }
                ]
            }
        }
        const slsState = {
            lambdaRole: '1234',
            lambdaEnvironment: checksum(JSON.stringify(slsYml.inputs.environment))
        }
        const schema = ''
        const resolvers = {}
        const aws = {}

        const result = await logic({ slsYml, slsState, schema, resolvers, aws })
        expect(result.monolambda.lambdaConfig).toBe('SKIP')
    })

    test('will skip update config if they are the same', async () => {
        const slsYml = {
            app: 'app',
            component: 'appsync',
            name: 'NEW API',
            inputs: {
                environment: [
                    {
                        ENV1: '1'
                    },
                    {
                        ENV2: '2'
                    }
                ]
            }
        }
        const slsState = {
            lambdaRole: '1234',
            lambdaEnvironment: checksum(JSON.stringify([
                {
                    ENV1: '1'
                }
            ]))
        }
        const schema = ''
        const resolvers = {}
        const aws = {}

        const result = await logic({ slsYml, slsState, schema, resolvers, aws })
        expect(result.monolambda.lambdaConfig).toBe('UPDATE')
    })

    test('will skip updateCode if state is empty', async () => {
        const slsYml = {
            app: 'app',
            component: 'appsync',
            name: 'NEW API',
            inputs: {}
        }
        const slsState = 'EMPTY'
        const schema = ''
        const resolvers = {}
        const aws = {}

        const result = await logic({ slsYml, slsState, schema, resolvers, aws })
        expect(result.monolambda.lambdaCode).toBe('SKIP')
    })

    test('will update updateCode if state is not empty', async () => {
        const slsYml = {
            app: 'app',
            component: 'appsync',
            name: 'NEW API',
            inputs: {}
        }
        const slsState = {
            lambdaRole: '1234'
        }
        const schema = ''
        const resolvers = {}
        const aws = {}

        const result = await logic({ slsYml, slsState, schema, resolvers, aws })
        expect(result.monolambda.lambdaCode).toBe('UPDATE')
    })
})