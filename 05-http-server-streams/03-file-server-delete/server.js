const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  switch (req.method) {
    case 'DELETE':
      deleteFile(req, res);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

const deleteFile = (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  // Check if url is nested
  if (/\//.test(pathname)) {
    res.statusCode = 400;
    res.end('Nested folders are not supported');
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);
  fs.unlink(filepath, (e) => {
    if (e) {
      if (e.code === 'ENOENT') {
        res.statusCode = 404;
        res.end('File not found');
        return;
      }
      res.statusCode = 500;
      res.end('Internal server error');
      return;
    }
    res.statusCode = 200;
    res.end('File successfully delete');
  });
};

module.exports = server;
