class Task {
    constructor(options, info, callback) {
        this.info = info;
        this.options = options;
        this._callback = callback;
    }

    execute() {
        this.manager().processFlow.execute(this, this._callback);
    }

    done() {
        this.manager().done(this.info.channel);
    }
}

module.exports = Task;