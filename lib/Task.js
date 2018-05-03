let np = require('node-processor');

class Task {
  constructor(options, processors, callback) {
    this.options = options;
    this.callback = callback;
    this.processors = processors;
    this.status = { retries: 0 };
  }

  execute() {
    this.manager.getProcessFlow().execute(this,this.callback);
  }

  done() {
    this.manager.done(this.channel());
  }

  priority() {
    return this.processors.priority;
  }

  channel() {
    if (!arguments.length) return (this.processors.channel == undefined) ? 'default_channel' : this.processors.channel;
    this.processors.channel = arguments[0];
  }
  processor(name) {
    return this.processors[name];
  }
}

module.exports = Task;