let Manager = require('./index');


//let noOptionsManager = new Manager();

let optionsManager = new Manager({
    loadbalance: true,
    returnxargs: false,
    autostart: false,
    ratelimit: 2,
    priorityrange: 2,
    retries: 0,
    option1: 'op1v',
    option2: 'op2v',
    //p2: 'prop2v',
    headers: {
        mm: 'ss'
    },
    optionn: 2222
});

//console.log(optionsManager)
let task1 = {
    loadbalance: 111111,
    retries: 999999,
    option1: 'task1option1',
    p1: 'task1p11111',
    p2: 'task1p22222'
}

let task2 = {
    loadbalance: 222222,
    retries: 555555,
    option1: 'task2option1',
    p1: 'task2p11111',
    p2: 'task2p22222'
}

optionsManager.on('queue', (task, next) => {

    //throw new Error('test')
    next();
})

optionsManager.on('error', e => {
    console.log(e)
})

optionsManager.on('done', () => {
    console.log('iam done')
})


optionsManager.queue(task2, function (err, res) {

    let tt = res[res.length - 1].result;
    console.log(undefined, tt.attr('channel'))
    tt.done()
})

for (let i = 0; i < 5; i++) {
    optionsManager.queue({ channel: 1 }, function (err, res) {


        let tt = res[res.length - 1].result;
        console.log(1, tt.attr('channel'))
        tt.done()
    })
}

optionsManager.start();

// optionsManager.getChannel('1').start()
// optionsManager.getChannel('undefined').start()
