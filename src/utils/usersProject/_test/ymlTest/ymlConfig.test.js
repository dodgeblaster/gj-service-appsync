const project = require('../../logic')
describe('ymlconfig', () => {
    test('can read values', async () => {
        const result = await project.getServerlessYml(__dirname + '/validProject')
        expect(result).toEqual({
            projectName: 'MY NEW API',
            region: 'us-east-2',
            accountId: 251256923172,
            env: []
        })
    })

    test('will return defaults if no input is defined', async () => {
        const result = await project.getServerlessYml(__dirname + '/noConfigProject')
        expect(result).toEqual({
            projectName: 'MY NEW API',
            region: 'us-east-1',
            accountId: false,
            env: []
        })
    })

    test('throw error if no serverless.yml file exists', async (done) => {
        try {
            const result = await project.getServerlessYml(__dirname + '/')
            console.log(result)
        } catch (e) {
            expect(e.message).toBe('Deploying requires a serverless.yml file at the root of project')
            done()
        }
    })
})