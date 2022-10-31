/*
*@jest-environment jsdom
*/

const {buildAPI, services} = require('../static/client.js');
const url = 'ws://127.0.0.1:8001';

let api;

beforeAll(async () => {
    api = await buildAPI(services, url);
});

describe('test user service', () => {
    test('api.user.read without arguments returns 4 raws from the users table', async () => {
        const records = await api.user.read();
        expect(records.length).toBe(4);
    });
    test('read user with id 1 should return admin', async () => {
        const row = await api.user.read(1);
        expect(row).toBeInstanceOf(Array);
        expect(row.length).toBe(1);
        const user = row[0];
        expect(user.id).toBe('1');
        expect(user.login).toBeDefined();
    });
    test('create new user with login and password should return id', async () => {
        let res = await api.user.create({ login: 'bigboy', password: '3450d' });
        expect(res[0].id).toBeDefined();
        const id = res[0].id;
        expect(parseInt(id, 10)).not.toBeNaN();

        res = await api.user.delete(id);
        expect(res).toBeInstanceOf(Array);
        expect(res).toHaveLength(0);
    });
    test('find user with login marcus by mask \'marc%\'', async () => {
        const res = await api.user.find('marc%');
        const user = res[0];
        expect(user.login).toBe('marcus');
    });
    test('update user with id 2', async () => {
        const id = 2;
        let res = await api.user.read(id);
        const user = res[0];

        res = await api.user.update(id, { login: 'marcus aurelius' });
        expect(res).toBeInstanceOf(Array);
        expect(res).toHaveLength(0);

        await api.user.update(id, {login: user.login})
    });
    test('requests with incorrect names of services or methods in urls should return 404 not found', async () => {
        const mixin = { admin: { read: ['id'] } };
        const extendedServices = Object.assign({}, services, mixin);
        api = await buildAPI(extendedServices, url);
        const res = await api.admin.read();
        expect(res).toBe('Not found');
    });
});