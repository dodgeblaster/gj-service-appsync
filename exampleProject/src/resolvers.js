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
