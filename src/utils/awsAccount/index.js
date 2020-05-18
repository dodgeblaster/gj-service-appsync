const AWS = require('aws-sdk');
const STS = new AWS.STS()

module.exports = {
    /**
     * This function will return a string of the account id
     * of the current active AWS user credientials 
     * 
     */
    getAccountId: async () => {
        const res = await STS.getCallerIdentity({}).promise()
        return res.Account
    }
}