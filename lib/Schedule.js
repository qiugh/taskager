const ExecuteChannel = require(__dirname + '/ExecuteChannel.js');

class Schedule {
	constructor(options) {
		this.channels = {};
		this.unfinishedTaskNum = 0;
		this.idle = options.idle;
	}

	getUnfinishedTaskNum() {
		return this.unfinishedTaskNum;
	}

	enqueue(task) {
		let channelId = task.channel();
		let channel = this.channels[channelId];
		if (!channel) {
			channel = new ExecuteChannel(task.manager.getChannelOptions());
			this.channels[channelId] = channel;
		}
		this.unfinishedTaskNum++;
		channel.enqueue(task);
	}

	done(channelId) {
		this.unfinishedTaskNum--;
		let channel = this.channels[channelId];
		channel.done();

		let task = null;
		if (channel.queuers() === 0 && !this.idle && (task = this.waiter())) {
			task.channel(channelId);
			channel.enqueue(task);
		}
	}

	waiter() {
		let task;
		let channelIds = Object.keys(this.channels);
		for (let i = 0; i < channelIds.length; i++) {
			if (this.channels[channelIds[i]].queuers() > 1) {
				task = this.channels[channelIds[i]].dequeue();
				break;
			}
		}
		return task;
	}

	addChannel(options) {
		let channel = this.channels[options.channel];
		if (!channel) {
			this.channels[options.channel] = new ExecuteChannel(options);
		}
	}
}

module.exports = Schedule