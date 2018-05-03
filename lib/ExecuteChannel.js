const PriorityQueue = require(__dirname + '/PriorityQueue.js');

class ExecuteChannel {
	constructor(options) {
		this.runningTaskNum = 0;
		this.lastTaskExecuteTime = new Date();
		this.executionRate = options.rate;
		this.parallelExecutionNum = options.rate ? 1 : options.parallel;
	}

	enqueue(task) {
		if (!this.queue) {
			this.queue = new PriorityQueue(task.manager.queueOptions);
		}
		this.queue.enqueue(task);
		this._execute();
	}

	dequeue() {
		return this.queue.dequeue();
	}

	queuers() {
		return this.queue.size;
	}

	done() {
		this.runningTaskNum--;
		this._execute();
	}

	_execute() {
		if ((this.runningTaskNum >= this.parallelExecutionNum) || !this.queuers())
			return;
		let waitingTime = this.executionRate - Math.max(this.executionRate, new Date() - this.lastTaskExecuteTime);
		if (waitingTime > 0)
			return setTimeout(this.execute, waitingTime);
		let task = this.dequeue();
		this.runningTaskNum++;
		this.lastTaskExecuteTime = new Date();
		task.execute();
	}
}

module.exports = ExecuteChannel;