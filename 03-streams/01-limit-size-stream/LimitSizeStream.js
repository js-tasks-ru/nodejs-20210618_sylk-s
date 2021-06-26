const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor({limit, ...options}) {
    super(options);
    this._limit = limit;
    this._size = 0;
  }

  _addSize(val) {
    this._size += val;
  }

  _transform(chunk, encoding, callback) {
    const size = Buffer.byteLength(chunk);
    if (size + this._size <= this._limit) {
      this._addSize(size);
      callback(null, chunk);
    } else {
      callback(new LimitExceededError());
    }
  }
}

module.exports = LimitSizeStream;
