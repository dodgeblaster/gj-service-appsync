const project = require('../../logic')
describe('project', () => {
    test('getResolvers will return Querys', async () => {
        const result = await project.getResolversBasedOnFolderStructure(
            __dirname + '/exampleProject'
        )

        expect(result.Query.map(x => x.field)).toEqual([
            'getProduct', 'getUser'
        ])
    })

    test('getResolvers will return Mutations', async () => {
        const result = await project.getResolversBasedOnFolderStructure(
            __dirname + '/exampleProject'
        )

        expect(result.Mutation.map(x => x.field)).toEqual([
            "createProduct",
            "updateProduct",
        ])
    })

    test('will return empty query and mutations if there are none', async () => {
        const result = await project.getResolversBasedOnFolderStructure(
            __dirname + '/exampleProject/resolvers'
        )

        expect(result.Mutation).toEqual([])
    })
})