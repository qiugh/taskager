const PriorityQueue = require(__dirname + '/PriorityQueue.js');

class ExecuteChannel {

	constructor(options) {

		this.queue = null;
		this.running_task_num = 0;
		this.last_task_execute_time = new Date();
		this.task_execute_rate = options.ratelimit;
		this.task_parallel_num = options.ratelimit ? 1 : options.parallel;
	}

	enqueue(task) {

		if (this.queue == null) {
			this.queue = new PriorityQueue(task.manager().global_queue_options);
		}
		this.queue.enqueue(task);
		this.execute();
	}

	dequeue() {

		return this.queue.dequeue();
	}

	queuers() {

		return this.queue.size();
	}

	done() {

		this.running_task_num--;
		this.execute();
	}

	execute() {

		if ((this.running_task_num >= this.task_parallel_num) || !this.queuers()) return;

		let need_wait_time = this.task_execute_rate - Math.max(this.task_execute_rate, new Date() - this.last_task_execute_time);
		if (need_wait_time > 0) return setTimeout(this.execute, need_wait_time);

		let task = this.dequeue();
		this.running_task_num++;
		this.last_task_execute_time = new Date();
		task.execute();
	}
}

module.exports = ExecuteChannel;