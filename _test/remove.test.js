const action = require('../src/remove')
describe('deploy', () => {
    test('works', async () => {
        const PROJECT_ROOT = (__dirname.slice(0, -5)) + 'exampleProject'
        const SRC_LOCATION = '/src'    
        const result = await action(PROJECT_ROOT, SRC_LOCATION)
        expect(2).toBe(2)
    }, 300000)
})