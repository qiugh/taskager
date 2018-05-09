const ExecuteChannel = require(__dirname + '/ExecuteChannel.js');

class Schedule {
  constructor(options) {
    this._channels = {};
    this._unfinishedTaskNum = 0;
    this._loadbalance = options.loadbalance;
  }

  getUnfinishedTaskNum() {
    return this._unfinishedTaskNum;
  }

  addChannel(options) {
    let channel = this._channels[options.channel];
    if (!channel) {
      this._channels[options.channel] = new ExecuteChannel(options);
    }
  }

  enqueue(task) {
    let channel = this._channels[task.channel()];
    if (!channel) {
      channel = new ExecuteChannel(task.manager().getChannelOptions());
      this._channels[task.channel()] = channel;
    }
    this._unfinishedTaskNum++;
    channel.enqueue(task);
  }

  done(channelId) {
    let channel = this._channels[channelId];
    channel.done();
    this._unfinishedTaskNum--;
    let task = null;
    if (!channel.size() && !this._loadbalance && (task = this._dequeue())) {
      task.channel(channelId);
      channel.enqueue(task);
    }
  }

  _dequeue() {
    let task;
    let channelIds = Object.keys(this._channels);
    for (let i = 0; i < channelIds.length; i++) {
      if (this._channels[channelIds[i]].size() > 1) {
        task = this._channels[channelIds[i]].dequeue();
        break;
      }
    }
    return task;
  }
}

module.exports = Schedule