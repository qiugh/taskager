const Channel = require('./Channel.js');

class Schedule {
    constructor(options) {
        this._channels = {};
        this._unfinishedTaskNum = 0;
        this._loadbalance = options.loadbalance;
    }

    start() {
        for (let channelId in this._channels) {
            this.getChannel(channelId).start();
        }
    }

    getUnfinishedTaskNum() {
        return this._unfinishedTaskNum;
    }

    getChannel(channelId) {
        return this._channels[channelId];
    }

    addChannel(options) {
        let channelId = options.channel;
        let channel = this.getChannel(channelId);
        if (!channel) {
            channel = new Channel(options);
            this._channels[channelId] = channel;
        }
    }

    enqueue(task) {
        let channelId = task.attr('channel');
        let channel = this.getChannel(channelId);
        if (!channel) {
            channel = new Channel(task.manager().channelOptions());
            this._channels[channelId] = channel;

        }

        this._unfinishedTaskNum++;
        channel.enqueue(task);
    }

    done(channelId) {
        let channel = this.getChannel(channelId);
        channel.done();
        this._unfinishedTaskNum--;

        let task = null;
        if (channel.size() || !this._loadbalance || !(task = this._dequeue())) return;
        task.attr('channel', channelId);
        channel.enqueue(task);
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

    waitQueueSize() {
        let cnt = 0;
        for (let channelId in this._channels) {
            cnt += this.getChannel(channelId).size();
        }
        return cnt;
    }
}

module.exports = Schedule;