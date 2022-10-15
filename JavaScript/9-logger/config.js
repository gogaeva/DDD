'use strict';

const config = {
    server: {
        value: {
            port: 8001,
        },
        configurable: true,
        enumerable: true,
        writable: false,

    },

    staticServer: {
        value: {
            port: 8000,
        },
        configurable: true,
        enumerable: true,
        writable: false,
    },

    db: {
        value: {
            host: '127.0.0.1',
            port: 5432,
            database: 'example',
            user: 'marcus',
            password: 'marcus',
        },
        configurable: true,
        enumerable: true,
        writable: false,
    },
};

module.exports = Object.create(null, config);