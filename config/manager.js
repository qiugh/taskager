module.exports = function () {
    return {
        'scheduleOptions': {
            'loadbalance': true
        },
        'channelOptions': {
            'ratelimit': 0,
            'concurrency': 5,
            'autostart': true
        },
        'queueOptions': {
            'priorityrange': 6
        },
        'commonOptions': {
            'retries': 3,
            'delaytime': 2000,
            'optionn': 'testv',
            'p2': 'processor2v'
        }
    };
};