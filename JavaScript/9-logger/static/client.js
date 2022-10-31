'use strict';

const scaffolders = {
  unknown: () => { throw Error("Protocol is not supported") },

  http: (structure, url) => {
    const api = {};
    const services = Object.keys(structure);
    for (const serviceName of services) {
      api[serviceName] = {};
      const service = structure[serviceName];
      const methods = Object.keys(service);
      for (const methodName of methods) {
        api[serviceName][methodName] = (...args) => new Promise((resolve, reject) => {
          fetch(`${url}/${serviceName}/${methodName}/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(args),
          }).then((res) => {
            if (res.status === 200) resolve(res.json());
            else reject(new Error(res.statusText));
          });       
        });
      }
    }
    return Promise.resolve(api);
  },

  ws: (structure, url) => {
    const api = {};
    const socket = new WebSocket(url);
    const services = Object.keys(structure);
    for (const serviceName of services) {
      api[serviceName] = {};
      const service = structure[serviceName];
      const methods = Object.keys(service);
      for (const methodName of methods) {
          api[serviceName][methodName] = (...args) => new Promise((resolve) => {
            const packet = { name: serviceName, method: methodName, args };
            socket.send(JSON.stringify(packet));
            socket.onmessage = (event) => {
              const data = JSON.parse(event.data);
              resolve(data);
            };
          });
      }
    }
    return new Promise((resolve) => {
      socket.addEventListener('open', () => resolve(api));
    });
  },
}

const buildAPI = async (structure, url) => {
  const protocol = url.split(':').shift();
  const scaffolder = scaffolders[protocol] || scaffolders.unknown;
  return await scaffolder(structure, url);
}

const services = {
  user: {
    create: ['record'],
    read: ['id'],
    update: ['id', 'record'],
    delete: ['id'],
    find: ['mask'],
  },
  country: {
    read: ['id'],
    delete: ['id'],
    find: ['mask'],
  },
};

(async () => {
  const url = 'ws://127.0.0.1:8001';
  window.api = await buildAPI(services, url);
})();

//export for tests
if (typeof global === 'object') module.exports = {buildAPI, services};
