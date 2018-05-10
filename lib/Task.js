let np = require('node-processor');

class Task {
  constructor(options, attributes, callback) {
    this._options = options;
    this._callback = callback;
    this._attributes = attributes;
  }

  opt(name, value) {
    if (arguments.length === 0)
      return this._options;
    if (arguments.length === 1)
      return this._options[name];
    this._options[name] = value;
  }

  attr(name, value) {
    if (arguments.length === 0)
      return this._attributes;
    if (arguments.length === 1)
      return this._attributes[name];
    this._attributes[name] = value;
  }

  execute() {
    this.attr('manager').getProcessFlow().execute(this, this._callback);
  }

  done() {
    this.attr('manager').done(this.attr('channel'));
  }
}

module.exports = Task;