const fs = require('fs');
const GLOBAL_APP_WORKER_NAME = 'asyncworker';

function globalize() {

    if (!arguments.length) return process[GLOBAL_APP_WORKER_NAME];
    process[GLOBAL_APP_WORKER_NAME] = arguments[0];
}

function attribute(name) {

    if (arguments.length == 1) return globalize()[arguments[0]];
    if (arguments.length == 2) globalize()[arguments[0]] = arguments[1];
}

function config(config_path) {

	let worker = globalize();
	let user_task_config_path = config_path + 'task.js';
	let default_task_config_path = path.resolve(__dirname, './config/') + 'task.js';
	if (fs.existsSync(user_task_config_path)) {
		worker.taskconfig = require(user_task_config_path);
	} else {
		worker.taskconfig = require(default_task_config_path);
	}
	let user_worker_config_path = config_path + 'worker.js';
	let default_worker_config_path = path.resolve(__dirname, './config/') + 'worker.js';
	if (fs.existsSync(user_worker_config_path)) {
		worker.workerconfig = require(user_worker_config_path);
	} else {
		worker.workerconfig = require(default_worker_config_path);
	}
}

function init(options) {

	options = options || {};
	let task_options_keys = Object.keys(this.taskconfig.options);
	let global_task_options = get_values(task_options_keys, options);
	Tool.merge_options(global_task_options, this.taskconfig.options);

	let task_processors_keys = this.taskconfig.before_execute.map(element => element.name).
		concat(this.taskconfig.after_execute.map(element => element.name));
	let global_task_processors_options = get_values(task_processors_keys, options);

	let task_worker_share_keys = Object.keys(this.workerconfig.share);
	let global_worker_share_options = get_values(task_worker_share_keys, options);
	Tool.merge_options(global_worker_share_options, this.workerconfig.share);

	let worker_options = {};
	Object.keys(this.workerconfig).filter(element => (element != 'share')).forEach(element => {
		Object.keys(this.workerconfig[element]).forEach(key => {
			worker_options[key] = this.workerconfig[element][key];
		});
	});

	let global_worker_options = get_values(Object.keys(worker_options), options);
	Tool.merge_options(global_worker_options, worker_options);

	this.global_task_options = global_task_options;
	this.global_task_processors_options = global_task_processors_options;
	this.global_worker_share_options = global_worker_share_options;
	this.global_worker_options = global_worker_options;

	this.schedule = new Schedule();

}

function get_values(keys, object) {

    let result = {};
    keys.forEach(function (element) {

        if (object.hasOwnProperty(element)) {
            result[element] = object[element];
            delete object[element];
        }
    });
    return result;
}

function divide_options(task_options, options) {


    let global_task_options_keys = Object.keys(process.global_worker_app.global_task_options);

    let temp = get_values(global_task_options_keys, task_options);
    Tool.merge_options(temp, global_task_options_keys);

    Tool.merge_options(task_options, process.global_worker_app.global_task_processors_options)
    return temp;

}

function merge_options(new_options, default_options) {

    let def_keys = Object.keys(default_options);
    for (let i = 0; i < def_keys.length; i++) {
        if (!(def_keys[i] in new_options) && default_options[def_keys[i]] !== 'not_set') {
            let type = typeof default_options[def_keys[i]];
            new_options[def_keys[i]] = (type === 'object') ? JSON.parse(JSON.stringify(default_options[def_keys[i]])) : default_options[def_keys[i]];
        } else if ((def_keys[i] in new_options) && (typeof default_options[def_keys[i]] === 'object')) {
            new_options[def_keys[i]] = merge_options(new_options[def_keys[i]], default_options[def_keys[i]])
        }
    }
    return new_options;
}

function clone(item) {

    let type = ['number', 'string', 'boolean'];
    if (!item || !!~(type.indexOf(typeof item))) return item;
    return JSON.parse(JSON.stringify(item));
}

function prioritylimit() {


}

function get_default_channel_options() {


}

exports.merge_options = merge_options;
exports.prioritylimit = prioritylimit;
