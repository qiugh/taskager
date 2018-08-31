class Queue {
    constructor(options) {
        this._num = 0;
        this._queue = [];
        for (let i = 0; i < options.priorityrange; i++) {
            this._queue.push([]);
        }
    }

    size() {
        return this._num;
    }

    enqueue(task, priority) {
        if (!this._queue[priority]) {
            priority = Math.floor(this._queue.length / 2);
        }
        this._queue[priority].push(task);
        this._num++;
    }

    dequeue() {
        let task = null;
        for (let i = 0; i < this._queue.length; i++) {
            if (!this._queue[i].length)
                continue;
            task = this._queue[i].shift();
            this._num--;
            break;
        }
        return task;
    }
}

module.exports = Queue;