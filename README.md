# gj-service-appsync

## Installation
In order to add this package to your service, run the following command:
```
npm i gj-service-appsync
```

## Usage

```js
// deploy.js
const appsync = require('gj-service-appsync')
appsync.deploy(__dirname)

```

```js
// config.js
module.exports = {
    name: 'MY NEW API',
    region: 'us-east-2'
}
```

```js
// src/schema.graphql
type Hello {
    hello: String
    id: String
    name: String
}

type Product {
    id: String
    name: String
}

type Extra {
    id: String
    product: String
}

type Coffee {
    id: String
    name: String
}

type Query {
    getHello: Hello
    something: Product
    product: Extra
    getProduct(id: String): Coffee
}

input CreateProductInput {
    id: String
    name: String
}

input RemoveProductInput {
    id: String
}

type Mutation {
    createProduct(input: CreateProductInput): Coffee
    removeProduct(input: RemoveProductInput): Coffee
}
```

```js
// src/index.js
const resolvers = require('./resolvers')

module.exports.handler = async (event) => {
    try {
        const x = await resolvers
        [event.info.parentTypeName]
        [event.info.fieldName]
            (event)

        return x
    } catch (e) {
        throw new Error(e)
    }
}
```

```js
// src/resolvers.js
module.exports = {
    Query: {
        getHello: async () => {
            return {
                hello: 'hello',
                id: '1234',
                name: 'NAMEE448'
            }
        },

        something: async () => {
            return {
                id: '1234',
                name: 'Dark Coffee 1'
            }
        },

        product: async () => {
            return {
                id: '1234',
                product: 'Light Coffee'
            }
        },

        getProduct: {
            type: 'DYNAMODB',
            action: 'GET',
            table: 'int-test-appsyncdb'
        }
    },

    Mutation: {
        createProduct: {
            type: 'DYNAMODB',
            action: 'CREATE',
            table: 'int-test-appsyncdb'
        },

        removeProduct: {
            type: 'DYNAMODB',
            action: 'REMOVE',
            table: 'int-test-appsyncdb'
        },
    }
}
```

