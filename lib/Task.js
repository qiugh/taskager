let Tool = require('./util');

class Task {
    constructor(options, attributes, callback) {
        this._callback = callback;
        Tool.enable(this, 'attr', 2, attributes);
        Tool.enable(this, 'options', 2, options);
    }

    execute() {
        this.manager().processFlow().execute(this, this._callback);
    }

    done() {
        if (this.attr('channel') === 'direct') {
            return;
        }
        this.manager().done(this.attr('channel'));
    }
}

module.exports = Task;