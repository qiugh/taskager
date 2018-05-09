let np = require('node-processor');

class Task {
  constructor(options, callback) {
    this.options = options;
    this.callback = callback;
  }

  manager() {
    if (!arguments.length)
      return this.manager;
    this.manager = arguments[0];
  }

  execute() {
    this.manager().getProcessFlow().execute(this, this.callback);
  }

  done() {
    this.manager().done(this.channel());
  }

  priority() {
    return this.options.priority;
  }

  channel() {
    if (!arguments.length)
      return (this.options.channel == undefined) ? 'defaultChannel' : this.options.channel;
    this.options.channel = arguments[0];
  }
}

module.exports = Task;