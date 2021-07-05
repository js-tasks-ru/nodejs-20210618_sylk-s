const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  switch (req.method) {
    case 'GET':
      sendFile(req, res);
      break;
    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

const sendFile = (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  // Check if url is nested
  if (/\//.test(pathname)) {
    res.statusCode = 400;
    res.end('Nested folders are not supported');
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);
  const stream = fs.createReadStream(filepath);
  stream.pipe(res);

  stream.on('error', (e) => {
    if (e.code === 'ENOENT') {
      res.statusCode = 404;
      res.end('File not found');
    } else {
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  req.on('aborted', () => {
    stream.destroy();
  });
};

module.exports = server;
