Taskager means task and manager. It is a scheduler for controlling execution of task in frequency and concurrency.

# start 
npm install taskager

# 配置
总共三类配置，默认每一类配置的命名具有唯一性

任务配置：代表完成一个任务需要的基本参数，由config/task.js文件决定
    'option1': 'defaultvalue1'，// 代表参数1，默认取值defaultvalue1
    'optioni': 'Not_Set'，// 代表参数i，不设置默认取值

管理器配置：代表管理器的基本参数，由config/manager.js文件决定
    'ratelimit': 4000, // 指定通道下，两个任务的执行时刻至少间隔4000ms
    'concurrency': 5,  //指定通道下，同时执行的任务个数不能超过5个
    'autostart': true, //当有任务时，管理器是否自动开始执行，默认true。
    'priorityrange': 6,//任务的优先级范围为0~5
    'returnxargs': true,//任务处理流的回调参数是否为任务本身，默认true
    'loadbalance': true//管理器是否负载均衡，默认true

处理流配置：代表任务的实际处理流程，对应一系列处理算子，算子的顺序决定处理流程的顺序，由config/process.js文件决定
{
    "name": "p2",  //算子名称
    "asyn": false, //是否是异步算子
    "func": function (task) {  //传参为任务本身
        let processor = 'p2'
        console.log('flow <' + processor + '> with value: <' + task.options[processor] + '>.'); //根据算子名称取出对应的取值，做对应的处理逻辑
    }
}

# Task模型
task由参数集和回调函数构成
参数集可以包含任意一个任务配置里的参数，也可以包含任意一个处理流配置里的算子名称参数
let options = {
    option1:'newvalue1',
    p2:'value for processos p2'
}
回调函数则是处理流结束后要执行的函数，接受error和result两个形参
let callback = function(error, result){
    console.log(result)
}
具备以上要素后，即可往管理器队列里添加任务

let task = new Task(options, callback);

task的执行本质上是其管理器定制的processFlow对task的处理
task.execute();
任务执行完之后，需要告知管理器其生命周期的结束
task.done(); 

# Manager模型
最上层是管理器Manager，拥有多个执行通道Channel，每个通道拥有一个优先级队列Queue，管理器在创建时可以通过options覆盖管理器配置，每个执行通道有两个控制参数决定何时执行一个任务：  
  1. ratelimit：代表每个通道执行任务的频率  
  2. concurrency：代表每个通道同时执行的任务数量  
let manager = new Manager({ratelimit:2000, concurrency:2});
* 管理器将一个task加入到队列的意义是：根据Task配置里的通道参数和优先级参数将Task添加到Manager的指定Channel的指定优先级队列里排队，等待时机执行。  
manager.queue(taskOption, function(error, task){
    task.done();
});//此操作支持传task对象或者task参数集

管理器在将一个任务加入到队列里时，可以通过queue事件执行前置处理操作
manager.on('queue',function(task, done){
    // todo
    task.done();
});

管理器实时知晓当前任务的执行情况
let [waitingSize, runnningSize] = manager.stats();
manager可以动态添加处理算子
manager.addProcessor(options);
manager可以添加个性化执行通道
manager.addChannel(options);
管理器所有任务执行结束可以通过事件添加回调
manager.on('done',function(){
    console.log('all done');
});

