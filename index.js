let Path = require('path');
let Util = require('./lib/util');
let Task = require('./lib/Task');
let Channel = require('./lib/Channel.js');
let NodeProcessor = require('node-processor');
let EEmitter = require("events").EventEmitter;

let NOT_SET = 'Not Set';
let Flow = NodeProcessor.Flow;
let Processor = NodeProcessor.Processor;

class Manager extends EEmitter {
    constructor(options) {
        super();
        let self = this;
        options = isOption(options);

        self._channels = {};
        self._unfinishedTaskNum = 0;
        self._loadbalance = options.loadbalance;
        self.processFlow = new Flow({
            returnXargs: options.returnxargs
        });

        let [taskConfig, managerConfig] = [
            'task',
            'manager'
        ].map(name => {
            return _getConfig(options.config, name);
        });

        self.managerOptions = managerConfig;
        self.taskOptions = taskConfig.options;

        taskConfig.processors.forEach(processor => {
            if (!self.managerOptions.hasOwnProperty(processor.name)) {
                self.managerOptions[processor.name] = NOT_SET;
            }
            self.processFlow.add(new Processor(processor));
        });

        Util.overrideJson(self.taskOptions, options);
        Util.overrideJson(self.managerOptions, options);
    }

    queue(taskOptions, callback) {

        taskOptions = isOption(taskOptions);
        let self = this;
        let task = taskOptions;
        if (!(taskOptions instanceof Task)) {
            Util.fillJson(taskOptions, self.taskOptions);
            Util.fillJson(taskOptions, self.managerOptions);
            let options = Util.divideJson(taskOptions, self.taskOptions);
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
        for (let channelId in this._channels) {
            this.getChannel(channelId).start();
        }
    }

    addChannel(options) {
        options = isOption(options);
        Util.fillJson(options, this.taskOptions());
        _addChannel(options);
    }

    _addChannel(options, channelId) {
        channelId = channelId || options.channel;
        let channel = this.getChannel(channelId);
        if (!channel) {
            channel = new Channel(options);
            channel.initQueue(this.managerOptions);
            this._channels[channelId] = channel;
        }
        return channel;
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
        let self = this;
        task.manager = function () {
            return self;
        }
        this._unfinishedTaskNum++;
        let channelId = task.attr('channel');
        if (channelId === 'direct')
            return task.execute();
        let channel = this._addChannel(self.managerOptions, channelId);
        let priority = Math.floor(Number(task.attr('priority')));
        channel.enqueue(task, priority);
    }




    done(channelId) {
        this._unfinishedTaskNum--;
        if (!this._unfinishedTaskNum) {
            this.emit('done');
            return;
        }
        if (channelId == 'direct') {
            return;
        }
        let channel = this.getChannel(channelId);
        channel.done();
        let task = null;
        if (channel.size() || !this._loadbalance)
            return;
        if (!(task = this._dequeue()))
            return;
        task.attr('channel', channelId);
        let priority = Math.floor(Number(task.attr('priority')));
        channel.enqueue(task, priority);
    }

    queueSize() {
        let cnt = 0;
        for (let channelId in this._channels) {
            cnt += this.getChannel(channelId).size();
        }
        return cnt;
    }
    getChannel(channelId) {
        return this._channels[channelId];
    }

    _dequeue() {
        let task;
        for (let channelId in this._channels) {
            if (this.getChannel(channelId).size() > 1) {
                task = this.getChannel(channelId).dequeue();
                break;
            }
        }
        return task;
    }

}

function _getConfig(config, name) {
    config = Path.resolve(config + '', './' + name + '.js');
    try {
        config = require(config);
    } catch (e) {
        //console.error(e);
        config = require(Path.resolve(__dirname, './config/' + name + '.js'));
    }
    return config();
}

function isOption(options) {
    if (typeof options !== 'object' || options === null) {
        return {};
    }
    return options;
}

module.exports = Manager;