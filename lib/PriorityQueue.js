class PriorityQueue {

	constructor(options) {

		this.size = 0;
		this.queue = [];
		for (let i = 0; i < options.priorityrange; i++) {
			this.queue.push([]);
		}
	}

	size() {
		return this.size;
	}

	enqueue(queuer) {

		let priority = queuer.priority();
		if ((priority == undefined) || (typeof priority != 'number')) {
			console.warn('priority not exist or not number,set default.');
			priority = Math.ceil(this.queue.length / 2);
		}
		this.queue[priority].push(queuer);
		this.size++;
	}

	dequeue() {

		let queuer = null;
		for (let i = 0; i < this.queue.length; i++) {
			if (!this.queue[i].length) continue;
			queuer = this.queue[i].shift();
			this.size--;
			break;
		}
		return queuer;
	}
}

module.exports = PriorityQueue;