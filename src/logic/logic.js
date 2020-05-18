const checksum = require('../utils/checksum')
const vtl = require('./actionToVtl')


const makeDatasourceInstructions = (config, accountId, region, res) => {
    const name = config.name.split(' ').join('')


    // NEW CODE INVOLVES THE FOLLOWING:

    let iamroleList = []
    let datasourceList = []
    const mapForNewDatasources = res.Query.reduce((acc, x) => {
        if (x.format.startsWith('FUNCTION')) {
            acc.monoLambda = true
        }

        if (x.format === 'DYNAMODB') {
            acc.dynamodb[x.config.table] = {
                type: 'DYNAMODB',
                name: name + 'datasourcedb' + x.config.table,
                tableName: x.config.table
            }
        }

        return acc
    }, {
        monoLambda: false,
        dynamodb: {}
    })

    if (mapForNewDatasources.monoLambda) {
        iamroleList.push({
            type: 'AWS_LAMBDA',
            state: '',
            name: `${name}-datasource-LAMBDA-role`
        })
        datasourceList.push({
            type: 'AWS_LAMBDA',
            name: `${name}datasourceLAMBDA`,
            //id: apiId,
            lambdaArn: `arn:aws:lambda:${region}:${accountId}:function:${name}-lambda`,
            roleArn: `arn:aws:iam::${accountId}:role/${name}-datasource-LAMBDA-role`,
            roleName: `${name}-datasource-LAMBDA-role`
        })
    }
    Object.keys(mapForNewDatasources.dynamodb).forEach(k => {
        const ds = mapForNewDatasources.dynamodb[k]
        iamroleList.push({
            type: 'AMAZON_DYNAMODB',
            state: '',
            name: ds.name + '-role'
        })
        datasourceList.push({
            type: 'AMAZON_DYNAMODB',
            name: ds.name,
            tableName: ds.tableName,
            roleArn: `arn:aws:iam::${accountId}:role/${ds.name}-role`,
            roleName: ds.name + '-role'
        })
    })




    return {
        iamroleList,
        datasourceList
    }
}



const makeResolverInstructions = (config, accountId, region, res) => {
    const name = config.name.split(' ').join('')


    const queries = res.Query.reduce((acc, x) => {

        if (x.format.startsWith('FUNCTION')) {
            acc.push({
                resolverType: 'AWS_LAMBDA',
                type: x.type,
                field: x.field,
                datasource: `${name}datasourceLAMBDA`,
                vtl: vtl.lambda
            })
        }

        if (x.format === 'DYNAMODB') {
            acc.push({
                resolverType: 'AMAZON_DYNAMODB',
                type: x.type,
                field: x.field,
                datasource: `${name}datasourcedb${x.config.table}`,
                vtl: {
                    request: vtl.dynamo.request[x.config.action],
                    response: vtl.dynamo.response
                }
            })
        }

        return acc
    }, [])

    const mutations = res.Mutation.reduce((acc, x) => {

        if (x.format.startsWith('FUNCTION')) {
            acc.push({
                resolverType: 'FUNCTION',
                type: x.type,
                field: x.field,
                datasource: `${name}datasourceLAMBDA`
            })
        }

        if (x.format === 'DYNAMODB') {
            acc.push({
                resolverType: 'AMAZON_DYNAMODB',
                type: x.type,
                field: x.field,
                action: x.config.action,
                datasource: `${name}datasourcedb${x.config.table}`
            })
        }

        return acc
    }, [])



    return [
        ...queries,
        ...mutations
    ]

}



module.exports = async ({ slsYml, slsState, schema, resolvers, projectRoot, srcLocation, accountId }) => {
    const region = slsYml.inputs.region || 'us-east-1'


    const generatedDatasources = slsState === 'EMPTY'
        ? makeDatasourceInstructions(slsYml, accountId, region, resolvers)
        : {
            iamroleList: [],
            datasourceList: []
        }
    const generatedResources = slsState === 'EMPTY'
        ? makeResolverInstructions(slsYml, accountId, region, resolvers)
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

    // Graphql API State
    const graphQLAPI = {
        rootResource: () => {
            if (slsState === 'EMPTY') {
                return 'CREATE'
            }

            return 'SKIP'
        }
    }

    const auth = () => {
        // if (slsState === 'EMPTY') {
        //     return 'CREATE'
        // }

        // return 'SKIP'
        return {
            state: 'CREATE',
            existingKey: null
        }
    }




    // schema
    const schemaLogic = () => {
        // if (slsState === 'EMPTY') {
        //     return 'CREATE'
        // }

        // const schemaChanged = slsState.schemaChecksum !== checksum(schema)

        // if (schemaChanged) {
        //     return 'UPDATE'
        // }

        // return 'SKIP'

        return {
            state: 'CREATE',
            defintion: schema
        }

    }


    // const datasources = () => {
    //     let create = []
    //     let update = []
    //     let remove = []

    //     if (slsState === 'EMPTY') {
    //         create.push({
    //             iamRole: 'CREATE',
    //             name: slsYml.name.split(' ').join('') + 'lambdadatasource',
    //             type: 'LAMBDA',

    //         })
    //     }
    //     return {
    //         create,
    //         update,
    //         remove
    //     }
    // }

    // const resolversLogic = () => {
    //     if (slsState === 'EMPTY') {
    //         return 'CREATE'
    //     }

    //     return 'SKIP'
    // }



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