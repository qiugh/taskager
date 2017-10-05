class Task {

	constructor(options, processors, callback) {

		this.options = options;
		this.callback = callback;
		this.processors = processors;
		this.status = { retries: 0, snum: 0 };
	}

	execute() {

		let self = this;
		sync_process_flow(self, null, 'before_execute');
		async_before_execute_process_flow(self);
	}

	done() {

		this.manager().done(this.channel());
	}

	priority() {

		return this.processors.priority;
	}

	channel() {

		if (!arguments.length) return (this.processors.channel == undefined) ? 'default_channel' : this.processors.channel;
		this.processors.channel = arguments[0];
	}
	processor(name) {
		return this.processors[name];
	}
}

function wrap_callback(task) {

	return function (error, result) {

		if (!error) {
			task.status.snum = 1;
			sync_process_flow(task, result, 'after_execute');
			task.callback(null, result, task);
			return;
		}
		let retries = get_attribute(task, "retries");
		if (!retries || task.status.retries >= retries) {
			task.callback(error, null, task);
			return;
		}
		task.status.retries++;
		let delaytime = get_attribute(task, "delaytime");
		setTimeout(() => {
			task.manager().queuet(task);
			task.done();
		}, delaytime);
	}
}

function sync_process_flow(task, result, stage) {

	let processes = task.manager()['task_config'][stage];
	for (let i = 0; i < processes.length; i++) {
		let process = processes[i];
		process.func(process.name, task, result, process.callback);
	}
}

function async_before_execute_process_flow(task) {

	let execute = task.manager()['task_config'].execute;
	let processes = task.manager()['task_config'].before_execute_async;
	if (!processes.length) {
		execute(task.options, wrap_callback(task));
		return;
	}

	let promises = processes.map(process => {
		return create_promise(process.name, task, process.func, process.callback);
	});
	Promise.all(promises).then(function () {
		execute(task.options, wrap_callback(task));
	}).catch((error) => {
		throw error;
	})
}

function create_promise(processor, param, func, callback) {

	return new Promise((resolve, reject) => {
		func(processor, param, function () {
			let callbackArguments = Array.apply(null, arguments);
			callbackArguments.push(resolve, reject);
			callback.apply(null, callbackArguments);
		});
	})
}

function get_attribute(task, name) {
	if (task.processors.hasOwnProperty(name)) {
		return task.processors[name];
	}
	return undefined;
}

module.exports = Task;