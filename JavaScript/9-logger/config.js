'use strict';

const config = {
    server: {
        port: 8001,
    },

    staticServer: {
        port: 8000,
    },

    db: {
        host: '127.0.0.1',
        port: 5432,
        database: 'example',
        user: 'marcus',
        password: 'marcus',
    }
};

module.exports = Object.create(null, config);