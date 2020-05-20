module.exports = {
    name: 'MY NEW API5',
    region: 'us-east-2',
    db: {
        // you can store whatever u want in here
        // as long as these things belong to both users and orgs
        notes: {
            type: 'relational',
            id: 'id',
            userId: 'relationship',
            orgId: 'relationship'
        },
    
        example: {
            type: 'simple',
            id: 'id'
        }
    }
}