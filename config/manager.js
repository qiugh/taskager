module.exports = function generateDefaultManagerConfig() {
  return {
    "scheduleOptions": {
      "loadbalance": true
    },
    "channelOptions": {
      "autostart": false,
      "concurrency": 5,
      "ratelimit": 0,
    },
    "queueOptions": {
      "priorityrange": 6
    },
    "commonOptions": {
      "retries": 3,
      "delaytime": 2000,
      "optionn": 'testoptionn'
    }
  };
};