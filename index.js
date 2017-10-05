const fs = require('fs');
const Path = require('path');
const EventEmitter = require("events").EventEmitter;
const Task = require(Path.resolve(__dirname, './lib/Task.js'));
const Schedule = require(Path.resolve(__dirname, './lib/Schedule.js'));

class Worker extends EventEmitter {

	constructor(path, options) {

		super();
		this._init(path);
		this._merge(options || {});
		this.schedule = new Schedule(this.global_schedule_options);
	}

	_init(path) {

		let self = this;
		let task_config = null;
		let worker_config = null;
		if (fs.existsSync(path + 'task.js')) {
			task_config = require(path + 'task.js');
		} else {
			task_config = require(Path.resolve(__dirname, './config/') + '/task.js')
		}
		this.task_config = task_config;
		if (fs.existsSync(path + 'worker.js')) {
			worker_config = require(path + 'worker.js');
		} else {
			worker_config = require(Path.resolve(__dirname, './config/') + '/worker.js');
		}
		this.global_share = worker_config.share;
		this.global_queue_options = worker_config.queue_options;
		this.global_channel_options = worker_config.channel_options;
		this.global_schedule_options = worker_config.schedule_options;
		this.global_task_options = task_config.options;

		Object.keys(task_config).filter(key => (key != 'execute' && key != 'options')).forEach(stage => {
			task_config[stage].forEach(process => {
				self.global_share[process.name] = 'not_set';
			})
		})
	}

	_merge(options) {

		cover_options(this.global_schedule_options, options);
		cover_options(this.global_channel_options, options);
		cover_options(this.global_queue_options, options);
		cover_options(this.global_task_options, options);
		cover_options(this.global_share, options);
	}

	queue(task_options, callback) {

		task_options = task_options || {};
		if (!this.listeners('queue').length) {
			merge_options(task_options, this.global_share);
			merge_options(task_options, this.global_task_options);
			let options = divide_options(task_options, this.global_task_options);
			let task = new Task(options, task_options, callback);
			this.regist(task)
			return;
		}

		new Promise((resolve, reject) => {
			self.emit('queue', task_options, resolve, reject)
		}).then(function () {
			merge_options(task_options, this.global_share);
			merge_options(task_options, this.global_task_options);
			let options = divide_options(task_options, this.global_task_options);
			let task = new Task(options, task_options, callback);
			self.regist(task);
		})
	}

	queuet(task) {

		if (!this.listeners('queuet').length) {
			this.regist(task);
			return;
		}
		new Promise((resolve, reject) => {
			this.emit('queuet', task, resolve, reject)
		}).then(function () {
			this.regist(task);
		})
	}

	regist(task) {
		let self = this;
		task.manager = function () {
			return self;
		}
		self.schedule.enqueue(task);
	}

	addChannel(options) {

		if (typeof options != 'object' || !(options.hasOwnProperty('channel')))
			throw new Error('options should be a object which has own properties such as "channel"、"ratelimit"、"parallel"');
		merge_options(options, this.global_channel_options);
		let channel_id = options['channel'];
		delete options['channel'];
		this.schedule.addChannel(channel_id, options);
	}

	done(channel) {

		this.schedule.done(channel);
		if (!this.schedule.unfinished_task_num) {
			this.emit('drain');
		}
	}

	
}

function cover_options(target, source) {

	let target_keys = Object.keys(target);
	for (let i = 0; i < target_keys.length; i++) {
		if (source.hasOwnProperty(target_keys[i])) {
			target[target_keys[i]] = source[target_keys[i]];
			delete source[target_keys[i]];
		}
	}
}

function merge_options(new_options, default_options) {

	let def_keys = Object.keys(default_options);
	for (let i = 0; i < def_keys.length; i++) {
		if (!(new_options.hasOwnProperty(def_keys[i])) && default_options[def_keys[i]] !== 'not_set') {
			let type = typeof default_options[def_keys[i]];
			new_options[def_keys[i]] = (type === 'object') ? JSON.parse(JSON.stringify(default_options[def_keys[i]])) : default_options[def_keys[i]];
		} else if ((def_keys[i] in new_options) && (typeof default_options[def_keys[i]] === 'object')) {
			new_options[def_keys[i]] = merge_options(new_options[def_keys[i]], default_options[def_keys[i]])
		}
	}
	return new_options;
}

function divide_options(task_options, default_options) {

	let options = {};
	for (let key in default_options) {
		if (task_options.hasOwnProperty(key)) {
			options[key] = task_options[key];
			delete task_options[key];
		}
	}
	return options;
}

module.exports = Worker;