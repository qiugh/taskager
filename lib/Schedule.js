const ExecuteChannel = require(__dirname + '/ExecuteChannel.js');

class Schedule {

	constructor(options) {

		this.channels = {};
		this.unfinished_task_num = 0;
		this.noidle = options.noidle;
	}

	enqueue(task) {

		let channel_id = task.channel();
		let channel = this.channels[channel_id];
		if (!channel) {
			channel = new ExecuteChannel(task.manager().global_channel_options);
			this.channels[channel_id] = channel;
		}
		this.unfinished_task_num++;
		channel.enqueue(task);
	}

	done(channel_id) {

		this.unfinished_task_num--;
		let channel = this.channels[channel_id];
		channel.done();
		let task = null;
		if (!channel.queuers() && this.noidle && (task = this.waiter())) {
			task.channel(channel_id);
			channel.enqueue(task);
		}
	}

	waiter() {

		let task = null;
		let channel_ids = Object.keys(this.channels);
		for (let i = 0; i < channel_ids.length; i++) {
			if (this.channels[channel_ids[i]].queuers() > 1) {
				task = this.channels[channel_ids[i]].dequeue();
				break;
			}
		}
		return task;
	}

	addChannel(channel_id, options) {

		let channel = this.channels[channel_id];
		if (!channel) {
			this.channels[channel_id] = new ExecuteChannel(options);
		}
	}
}

module.exports = Schedule