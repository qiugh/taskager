const Queue = require('./Queue.js');

class Channel {
    constructor(options) {
        this._runningTaskNum = 0;
        this._autoStart = options.autostart;
        this._lastTaskExecuteTime = new Date();
        this._executionRate = options.interval;
        this._concurrency = options.interval ? 1 : options.concurrency;
    }

    start() {
        if (this._autoStart) return;
        this._autoStart = true;
        this._execute();
    }

    enqueue(task) {
        if (!this._queue) {
            this._queue = new Queue(task.manager().queueOptions());
        }
        let priority = Math.floor(Number(task.attr('priority')));
        this._queue.enqueue(task, priority);
        this._execute();
    }

    dequeue() {
        if (!this._autoStart) return null;
        return this._queue.dequeue();
    }

    size() {
        return this._queue.size();
    }

    done() {
        this._runningTaskNum--;
        this._execute();
    }

    _execute() {
        if (!this._autoStart) return;
        if ((this._runningTaskNum >= this._concurrency) || !this.size())
            return;
        let waitingTime = this._executionRate - Math.max(this._executionRate, new Date() - this._lastTaskExecuteTime);
        if (waitingTime > 0)
            return setTimeout(this.execute, waitingTime);
        let task = this.dequeue();
        this._runningTaskNum++;
        this._lastTaskExecuteTime = new Date();
        task.execute();
    }
}

module.exports = Channel;