const vtl = require('./actionToVtl')

module.exports = (config, res) => {
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
                datasource: `${name}datasourcedb${x.config.table.split(' ').join('').split('-').join('')}`,
                vtl: {
                    request: vtl.dynamo.simple({PK: 'id'}).request[x.config.action],
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
                datasource: `${name}datasourceLAMBDA`,
                vtl: vtl.lambda
            })
        }

        if (x.format === 'DYNAMODB') {
            const dbType = config.db[x.config.table].type

            let vtlDef = {}
            if (dbType === 'relational') {
                vtlDef = {
                    request: vtl.dynamo.simple({PK: 'id'}).request[x.config.action],
                    response: vtl.dynamo.response
                }
            } else {
                vtlDef = {
                    request: vtl.dynamo.simple({PK: 'id'}).request[x.config.action],
                    response: vtl.dynamo.response
                }
            }


            
            acc.push({
                resolverType: 'AMAZON_DYNAMODB',
                type: x.type,
                field: x.field,
                vtl: vtlDef,
                datasource: `${name}datasourcedb${x.config.table.split(' ').join('').split('-').join('')}`
            })
        }

        return acc
    }, [])

    return [
        ...queries,
        ...mutations
    ]
}