Taskager means task and manager. It is a scheduler for controlling execution of task in frequency and concurrency.

# start 
npm install taskager

# 参数
本框架将整个系统参数分为三大类，默认每一个参数的命名具有唯一性
1管理器参数：对应config下的manager.js
2任务参数：对应config下的task.js里的options
3后置处理参数：对应config下的task.js里的processors的name集合

* 任务配置：
## options
对应一个任务的执行所需要的参数集合
## processors
对应一个任务执行完之后所需要经过的后处理流程

* 管理器配置：对应config下的manager.js
管理器自身的调度配置及全局性的任务后处理配置

# Task模型
task的创建需要任务自身参数、后处理参数及回调函数
let task = new Task(options, info, callback);
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

