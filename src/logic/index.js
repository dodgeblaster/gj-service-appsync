const state = require('gj-state')
const getYml = require('../utils/files/projectReadServerlessYml')
const getSchema = require('../utils/files/projectReadSchema')
const usersProject = require('../utils/usersProject/logic')
const awsAccount = require('../utils/awsAccount')
const logic = require('./logic')

/**
 * In order to build instructions for what to deploy, we need to consider
 * 3 things:
 *      - serverless.yml input
 *      - existing state from previous deployments
 *      - users project files
 *
 * Because state and existing aws resources being out of sync is a rare
 * occurance, we will assume the dont exist if they are not tracked in state
 * and always check if resources exist in our create functions
 * 
 * 
 */

module.exports = async (projectRoot, srcLocation) => {
    const slsYml = await getYml(projectRoot)
    const slsState = await state().read()
    const schema = await getSchema(projectRoot)
    const resolvers = await usersProject.getResolversBasedOnFile(projectRoot)
    const accountId = slsYml.inputs.accountId || await awsAccount.getAccountId()
    // const schema = await usersProject.getUsersSchema(projectRoot, srcLocation)
    

    return logic({ slsYml, slsState, schema, resolvers, projectRoot, srcLocation, accountId })
}