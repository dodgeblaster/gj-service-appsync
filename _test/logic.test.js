const logic = require('../src/logic')
describe('deploy', () => {
    test('works', async () => {
        const PROJECT_ROOT = (__dirname.slice(0, -5)) + 'exampleProject'
        const SRC_LOCATION = '/src'    
        const result = await logic(PROJECT_ROOT, SRC_LOCATION)
  

        expect(result).toMatchSnapshot()
        
    }, 300000)
})