const buildInstructions = require('./logic')
const lambda = require('gj-aws-lambda')
const appsync = require('gj-aws-appsync')
const iam = require('gj-aws-iam')
const dynamodb = require('gj-aws-dynamodb')
const state = require('gj-state')
const copy = require('./utils/files/copyDirectory')





module.exports.deploy = async (PROJECT_ROOT) => {
    const SRC_LOCATION = '/src'
    console.log('Deploying...')







    /**
     * 1. Build Instructions
     * 
     */
    const instructions = await buildInstructions(PROJECT_ROOT, SRC_LOCATION)
    
    console.log('INST - ', instructions)
    copy(
        PROJECT_ROOT + SRC_LOCATION,
        PROJECT_ROOT + '/.config/_src'
    )

    copy(
        __dirname + '/filesToCopy',
        PROJECT_ROOT + '/.config/_src'
    )

   
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
            srcLocation: PROJECT_ROOT + '/.config/_src',
            zipLocation: PROJECT_ROOT + "/.config/code.zip",
            name: appsyncLambdaName,
            handler: "_index.handler",
            role: `arn:aws:iam::${instructions.projectInfo.accountId}:role/${appsyncLambdaRole}`,
        })
    }

    if (instructions.monolambda.lambdaCode === 'UPDATE') {
        console.log('UPDATING CODE...')
        await lambda.updateCode({
            srcLocation: PROJECT_ROOT + SRC_LOCATION,
            zipLocation: PROJECT_ROOT + "/.config/code.zip",
            name: appsyncLambdaName,
        })
    }

    if (instructions.monolambda.lambdaConfig === 'UPDATE') {
        console.log('mock UPDATING LAMBDA CONFIG...')
    }
    



    for (const db of instructions.dynamodb.config) {
        try {
            const params = {
                name: db.tableName,
                PK: 'PK',
                SK: db.SK ?  'SK' : false,
                ...(db.GSI1 && {GSI1: 'GSI1'}),
                ...(db.GSI2 && {GSI2: 'GSI2'})
            }
            console.log('db params - ', params)
            
            await dynamodb.create(params)
        } catch(e) {
            console.log('DB ERROR - ', e)
        }
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
        tables: instructions.dynamodb.config,
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
    

    for (const db of stateRes.tables) {
        try {
            await dynamodb.remove(db.tableName)
        } catch (e) {
            console.log('db err ', e)
        }
    }
 

    // appsync
    await appsync.remove(stateRes.apiId)
    console.log('removed api')

    await state('none', '/.config/state.js').remove(PROJECT_ROOT)
}
