
# Taskager - Simple Task Manager

It's a manager for controlling execution of task in frequency and concurrency.

***

## Super simple to use

```js
let Taskager = require('taskager');
let taskager = new Taskager();
let taskinfo = {
    parameter1 : 'value1',
    parametern : 'valuen'
};
taskager.queue(taskinfo, function callback(err, task){
    console.log(task);
    task.done();
});
```

## Table of contents

- [Install](#install)
- [Options](#options)
  * [task options](#task-options)
  * [manager options](#manager-options)
  * [process options](#process-options)
- [Basic usage](#basic-usage)
  * [task module](#task-module)
  * [manager module](#manager-module)
  * [process module](#process-module)
  * [channel module](#channel-module)


# Install
```
npm install taskager
```
# options

The parameter naming for each type of configuration is unique by default.

## task options
Task options represent a set of acceptable parameters for completing the task.  
They are initialized by the file config/task.js.  
```
{
    'option1': 'defaultvalue1',
    'optioni': 'Not_Set', //means this parameter has no default value
    'optionn': 'defaultvaluen'
}
```



## manager options
## process options
# Basic usage
## task module
## manager module
## process module
## channel module
任务：由参数集和回调函数构成，自我控制任务的结束行为
管理器：通过控制策略控制任务的总体执行频率或者并发量。
执行通道：不通的任务可以配置不同的控制策略，为了让管理器能够同时兼容多个策略，引入通道的概念。任务注册时，会被分配到指定的通道下。
优先级队列：同一个通道下的任务受策略控制无法全部同时执行，需要先放置到一个队列里，当通道可以再次执行任务时，首先选择优先级高的任务。
处理流：任务的执行和结果分析实质上是一系列的针对任务本身的处理流程的集合

# 配置
默认每一类配置的参数命名具有唯一性

任务配置：代表完成一个任务需要的基本参数，由config/task.js文件决定
    'option1': 'defaultvalue1'，// 代表参数1，默认取值defaultvalue1
    'optioni': 'Not_Set'，// 代表参数i，不设置默认取值

管理器配置：代表管理器的基本参数，由config/manager.js文件决定
    'ratelimit': 4000, // 指定通道下，两个任务的执行时刻至少间隔4000ms
    'concurrency': 5,  //指定通道下，同时执行的任务个数不能超过5个
    'autostart': false, //当有任务注册时，管理器是否自动开始执行任务，默认false，即需要通过管理器的start函数启动任务执行
    'priorityrange': 6,//任务的优先级范围，默认6，即任务的优先级可以设置成0~5，如果不设置，则任务优先级取priorityrange/2
    'returnxargs': true,//任务处理流的回调参数是否为任务本身，默认true，即任务的回调函数接受的参数为任务本身
    'loadbalance': true//管理器是否负载均衡，默认true，即当一个通道的所有任务执行完毕后，会帮助执行其他通道的剩余任务

处理流配置：代表任务的实际处理流程，对应一系列处理算子，算子的顺序决定处理流程的顺序，由config/process.js文件决定
{
    "name": "p2",  //算子名称
    "asyn": false, //是否是异步算子
    "func": function (task) {  //传参为任务本身
        let processor = 'p2'
        console.log('flow <' + processor + '> with value: <' + task.options[processor] + '>.'); //根据算子名称取出对应的取值，做对应的处理逻辑
    }
}

默认静态配置：即config目录下的配置。
默认动态配置：在实例化模型的时候，所传的配置参数集将按照一定的策略覆盖默认静态配置，得到程序运行时的动态全局默认配置。
实时任务配置：任何一个注册的任务，所传递的配置参数集将按照一定的策略重新覆盖默认动态配置。

# 功能示例
let manager_static = new Manager(); //全部采用默认静态配置所得管理器

//实例化时传递参数覆盖默认静态配置，管理器实例化时，可接受的参数集 = {a，a∈任务配置参数集||a∈处理流配置里的算子名称集 || a∈管理器配置参数集}
let manager_dynamic = new Manager({
    option1: "new_value_dymanic", //覆盖默认任务配置
    ratelimit: 9527, //覆盖默认管理器配置
    p2:'p2_value_dynamic' // 设置默认处理算子取值
 }); 




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

# Task模型
参数集 = {a，a∈任务配置参数集||a∈处理流配置里的算子名称集合 || a∈{channel, priority}}

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
任务执行完之后，需要告知管理器其生命周期的结束
task.done(); 
