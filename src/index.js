const buildInstructions = require('./logic')
const lambda = require('gj-aws-lambda')
const appsync = require('gj-aws-appsync')
const iam = require('gj-aws-iam')
const state = require('gj-state')





module.exports.deploy = async (PROJECT_ROOT) => {
    const SRC_LOCATION = '/src'
    console.log('Deploying...')



    /**
     * 1. Build Instructions
     * 
     */
    const instructions = await buildInstructions(PROJECT_ROOT, SRC_LOCATION)


   
    /**
     * 2. Create / Update MonoLambda
     * 
     */
    const appsyncLambdaRole = instructions.projectInfo.name.split(' ').join('') + '-lambda-role'
    const appsyncLambdaName = instructions.projectInfo.name.split(' ').join('') + '-lambda'   
    if (instructions.monolambda.iamRole === 'CREATE') {
        await iam.createRoleForLambda({
            state: '',
            name: appsyncLambdaRole
        })

        await lambda.create({
            srcLocation: PROJECT_ROOT + SRC_LOCATION,
            zipLocation: PROJECT_ROOT + "/.serverless/code.zip",
            name: appsyncLambdaName,
            handler: "index.handler",
            role: `arn:aws:iam::${ACCOUNT_ID}:role/${appsyncLambdaRole}`,
        })
    }

    if (instructions.monolambda.lambdaCode === 'UPDATE') {
        console.log('UPDATING CODE...')
        await lambda.updateCode({
            srcLocation: PROJECT_ROOT + SRC_LOCATION,
            zipLocation: PROJECT_ROOT + "/.serverless/code.zip",
            name: appsyncLambdaName,
        })
    }

    if (instructions.monolambda.lambdaConfig === 'UPDATE') {
        console.log('mock UPDATING LAMBDA CONFIG...')
    }
    
    

    /**
     * 3. Create / Update Appsync
     * 
     */
    const appsyncData = await appsync.deploy(instructions.appsync)



    /**
     * 4.Write State
     * At the end of all this, we want to write the state to a local file. 
     * 
     */
    const data = {
        apiId: appsyncData.apiId,
        apiName: appsyncData.apiName,
        appsyncLambdaRole: appsyncLambdaRole,
        appsyncLambdaName: appsyncLambdaName,
        datasourceRoles: instructions.appsync.datasourceIamRoles.create.map(x => x.name)
    }

    
    await state('none', '/.config/state.js').write(PROJECT_ROOT, data)
    console.log('Successfully Deployed!')
}



module.exports.remove = async (PROJECT_ROOT, SRC_LOCATION) => {
    const stateRes = await state('none', '/.config/state.js').read(PROJECT_ROOT)

    // iam role lambda
    await iam.removeRole(stateRes.appsyncLambdaRole)
    console.log('removed iam lambda role')

    // lambade
    await lambda.remove(stateRes.appsyncLambdaName)
    console.log('removed lambda')

    // data source iams
    for (const dsRole of stateRes.datasourceRoles) {
        await iam.removeRole(dsRole)
        console.log('removed datasource role')
    }
 

    // appsync
    await appsync.remove(stateRes.apiId)
    console.log('removed api')

    await state('none', '/.config/state.js').remove(PROJECT_ROOT)
}
