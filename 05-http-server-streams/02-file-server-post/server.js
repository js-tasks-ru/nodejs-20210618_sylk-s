const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  switch (req.method) {
    case 'POST':
      saveFile(req, res);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

const saveFile = (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  // Check if url is nested
  if (/\//.test(pathname)) {
    res.statusCode = 400;
    res.end('Nested folders are not supported');
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);

  const stream = fs.createWriteStream(filepath, {flags: 'wx'}); // Write file if it doesn't exist
  const streamErrorHandler = (e) => {
    if (e.code === 'EEXIST') {
      res.statusCode = 409;
      res.end('File already exists');
      return;
    }
    res.statusCode = 500;
    res.end('Internal server error');
  };
  const streamFinishHandler = () => {
    res.statusCode = 201;
    res.end('Successfully uploaded');
  };

  const limitSizeStream = new LimitSizeStream({limit: 1024 * 1024}); // Limit to 1 Mb
  const limitSizeStreamErrorHandler = () => {
    stream.destroy();
    fs.unlinkSync(filepath);

    res.statusCode = 413;
    res.end('File size limit exceeded');
  };

  // Main pipeline
  req
      .pipe(limitSizeStream)
      .on('error', limitSizeStreamErrorHandler)
      .pipe(stream)
      .on('error', streamErrorHandler)
      .on('finish', streamFinishHandler);

  req.on('aborted', () => {
    stream.destroy();
    fs.unlinkSync(filepath);
  });
};

module.exports = server;
