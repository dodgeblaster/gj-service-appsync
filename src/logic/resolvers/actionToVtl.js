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
                        "PK": $util.dynamodb.toDynamoDBJson($ctx.args.${config.PK}),
                        "SK": $util.dynamodb.toDynamoDBJson($ctx.args.${config.SK})
                    },
                    "filter": #if($context.args.filter) $util.transform.toDynamoDBFilterExpression($ctx.args.filter) #else null #end,
                    "limit": $util.defaultIfNull($ctx.args.limit, 20),
                    "nextToken": $util.toJson($util.defaultIfNullOrEmpty($ctx.args.nextToken, null)),
                    "condition": {
                        "expression": "PK = :pk AND begins_with(SK, :sk)",
                        "expressionNames": {
                        ":pk": "PK",
                        ":sk": "SK"
                        },
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