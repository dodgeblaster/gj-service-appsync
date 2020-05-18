const readSchema = require('../../utils/files/projectReadSchema')
const readResolverFolder = require('../../utils/files/projectReadResolverFolder')
const readServerlessYml = require('../../utils/files/projectReadServerlessYml')
const readResolverFile = require('../../utils/files/projectReadResolverFile')

module.exports = {
    getUsersSchema: async (dirname) => {
        return await readSchema(dirname)
        //return await read(__dirname + PROJECT_SRC_FOLDER + '/schema.graphql')
    },

    getResolversBasedOnFile: async (dirname) => {
        const file = await readResolverFile(dirname)
        let list = {
            'Query': [],
            'Mutation': []
        }

        Object.keys(file.Query).forEach(k => {

            if (typeof file.Query[k] === 'function') {
                list.Query.push({
                    name: k,
                    format: 'FUNCTION',
                    type: 'Query',
                    field: k,
                    config: {}
                })
            }

            if (typeof file.Query[k] === 'object') {
                if (file.Query[k].type === 'DYNAMO') {

                    list.Query.push({
                        name: k,
                        format: 'DYNAMODB',
                        type: 'Query',
                        field: k,
                        config: file.Query[k]
                    })

                }
            }
        })

        Object.keys(file.Mutation).forEach(k => {

            if (typeof file.Mutation[k] === 'function') {
                list.Mutation.push({
                    name: k,
                    format: 'FUNCTION',
                    type: 'Mutation',
                    field: k,
                    config: {}
                })
            }

            if (typeof file.Mutation[k] === 'object') {
                if (file.Mutation[k].type === 'DYNAMO') {

                    list.Mutation.push({
                        name: k,
                        format: 'DYNAMODB',
                        type: 'Mutation',
                        field: k,
                        config: file.Mutation[k]
                    })

                }
            }
        })

        return list
    },

    getResolversBasedOnFolderStructure: async (dirname) => {
        const projectSrcFolder = '/src'
        let x = ''
        try {
            x = await readResolverFolder(dirname)
        } catch (e) {
            if (e.message.includes('no such file or directory')) {
                return {
                    'Query': [],
                    'Mutation': []
                }
            }
        }

        let list = {
            'Query': [],
            'Mutation': []
        }

        if (!x) {
            return list
        }

        const getPath = x => {
            const length = (dirname + projectSrcFolder + '/resolvers/').length
            return x.slice(length)
        }

        x.forEach(x => {
            const xx = getPath(x)

            if (xx.startsWith('Query')) {
                const res = xx.split('/')[1]


                if (res.split('').filter(x => x === '.').length === 1) {

                    // should check if its js first
                    // temporarily assume for demo
                    const resolverFile = require(x)
                    if (typeof resolverFile === 'function') {
                        const name = res
                        const format = res.includes('.js') ? 'FUNCTION_JS'
                            : res.includes('.py')
                                ? 'FUNCTION_PY'
                                : 'FUNCTION_UNSUPPORTED'

                        const type = 'Query'
                        const field = res.split('.')[0]
                        const path = './resolvers/Query/' + res
                        list.Query.push({
                            name,
                            format,
                            path,
                            type,
                            field,
                            config: {}
                        })

                    }

                    if (typeof resolverFile === 'object') {
                        if (resolverFile.type === 'DYNAMO') {
                            const name = res
                            const format = 'DYNAMO'
                            const config = resolverFile
                            const type = 'Query'
                            const field = res.split('.')[0]
                            const path = './resolvers/Query/' + res
                            list.Query.push({
                                name,
                                format,
                                path,
                                type,
                                field,
                                config
                            })

                        }
                    }
                }
            }

            if (xx.startsWith('Mutation')) {
                const res = xx.split('/')[1]

                if (res.split('').filter(x => x === '.').length === 1) {
                    const resolverFile = require(x)
                    if (typeof resolverFile === 'function') {
                        const name = res
                        const format = res.includes('.js') ? 'FUNCTION_JS'
                            : res.includes('.py')
                                ? 'FUNCTION_PY'
                                : 'FUNCTION_UNSUPPORTED'

                        const type = 'Mutation'
                        const field = res.split('.')[0]
                        const path = './resolvers/Mutation/' + res
                        list.Mutation.push({
                            name,
                            format,
                            path,
                            type,
                            field,
                            config: {}
                        })

                    }

                    if (typeof resolverFile === 'object') {
                        if (resolverFile.type === 'DYNAMO') {
                            const name = res
                            const format = 'DYNAMO'
                            const config = resolverFile
                            const type = 'Mutation'
                            const field = res.split('.')[0]
                            const path = './resolvers/Mutation/' + res
                            list.Mutation.push({
                                name,
                                format,
                                path,
                                type,
                                field,
                                config
                            })

                        }
                    }
                }
            }
        })

        return list
    },


    getServerlessYml: async (projectRoot) => {
        let res = ''
        try {
            res = await readServerlessYml(projectRoot)
        } catch (e) {
            if (e.message.includes('no such file or directory')) {
                throw new Error('Deploying requires a serverless.yml file at the root of project')
            }
            throw new Error(e)
        }


        if (!res.inputs) {

            return {
                projectName: res.name,
                accountId: false,
                region: 'us-east-1',
                env: []
            }
        }


        return {
            projectName: res.name,
            accountId: res.inputs.accountId || false,
            region: res.inputs.region || 'us-east-1',
            env: res.inputs.environment || []
        }
    }
}
