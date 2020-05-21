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
    
            const dbType = config.db[x.config.table].type

       

            let vtlDef = {}
         
            if (dbType === 'relational') {
                console.log('$$$$ ', x.config.mapping)

                let obj = {}
                if (x.config.mapping.tag1) {
                    obj.PK = x.config.mapping.tag1
                }

                if (x.config.mapping.tag2) {
                    obj.GSI1 = x.config.mapping.tag2
                }

                if (x.config.mapping.tag3) {
                    obj.GSI2 = x.config.mapping.tag3
                }

                if (x.config.mapping.id.startsWith('*')) {
                    obj.SKliteral = x.config.mapping.id.slice(1)
                } else {
                    obj.SK = x.config.mapping.id
                }
             



                vtlDef = {
                    request: vtl.dynamo.relational(obj).request[x.config.action],
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
                datasource: `${name}datasourcedb${x.config.table.split(' ').join('').split('-').join('')}`,
                vtl: vtlDef
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