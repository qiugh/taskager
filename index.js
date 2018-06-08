let fs = require('fs');
let Path = require('path');
let Tool = require('ikits/tool');
let Np = require('node-processor');
let EventEmitter = require("events").EventEmitter;
let Task = require(Path.resolve(__dirname, './lib/Task.js'));
let Schedule = require(Path.resolve(__dirname, './lib/Schedule.js'));

const NOT_SET = 'Not Set';
let Flow = Np.Flow, Processor = Np.Processor;

class Manager extends EventEmitter {
  constructor(options) {
    super();
    if (Tool.isBasic(options)) {
      options = {};
    }
    this.processFlow = new Flow({ returnXargs: true });
    this._initTaskAndManager(options);
    this.schedule = new Schedule(this.scheduleOptions);
  }

  queue(taskOptions, callback) {
    let self = this;
    if (Tool.isBasic(taskOptions)) {
      taskOptions = {};
    }
    let task = taskOptions;
    if (!(taskOptions instanceof Task)) {
      _enrichOptions(taskOptions, self.commonOptions, true);
      _enrichOptions(taskOptions, self.taskOptions, true);
      let options = _divideOptions(taskOptions, self.taskOptions);
      task = new Task(options, taskOptions, callback);
    }
    if (!self.listeners('queue').length) {
      self._regist(task);
      return;
    }
    new Promise((resolve) => {
      self.emit('queue', task, () => {
        self._regist(task);
        resolve();
      });
    }).catch(e => {
      self.emit('error', e);
    });
  }

  start() {
    this.schedule.start();
  }

  getChannel(channelId) {
    return this.schedule.getChannel(channelId);
  }

  addChannel(options) {
    if (Tool.isBasic(options)) {
      options = {};
    }
    _enrichOptions(options, this.channelOptions, true);
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
    if (task.attr('channel') === 'direct') {
      task.execute();
    }
    this.schedule.enqueue(task);
  }

  done(channel) {
    this.schedule.done(channel);
    if (!this.schedule.getUnfinishedTaskNum()) {
      this.emit('done');
    }
  }
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