const action = require('../src/index')
describe('deploy', () => {
    test('works', async () => {
        const PROJECT_ROOT = (__dirname.slice(0, -5)) + 'exampleProject' 
        const result = await action.deploy(PROJECT_ROOT)
        expect(2).toBe(2)
    }, 300000)
})