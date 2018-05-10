let np = require('node-processor');

class Task {
  constructor(options, attributes, callback) {
    this.options = options;
    this.attributes = attributes;
    this.callback = callback;
  }

  opt(name, value) {
    if (arguments.length === 0) {
      return this.options;
    }
    if (arguments.length === 1) {
      return this.options[name];
    }
    this.options[name] = value;
  }

  attr(name, value) {
    if (arguments.length === 0) {
      return this.attributes;
    }
    if (arguments.length === 1) {
      return this.attributes[name];
    }
    this.attributes[name] = value;
  }

  execute() {
    this.attr('manager').getProcessFlow().execute(this, this.callback);
  }

  done() {
    this.attr('manager').done(this.attr('channel'));
  }
}

module.exports = Task;