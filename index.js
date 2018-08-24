let fs = require('fs');
let Path = require('path');
let Tool = require('ikits');
let iflow = require('ikits/flow');
let Task = require('./lib/Task.js');
let Schedule = require('./lib/Schedule.js');
let EventEmitter = require("events").EventEmitter;

let NOT_SET = 'Not Set';
let Flow = iflow.Flow;
let Processor = iflow.Processor;

class Manager extends EventEmitter {
    constructor(options) {
        super();
        let self = this;
        options = Tool.isObject(options) ? options : {};

        let taskConfig = _getDefaultTaskConfig(options.configFilesPath);
        let managerConfig = _getDefaultManagerConfig(options.configFilesPath);

        Tool.enable(self, 'taskOptions', 2, taskConfig.options);
        Tool.enable(self, 'queueOptions', 2, managerConfig.queueOptions);
        Tool.enable(self, 'commonOptions', 2, managerConfig.commonOptions);
        Tool.enable(self, 'channelOptions', 2, managerConfig.channelOptions);
        Tool.enable(self, 'scheduleOptions', 2, managerConfig.scheduleOptions);
        Tool.enable(self, 'processFlow', 1, new Flow({ returnXargs: true }));

        if (taskConfig.processors instanceof Array) {
            taskConfig.processors.forEach(processor => {
                if (!self.commonOptions().hasOwnProperty(processor.name)) {
                    self.commonOptions(processor.name, NOT_SET);
                }
                self.processFlow().add(new Processor(processor));
            });
        }

        Tool.overrideJson(self.taskOptions(), options);
        Tool.overrideJson(self.queueOptions(), options);
        Tool.overrideJson(self.commonOptions(), options);
        Tool.overrideJson(self.channelOptions(), options);
        Tool.overrideJson(self.scheduleOptions(), options);

        Tool.enable(self, 'schedule', 1, new Schedule(self.scheduleOptions()));
    }

    queue(taskOptions, callback) {
        let self = this;
        taskOptions = Tool.isObject(taskOptions) ? taskOptions : {};
        let task = taskOptions;

        if (!(taskOptions instanceof Task)) {
            Tool.fillJson(taskOptions, self.taskOptions());
            Tool.fillJson(taskOptions, self.commonOptions());
            let options = Tool.divideJson(taskOptions, self.taskOptions());
            task = new Task(options, taskOptions, callback);
        }
        if (!self.listeners('queue').length) {
            self._regist(task);
            return task;
        }
        self.emit('queue', task, function () {
            self._regist(task);
        });
        return task;
    }

    start() {
        this.schedule().start();
    }

    addChannel(options) {
        options = Tool.isObject(options) ? options : {};
        Tool.fillJson(options, this.channelOptions);
        this.schedule().addChannel(options);
    }

    addProcessor(options, anchor, around) {
        let idx;
        let processors = this.processFlow().processors;
        for (let i = 0; i < processors.length; i++) {
            if (processors[i].name === anchor) {
                idx = i;
                break;
            }
        }
        if (idx === undefined) {
            this.processFlow().add(new Processor(options));
            return;
        }
        if (around === 'before') {
            around = 0;
        } else {
            around = 1;
        }
        this.processFlow().add(new Processor(options), idx + around);
    }

    _regist(task) {
        Tool.enable(task, 'manager', 1, this);
        if (task.attr('channel') === 'direct') {
            task.execute();
        }
        this.schedule().enqueue(task);
    }

    queueSize() {
        this.schedule().waitQueueSize();
    }

    done(channel) {
        this.schedule().done(channel);
        if (!this.schedule().getUnfinishedTaskNum()) {
            this.emit('done');
        }
    }
}

function _getDefaultTaskConfig(configFilesPath) {
    let taskConfig = Path.resolve(configFilesPath + '', './task.js');
    if (fs.existsSync(taskConfig)) {
        taskConfig = require(taskConfig);
    } else {
        taskConfig = require(Path.resolve(__dirname, './config/task.js'));
    }
    return taskConfig();
}

function _getDefaultManagerConfig(configFilesPath) {
    let managerConfig = Path.resolve(configFilesPath + '', './manager.js');
    if (fs.existsSync(managerConfig)) {
        managerConfig = require(managerConfig);
    } else {
        managerConfig = require(Path.resolve(__dirname, './config/manager.js'));
    }
    return managerConfig();
}

module.exports = Manager;