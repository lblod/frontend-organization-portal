'use strict';

const proxyPath = '/sparql';

module.exports = function (app) {
  let proxy = require('http-proxy').createProxyServer({});

  proxy.on('error', function (err, req) {
    console.error(err, req.url);
  });

  app.use(proxyPath, function (req, res /*next*/) {
    const credentials = Buffer.from('root:root').toString('base64');
    req.headers.authorization = 'Basic ' + credentials;
    req.url = 'http://localhost' + proxyPath + '/' + req.url;
    proxy.web(req, res, { target: '' });
  });
};
