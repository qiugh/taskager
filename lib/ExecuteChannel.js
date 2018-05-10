const PriorityQueue = require(__dirname + '/PriorityQueue.js');

class ExecuteChannel {
  constructor(options) {
    this._runningTaskNum = 0;
    this._lastTaskExecuteTime = new Date();
    this._executionRate = options.ratelimit;
    this._concurrency = options.ratelimit ? 1 : options.concurrency;
  }

  enqueue(task) {
    if (!this._queue) {
      this._queue = new PriorityQueue(task.attr('manager').getQueueOptions());
    }
    this._queue.enqueue(task);
    this._execute();
  }

  dequeue() {
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

module.exports = ExecuteChannel;