class Task {
    constructor(options, callback) {
        this.options = options;
        this.callback = callback;
    }

    _execute() {
        this.manager().process(this);
    }

    done() {
        this.manager().done(this);
    }
}

module.exports = Task;