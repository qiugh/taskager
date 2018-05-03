class PriorityQueue {
	constructor(options) {
		this.size = 0;
		this.queue = [];
		for (let i = 0; i < options.priorityrange; i++) {
			this.queue.push([]);
		}
	}

	enqueue(task) {
		let priority = Math.floor(Number(task.priority()));
		if (isNaN(priority) || priority < 0 || priority > (this.queue.length - 1)) {
			priority = Math.floor(this.queue.length / 2);
		}
		this.queue[priority].push(task);
		this.size++;
	}

	dequeue() {
		let task = null;
		for (let i = 0; i < this.queue.length; i++) {
			if (!this.queue[i].length) continue;
			task = this.queue[i].shift();
			this.size--;
			break;
		}
		return task;
	}
}

module.exports = PriorityQueue;