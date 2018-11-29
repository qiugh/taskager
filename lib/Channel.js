const Queue = require('./Queue.js');

class Channel {
    constructor(options) {
        this._runningTaskNum = 0;
        this._autostart = options.autostart;
        this._lastTaskExecuteTime = new Date();
        this._executionRate = options.ratelimit;
        this._concurrency = options.concurrency;
    }

    initQueue(options) {
        this._queue = new Queue(options);
    }

    start() {
        if (this._autostart)
            return;
        this._autostart = true;
        this._execute();
    }

    enqueue(task, priority) {
        this._queue.enqueue(task, priority);
        this._execute();
    }

    dequeue() {
        if (!this._autostart)
            return null;
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
        if (!this._autostart || !this.size())
            return;
        if ((this._concurrency !== -1 && this._runningTaskNum >= this._concurrency))
            return;
        let waitingTime = this._executionRate
            - Math.max(this._executionRate,
                new Date() - this._lastTaskExecuteTime);
        if (waitingTime > 0)
            return setTimeout(this._execute, waitingTime);
        let task = this.dequeue();
        this._runningTaskNum++;
        this._lastTaskExecuteTime = new Date();
        task._execute();
    }
}

module.exports = Channel;
