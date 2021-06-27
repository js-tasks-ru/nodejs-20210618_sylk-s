const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this._store = null;
  }

  _transform(chunk, encoding, callback) {
    const str = chunk.toString('utf-8');
    const strArr = str.split(os.EOL);
    const strLen = strArr.length;

    if (this._store) {
      strArr[0] = this._store.concat(strArr[0]);
    }

    strArr.slice(0, strLen - 1).forEach((item) => {
      this.push(item);
    });
    this._store = strArr[strLen - 1];

    callback();
  }

  _flush(callback) {
    if (this._store) {
      this.push(this._store);
      this._store = null;
    }
    callback();
  }
}

module.exports = LineSplitStream;
