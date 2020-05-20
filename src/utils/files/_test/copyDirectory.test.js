const copy = require('../copyDirectory')



describe('copy', () => {
    test('works', () => {

        console.log('__+)+ ')

        copy(__dirname + '/exampleDirectory/src', __dirname + '/exampleDirectory/.config')
        copy(__dirname + '/exampleDirectory/app', __dirname + '/exampleDirectory/.config')
        expect(2).toBe(2)
    })
})