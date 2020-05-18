const fs = require('fs')
const YAML = require('yaml')

module.exports = async (projectRoot) => {
    // YAML.parse('3.14159')
    // // YAML.parse('[ true, false, maybe, null ]\n')
    // const file = fs.readFileSync(projectRoot + '/serverless.yml', 'utf8')
    // return await YAML.parse(file)


    const res = require(projectRoot + '/config.js')
    return res
}