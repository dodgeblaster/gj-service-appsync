const checksum = require('../utils/checksum')
const makeDatasourceInstructions = require('./datasources')
const makeResolverInstructions  = require('./resolvers')


module.exports = async ({ slsYml, slsState, schema, resolvers, projectRoot, srcLocation, accountId }) => {
    const region = slsYml.region || 'us-east-2'

    const generatedDatasources = slsState === 'EMPTY'
        ? makeDatasourceInstructions(slsYml, accountId, region, resolvers)
        : {
            iamroleList: [],
            datasourceList: []
        }
    const generatedResources = slsState === 'EMPTY'
        ? makeResolverInstructions(slsYml, resolvers)
        : []

    // Mono Lambda
    const monolambda = {
        iamRole: () => {
            if (slsState === 'EMPTY') {
                return 'CREATE'
            }

            if (!slsState.lambdaRole || slsState.lambdaRole === '') {
                return 'CREATE'
            }

            return 'SKIP'
        },

        lambdaConfig: () => {
            if (slsState === 'EMPTY') {
                return 'SKIP'
            }
            const newChecksum = slsYml.inputs && slsYml.inputs.environment
                ? checksum(JSON.stringify(slsYml.inputs.environment))
                : 'NOT DEFINED'

            if (newChecksum !== slsState.lambdaEnvironment) {
                return 'UPDATE'
            }

            return 'SKIP'
        },

        lambdaCode: () => {
            if (slsState === 'EMPTY') {
                return 'SKIP'
            }

            return 'UPDATE'
        }

    }

    const graphQLAPI = {
        rootResource: () => {
            if (slsState === 'EMPTY') {
                return 'CREATE'
            }

            return 'SKIP'
        }
    }

    const auth = () => {
        return {
            state: 'CREATE',
            existingKey: null
        }
    }


    const schemaLogic = () => {
        return {
            state: 'CREATE',
            defintion: schema
        }
    }

    // Return Built Object
    return {
        projectInfo: {
            name: slsYml.name || '',
            lambdaRole: slsState.lambdaRole || '',
            id: slsState.apiId || '',
            schemaChecksum: slsState.schemaChecksum || '',
            lambdaDatasourceRole: slsState.lambdaDatasourceRole || '',
            accountId: accountId,
            region: region,
            projectRoot,
            srcLocation,
            schema
        },
        monolambda: {
            iamRole: monolambda.iamRole(),
            lambdaConfig: monolambda.lambdaConfig(),
            lambdaCode: monolambda.lambdaCode(),
        },
        appsync: {
            name: slsYml.name,
            graphQLApi: {
                rootResource: graphQLAPI.rootResource()
            },
            auth: auth(),
            schema: schemaLogic(),
            datasources: {
                create: generatedDatasources.datasourceList
            },
            datasourceIamRoles: {
                create: generatedDatasources.iamroleList
            },
            resolvers: {
                create: generatedResources
            }
        }
    }
}