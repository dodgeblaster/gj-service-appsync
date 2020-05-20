module.exports = (config, accountId, region, res) => {
    const name = config.name.split(' ').join('')

    let iamroleList = []
    let datasourceList = []
    const mapForNewDatasources = res.Query.reduce((acc, x) => {
        if (x.format.startsWith('FUNCTION')) {
            acc.monoLambda = true
        }

        if (x.format === 'DYNAMODB') {
            let tableName = Object.keys(config.db).includes(x.config.table)
                ? config.name.split(' ').join('').split('-').join('') + x.config.table
                : x.config.table

            acc.dynamodb[x.config.table] = {
                type: 'DYNAMODB',
                name: name + 'datasourcedb' + x.config.table.split(' ').join('').split('-').join(''),
                tableName: tableName
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
