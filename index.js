let fs = require('fs');
let Path = require('path');
let np = require('node-processor');
let EventEmitter = require("events").EventEmitter;
let Task = require(Path.resolve(__dirname, './lib/Task.js'));
let Schedule = require(Path.resolve(__dirname, './lib/Schedule.js'));

let Flow = np.Flow, Processor = np.Processor;
const NOT_SET = 'Not Set';

class Manager extends EventEmitter {
  constructor(options) {
    super();
    options = options || {};
    this.processFlow = new Flow();
    this._initTaskAndManager(options);
    this.schedule = new Schedule(this.scheduleOptions);
  }

  queue(taskOptions, callback) {
    let self = this;
    taskOptions = taskOptions || {};
    let task = taskOptions;
    if (!(taskOptions instanceof Task)) {
      enrichOptions(taskOptions, self.commonOptions, true);
      enrichOptions(taskOptions, self.taskOptions, true);
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
    }).catch(e => {
      self.emit('error', e);
    });
  }

  addChannel(options) {
    options = options || {};
    enrichOptions(options, this.channelOptions, true);
    this.schedule.addChannel(options);
  }

  addProcessor(options, anchor, around) {
    let idx;
    let processors = this.processFlow.processors;
    for (let i = 0; i < processors.length; i++) {
      if (processors[i].name === anchor) {
        idx = i;
        break;
      }
    }
    if (idx === undefined) return;
    if (!around || isNaN(Number(around))) {
      around = 0;
    }
    this.processFlow.add(new Processor(options), idx + around);
  }

  getProcessFlow() {
    return this.processFlow;
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

  _initTaskAndManager(options) {
    let self = this;
    let [taskConfig, managerConfig] = _getDefaultConfig(options.configFilesPath);

    self.commonOptions = managerConfig.commonOptions;
    self.queueOptions = managerConfig.queueOptions;
    self.channelOptions = managerConfig.channelOptions;
    self.scheduleOptions = managerConfig.scheduleOptions;
    self.taskOptions = taskConfig.options;

    if (taskConfig.processors instanceof Array) {
      taskConfig.processors.forEach(processor => {
        if (!self.commonOptions.hasOwnProperty(processor.name)) {
          self.commonOptions[processor.name] = NOT_SET;
        }
        self.processFlow.add(new Processor(processor));
      });
    }
    _overrideOptions(self.scheduleOptions, options, true);
    _overrideOptions(self.channelOptions, options, true);
    _overrideOptions(self.queueOptions, options, true);
    _overrideOptions(self.commonOptions, options, true);
    _overrideOptions(self.taskOptions, options, true);
  }

  _regist(task) {
    task.attr('manager', this);
    this.schedule.enqueue(task);
  }

  _done(channel) {
    this.schedule.done(channel);
    if (!this.schedule.getUnfinishedTaskNum()) {
      this.emit('done');
    }
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

function _getDefaultConfig(configFilesPath) {
  let taskConfig = Path.resolve(configFilesPath + '', './task.js');
  let managerConfig = Path.resolve(configFilesPath + '', './manager.js');
  if (fs.existsSync(taskConfig)) {
    taskConfig = require(taskConfig);
  } else {
    taskConfig = require(Path.resolve(__dirname, './config/task.js'));
  }
  if (fs.existsSync(managerConfig)) {
    managerConfig = require(managerConfig);
  } else {
    managerConfig = require(Path.resolve(__dirname, './config/manager.js'));
  }
  return [taskConfig(), managerConfig()];
}

module.exports = Manager;