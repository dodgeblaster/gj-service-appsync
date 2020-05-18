module.exports = {
    dynamo: {
        request: {
            'GET': `{
                "version": "2017-02-28",
                "operation": "GetItem",
                "key": {
                    "id": $util.dynamodb.toDynamoDBJson($ctx.args.id)
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
                    "id": $util.dynamodb.toDynamoDBJson($ctx.args.input.id)
                },
                #set ( $ctx.args.input.createdAt = "$util.time.nowISO8601()" )
                "attributeValues": $util.dynamodb.toMapValuesJson($ctx.args.input),
                "condition": {
                    "expression": "attribute_not_exists(#id)",
                    "expressionNames": {
                    "#id": "id"
                    },
                },
            }`,
            'REMOVE': `{
                "version": "2017-02-28",
                "operation": "DeleteItem",
                "key": {
                    "id": $util.dynamodb.toDynamoDBJson($ctx.args.input.id)
                },
            }`
        },
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