const project = require('../../logic')
describe('project', () => {
    test('getResolvers will return Querys', async () => {
        const result = await project.getResolversBasedOnFile(
            __dirname + '/exampleProject'
        )

        console.log(result.Query)

        // expect(result.Query).toEqual([
        //     'getProduct', 'getUser'
        // ])
    })
})