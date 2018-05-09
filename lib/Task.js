let np = require('node-processor');

class Task {
  constructor(options, processors, callback) {
    this.options = options;
    this.processors = processors;
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
    return this.processors.priority;
  }

  channel() {
    if (!arguments.length)
      return (this.processors.channel === undefined) ? 'defaultChannel' : this.processors.channel;
    this.processors.channel = arguments[0];
  }
}

module.exports = Task;