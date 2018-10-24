let Path = require('path');
let Task = require('./lib/Task');
let Channel = require('./lib/Channel.js');
let NodeProcessor = require('node-processor');
let EEmitter = require("events").EventEmitter;

let NOT_SET = 'Not_Set';
let Flow = NodeProcessor.Flow;
let Processor = NodeProcessor.Processor;

class Manager extends EEmitter {
    constructor(options) {
        super();
        let self = this;
        options = isOption(options);

        self.taskOptions = _getConfig(options, 'task');
        self.managerOptions = _getConfig(options, 'manager');

        overrideJson(self.taskOptions, options);
        overrideJson(self.managerOptions, options);

        self._channels = {};
        self._unfinishedTaskNum = 0;
        console.log(self.managerOptions.returnxargs)
        self.processFlow = new Flow({
            returnXargs: self.managerOptions.returnxargs
        });

        let processors = _getConfig(options, 'process');
        processors.forEach(proc => {
            if (!self.managerOptions.hasOwnProperty(proc.name)) {
                self.managerOptions[proc.name] = NOT_SET;
            }
            self.processFlow.add(new Processor(proc));
        });
    }

    queue(taskOptions, callback) {
        let self = this;
        taskOptions = isOption(taskOptions);
        let task = taskOptions;
        if (!(taskOptions instanceof Task)) {
            
            fillJson(taskOptions, self.taskOptions);
            fillJson(taskOptions, self.managerOptions);

            //let options = divideJson(taskOptions, self.taskOptions);
            task = new Task(taskOptions, callback);
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
            this._channels[channelId].start();
        }
    }

    addChannel(options) {
        options = isOption(options);
        fillJson(options, this.taskOptions);
        this._getOrCreateChannel(options);
    }

    _getOrCreateChannel(options, channelId) {
        channelId = channelId || options.channel;
        let channel = this._channels[channelId];
        if (!channel) {
            channel = new Channel(options);
            channel.initQueue(this.managerOptions);
            this._channels[channelId] = channel;
        }
        return channel;
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
        if (idx === undefined) {
            this.processFlow.add(new Processor(options));
            return;
        }
        if (around === 'before') {
            around = 0;
        } else {
            around = 1;
        }
        this.processFlow.add(new Processor(options), idx + around);
    }

    _regist(task) {
        let self = this;
        task.manager = function () {
            return self;
        }
        this._unfinishedTaskNum++;
        let channelId = task.options.channel;
        if (channelId === 'direct')
            return task.execute();
        let channel = this._getOrCreateChannel(self.managerOptions, channelId);
        let priority = Math.floor(Number(task.options.priority));
        channel.enqueue(task, priority);
    }

    process(task){
        this.processFlow.execute(task, task.callback);
    }

    done(task) {
        let channelId = task.options.channel;
        this._unfinishedTaskNum--;
        if (!this._unfinishedTaskNum) {
            this.emit('done');
            return;
        }
        if (channelId == 'direct') {
            return;
        }
        let channel = this._channels[channelId];
        channel.done();

        task = null;
        if (channel.size() || !this.managerOptions.loadbalance)
            return;
        if (!(task = this._dequeue()))
            return;
        task.options.channel = channelId;
        let priority = Math.floor(Number(task.options.priority));
        channel.enqueue(task, priority);
    }

    stats() {
        let cnt = 0;
        for (let channelId in this._channels) {
            cnt += this._channels[channelId].size();
        }
        return [cnt, this._unfinishedTaskNum - cnt];
    }

    _dequeue() {
        let task;
        for (let channelId in this._channels) {
            if (this._channels[channelId].size() > 1) {
                task = this._channels[channelId].dequeue();
                break;
            }
        }
        return task;
    }
}

function _getConfig(options, name) {

    config = Path.resolve(options.config + '', './' + name + '.js');
    try {
        config = require(config);
    } catch (e) {
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

function fillJson(master, slave) {
    if (typeof slave !== 'object'
        || typeof master !== 'object'
        || master === null
        || slave === null) {
        throw new Error('master and slave must be valid object');
    }
    return _mergeJsonByMaster(master, slave);
}

function _mergeJsonByMaster(master, slave) {
    if (typeof slave !== 'object'
        || typeof master !== 'object'
        || master === null
        || slave === null) {
        return master;
    }
    for (let skey in slave) {
        if (slave.hasOwnProperty(skey)) {
            if (master.hasOwnProperty(skey)) {
                master[skey] = _mergeJsonByMaster(master[skey], slave[skey]);
                continue;
            }
            master[skey] = (typeof slave[skey] === 'object' && slave[skey] !== null) ?
                JSON.parse(JSON.stringify(slave[skey])) : slave[skey];
        }
    }
    return master;
}

function divideJson(master, slave) {
    let options = {};
    for (let skey in slave) {
        if (slave.hasOwnProperty(skey) && master.hasOwnProperty(skey)) {
            options[skey] = master[skey];
            delete master[skey];
        }
    }
    return options;
}

function overrideJson(master, slave) {
    if (typeof slave !== 'object'
        || typeof master !== 'object'
        || master === null
        || slave === null) {
        throw new Error('master and slave must be valid object');
    }
    for (let mkey in master) {
        if (master.hasOwnProperty(mkey) && slave.hasOwnProperty(mkey)) {
            master[mkey] = _mergeJsonBySlave(master[mkey], slave[mkey]);
        }
    }
    return master;
}

function _mergeJsonBySlave(master, slave) {
    if (typeof slave !== 'object'
        || typeof master !== 'object'
        || master === null
        || slave === null) {
        return slave;
    }
    for (let skey in slave) {
        if (slave.hasOwnProperty(skey)) {
            master[skey] = _mergeJsonBySlave(master[skey], slave[skey]);
        }
    }
    return master;
}

module.exports = Manager;