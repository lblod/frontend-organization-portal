'use strict';

const proxyPath = '/uri-info';

module.exports = function (app) {
  let proxy = require('http-proxy').createProxyServer({});

  proxy.on('error', function (err, req) {
    console.error(err, req.url);
  });

  app.use(proxyPath, function (req, res, /*next*/) {
    const credentials = Buffer.from('root:root').toString('base64');
    req.headers.authorization = "Basic " + credentials;
    req.headers["Accept"] = "application/json";
    req.url = "http://localhost" + proxyPath + '/' + req.url;
    proxy.web(req, res, { target: '' });
  });
};
