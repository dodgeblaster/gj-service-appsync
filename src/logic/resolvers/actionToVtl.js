module.exports = {
    dynamo: {
        simple: config => ({
            request: {
                'GET': `{
                    "version": "2017-02-28",
                    "operation": "GetItem",
                    "key": {
                        "PK": $util.dynamodb.toDynamoDBJson($ctx.args.${config.PK})
                    },
                }`,

                'LIST': `{
                    "version": "2017-02-28",
                    "operation": "Scan",
                    "filter": #if($context.args.filter) $util.transform.toDynamoDBFilterExpression($ctx.args.filter) #else null #end,
                    "limit": $util.defaultIfNull($ctx.args.limit, 20),
                    "nextToken": $util.toJson($util.defaultIfNullOrEmpty($ctx.args.nextToken, null)),
                }`,

                'CREATE': `{
                    "version": "2017-02-28",
                    "operation": "PutItem",
                    "key": {
                        "PK": $util.dynamodb.toDynamoDBJson($ctx.args.input.${config.PK})
                    },
                    #set ( $ctx.args.input.createdAt = "$util.time.nowISO8601()" )
                    "attributeValues": $util.dynamodb.toMapValuesJson($ctx.args.input),
                    "condition": {
                        "expression": "attribute_not_exists(#PK)",
                        "expressionNames": {
                        "#PK": "PK"
                        },
                    },
                }`,
                'REMOVE': `{
                    "version": "2017-02-28",
                    "operation": "DeleteItem",
                    "key": {
                        "PK": $util.dynamodb.toDynamoDBJson($ctx.args.input.${config.PK})
                    },
                }`
            }
        }),
        relational: config => ({
            request: {
                'GET': `{
                    "version": "2017-02-28",
                    "operation": "GetItem",
                    "key": {
                        "PK": $util.dynamodb.toDynamoDBJson($ctx.args.${config.PK}),
                        "SK": $util.dynamodb.toDynamoDBJson($ctx.args.${config.SK})
                    },
                }`,

                'LIST': `{
                    "version": "2017-02-28",
                    "operation": "Query",
                    "key": {
                        ${config.PK ? `"PK": $util.dynamodb.toDynamoDBJson($ctx.args.${config.PK}),`: ''}
                        ${config.GSI1 ? `"GSI1": $util.dynamodb.toDynamoDBJson($ctx.args.${config.GSI1}),`: ''}
                        ${config.GSI2 ? `"GSI2": $util.dynamodb.toDynamoDBJson($ctx.args.${config.GSI2}),`: ''}
                        ${config.SK ? `"SK": $util.dynamodb.toDynamoDBJson($ctx.args.${config.SK}),`:`"SK": "${config.SKliteral}"`}
                       
                    "filter": #if($context.args.filter) $util.transform.toDynamoDBFilterExpression($ctx.args.filter) #else null #end,
                    "limit": $util.defaultIfNull($ctx.args.limit, 20),
                    "nextToken": $util.toJson($util.defaultIfNullOrEmpty($ctx.args.nextToken, null)),
                    "condition": {
                        ${config.PK ? `"expression": "PK = :pk AND begins_with(SK, :sk)",
                        "expressionNames": {
                            ":pk": "PK",
                            ":sk": "SK"
                        }`: ''}
                        ${config.GSI1 ? `"expression": "GSI1 = :pk AND begins_with(SK, :sk)",
                        "expressionNames": {
                            ":pk": "GSI1",
                            ":sk": "SK"
                        }`: ''}
                        ${config.GSI2 ? `"expression": "GSI2 = :pk AND begins_with(SK, :sk)",
                        "expressionNames": {
                            ":pk": "GSI2",
                            ":sk": "SK"
                        }`: ''}
   
   
                    },
                }`,

                'CREATE': `{
                    "version": "2017-02-28",
                    "operation": "PutItem",
                    "key": {
                        "PK": $util.dynamodb.toDynamoDBJson($ctx.args.input.${config.PK}),
                        "SK": $util.dynamodb.toDynamoDBJson($ctx.args.input.${config.SK})
                    },
                    #set ( $ctx.args.input.createdAt = "$util.time.nowISO8601()" )
                    "attributeValues": $util.dynamodb.toMapValuesJson($ctx.args.input),
                    "condition": {
                        "expression": "attribute_not_exists(#PK)",
                        "expressionNames": {
                        "#PK": "PK"
                        },
                    },
                }`,
                'REMOVE': `{
                    "version": "2017-02-28",
                    "operation": "DeleteItem",
                    "key": {
                        "PK": $util.dynamodb.toDynamoDBJson($ctx.args.input.${config.PK}),
                        "SK": $util.dynamodb.toDynamoDBJson($ctx.args.input.${config.SK})
                    },
                }`
            }
        }),
        response: `$util.toJson($ctx.result)`
    },

    lambda: {
        request: `{ 
            "version": "2017-02-28",
            "operation": "Invoke",
            "payload": $util.toJson($ctx)
        }`,
        response: `$util.toJson($ctx.result)`
    }
}