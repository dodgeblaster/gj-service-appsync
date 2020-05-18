const buildInstructions = require('./logic')
const lambda = require('gj-aws-lambda')
const appsync = require('gj-aws-appsync')
const iam = require('gj-aws-iam')
const slsState = require('gj-state')





module.exports = async (PROJECT_ROOT, SRC_LOCATION) => {
    console.log('Deploying...')

    /**
     * Build Instructions
     * 
     * 1. Get all neccessary input from:
     *      - serverless.yml state
     *      - existing state from previous deployments
     *      - users project structure
     * 
     * 2. Take care of all logic based on above inputs, and build instructions
     * 
     */
    const instructions = await buildInstructions(PROJECT_ROOT, SRC_LOCATION)


   
   

    const appsyncLambdaRole = instructions.projectInfo.name.split(' ').join('') + '-lambda-role'
    const appsyncLambdaName = instructions.projectInfo.name.split(' ').join('') + '-lambda'
    // return
    console.log('-- appsyncLambdaRole -- ', appsyncLambdaRole)
    await iam.createRoleForLambda({
        state: '',
        name: appsyncLambdaRole
    }) 

   


    await lambda.create({
        srcLocation: PROJECT_ROOT + SRC_LOCATION, // path to location 
        zipLocation: PROJECT_ROOT + "/.serverless/code.zip", // path to location 
        name: appsyncLambdaName, // name of function 
        handler: 'index.handler', // file and method inside zip
        role: 'arn:aws:iam::251256923172:role/' + appsyncLambdaRole // iam role arn 
    })
    const appsyncData = await appsync(instructions.appsync)


    /**
     * Write State
     * 
     * At the end of all this, we want to write the state to a local file. 
     * Currently, we are just writing the appsync api id, which is all we need for 
     * now when we run the remove script.
     * 
     */
    const data = {
        apiId: appsyncData.apiId,
        apiName: appsyncData.apiName,
        // schemaChecksum: appsyncState.schemaChecksum,
        // lambdaDatasourceRole: appsyncState.lambdaDatasourceRole,

        // lambdaConfigChecksum: 'example',
        lambdaRoleRole: appsyncLambdaRole,
        lambdaRole: appsyncLambdaName,
    }

    
    await slsState().write(PROJECT_ROOT, data)
    console.log('Successfully Deployed!')
}
