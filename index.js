const fs = require('fs');
const Path = require('path');
const EventEmitter = require("events").EventEmitter;
const Task = require(Path.resolve(__dirname, './lib/Task.js'));
const Schedule = require(Path.resolve(__dirname, './lib/Schedule.js'));

const NOT_SET = 'Not Set';

class Manager extends EventEmitter {
  constructor(options) {
    super();
    options = (typeof options !== 'object' || options === null) ? {} : options;
    this._initTaskAndManager(options.configFilesPath);
    _overrideOptions(this.scheduleOptions, options, true);
    _overrideOptions(this.channelOptions, options, true);
    _overrideOptions(this.queueOptions, options, true);
    _overrideOptions(this.commonOptions, options, true);
    _overrideOptions(this.taskOptions, options, true);
    this.schedule = new Schedule(this.scheduleOptions);
  }

  addChannel(options) {
    if (typeof options !== 'object' || options === null || !(options.hasOwnProperty('channel')))
      throw new Error('options should be a object which has own properties such as "channel"、"ratelimit"、"parallel"');
    enrichOptions(options, this.channelOptions);
    this.schedule.addChannel(options);
  }

  done(channel) {
    this.schedule.done(channel);
    if (!this.schedule.getUnfinished_task_num()) {
      this.emit('drain');
    }
  }

  getChannelOptions() {
    return this.channelOptions;
  }

  getQueueOptions() {
    return this.queueOptions;
  }

  getCommonOptions() {
    return this.commonOptions;
  }
  _initTaskAndManager(configFilesPath) {
    let self = this;
    let [taskConfig, managerConfig] = _readConfigFiles(configFilesPath);

    self.commonOptions = managerConfig.commonOptions;
    self.queueOptions = managerConfig.queueOptions;
    self.channelOptions = managerConfig.channelOptions;
    self.scheduleOptions = managerConfig.scheduleOptions;
    self.taskOptions = taskConfig.options;

    ['before', 'after'].forEach(function (stage) {
      taskConfig[stage].forEach(processor => {
        self.commonOptions[processor.name] = NOT_SET;
      })
    });
  }

  queue(taskOptions, callback) {
    let self = this;
    taskOptions = taskOptions || {};
    let task = taskOptions;
    if (!(taskOptions instanceof Task)) {
      enrichOptions(taskOptions, self.commonOptions);
      enrichOptions(taskOptions, self.taskOptions);
      let options = divideOptions(taskOptions, self.taskOptions);
      task = new Task(options, taskOptions, callback);
    }
    if (!self.listeners('queue').length) {
      self._regist(task);
      return;
    }
    new Promise((resolve, reject) => {
      self.emit('queue', task, resolve, reject);
    }).then(function () {
      self._regist(task);
    });
  }

  _regist(task) {
    task.manager = this;
    self.schedule.enqueue(task);
  }
}

function _overrideOptions(master, slave, first) {
  if (typeof slave !== 'object' || typeof master !== 'object' || master === null) {
    return slave;
  }
  if (first) {
    for (let mkey in master) {
      if (slave.hasOwnProperty(mkey)) {
        master[mkey] = _overrideOptions(master[mkey], slave[mkey]);
      }
    }
  } else {
    for (let skey in slave) {
      master[skey] = _overrideOptions(master[skey], slave[skey]);
    }
  }
  return master;
}

function enrichOptions(newOptions, defaultOptions, first) {
  if (typeof newOptions !== 'object' || newOptions === null
    || typeof defaultOptions !== 'object' || defaultOptions === null) {
    return newOptions;
  }
  for (let dkey in defaultOptions) {
    if (first && defaultOptions[dkey] === NOT_SET) continue;
    if (!newOptions.hasOwnProperty(dkey)) {
      newOptions[dkey] = typeof defaultOptions[dkey] === 'object' ? JSON.parse(JSON.stringify(defaultOptions[dkey])) : defaultOptions[dkey];
      continue;
    }
    if (typeof newOptions[dkey] === 'object' && typeof defaultOptions[dkey] === 'object') {
      newOptions[dkey] = enrichOptions(newOptions[dkey], defaultOptions[dkey]);
    }
  }
  return newOptions;
}

function divideOptions(taskOptions, defaultOptions) {
  let options = {};
  for (let key in defaultOptions) {
    if (taskOptions.hasOwnProperty(key)) {
      options[key] = taskOptions[key];
      delete taskOptions[key];
    }
  }
  return options;
}

function _readConfigFiles(configFilesPath) {
  let taskConfig = configFilesPath + 'task.js';
  let managerConfig = configFilesPath + 'manager.js';
  if (fs.existsSync(taskConfig)) {
    taskConfig = require(taskConfig);
  } else {
    taskConfig = require(Path.resolve(__dirname, './config/') + '/task.js')
  }
  if (fs.existsSync(managerConfig)) {
    managerConfig = require(managerConfig);
  } else {
    managerConfig = require(Path.resolve(__dirname, './config/') + '/worker.js');
  }
  return [taskConfig, managerConfig];
}

module.exports = Worker;