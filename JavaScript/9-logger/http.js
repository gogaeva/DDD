'use strict';

const http = require('node:http');

const receiveArgs = async (req) => {
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  const body = Buffer.concat(buffers).toString();
  const data = body.length > 0 ? JSON.parse(body) : {}
  if (!data.hasOwnProperty('args')) data.args = [];
  return data;
};

module.exports = (routing, port) => {
  http.createServer(async (req, res) => {
    const { url, socket } = req;
    const [name, method] = url.substring(1).split('/');
    const entity = routing[name];
    if (!entity) return res.end('Not found');
    const handler = entity[method];
    if (!handler) return res.end('Not found');
    const { args } = await receiveArgs(req);
    console.log(`${socket.remoteAddress} ${method} ${url}`);
    const result = await handler(...args);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end(JSON.stringify(result.rows));
  }).listen(port);

  console.log(`API on port ${port}`);
};
