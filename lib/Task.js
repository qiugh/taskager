let Tool = require('ikits/tool');

class Task {
  constructor(options, attributes, callback) {
    this._attr = attributes;
    this._options = options;
    this._callback = callback;
    Tool.enable(this, 'attr');
    Tool.enable(this, 'options');
  }

  execute() {
    this.attr('manager').getProcessFlow().execute(this, this._callback);
  }

  done() {
    if (this.attr('channel') === 'direct') {
      return;
    }
    this.attr('manager').done(this.attr('channel'));
  }
}

module.exports = Task;