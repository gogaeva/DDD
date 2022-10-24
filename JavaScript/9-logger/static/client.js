'use strict';

const scaffolders = {
  unknown: () => { throw Error("Strategy not implemented") },

  http: (structure, url) => {
    const api = {};
    const services = Object.keys(structure);
    for (const serviceName of services) {
      api[serviceName] = {};
      const service = structure[serviceName];
      const methods = Object.keys(service);
      for (const methodName of methods) {
        api[serviceName][methodName] = (...args) => new Promise((resolve) => {
          fetch(`${url}${serviceName}/${methodName}/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(args),
          }).then((res) => resolve(res.json()));       
        });
      }
    }
    return api;
  },

  ws: (structure, url) => {
    const api = {};
    const services = Object.keys(structure);
    for (const serviceName of services) {
      api[serviceName] = {};
      const service = structure[serviceName];
      const methods = Object.keys(service);
      for (const methodName of methods) {
        const socket = new WebSocket(url);
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
    return api;
  },
}

const buildAPI = (protocol) => {
  const scaffolder = scaffolders[protocol] || scaffolders.unknown;
  return (structure, url) => scaffolder(structure, url);
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
const url = 'http://127.0.0.1:8001/';

const api = buildAPI('http')(services, url);


// socket.addEventListener('open', async () => {
//   const data = await api.user.read(3);
//   console.dir({ data });
// });
// const users = api.user.read();
// console.log(users);

(async () => {
  const users = await api.user.read();
  console.dir(users);
  await api.user.read();
})();