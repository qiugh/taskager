# Taskager - Simple Task Manager
***
## Super simple to use
```js
let Taskager = require('taskager');
let Task = Taskager.Task;

let taskager = new Taskager();
let taskInfo = {
    parameter1 : 'value1',
    parametern : 'valuen'
};
let callback = function(err, task){
    console.log(task);
    task.done();
}
let task = new Task(taskinfo, callback);
taskager.queue(task);
```

## Table of contents

- [Install](#install)
- [Options](#options)
  * [task options](#task-options)
  * [manager options](#manager-options)
  * [process flow options](#process-flow-options)
- [Basic usage](#basic-usage)
  * [task module](#task-module)
  * [manager module](#manager-module)
  * [process module](#process-module)
  * [channel module](#channel-module)


# Install
```sh
npm install taskager
```
# options

**_The parameter naming for each type of configuration is unique by default._**

## task options
Task options represent a set of acceptable parameters for completing the task.  
They are initialized by the file config/task.js.  
```js
{
    'option1': 'defaultvalue1',
    'optioni': 'Not_Set', //means this parameter has no default value
    'optionn': 'defaultvaluen'
}
```

## manager options
Manager options represent a set of acceptable parameters for managing tasks.  
They are initialized by the file config/manager.js. 
```js
{
    'ratelimit': 2000, //execution time interval of tasks for channel is at least 2000 milliseconds
    'concurrency': 5, //there is no more than 5 tasks at the same time for channel
    'autostart': true, //manager will start automatically when task is queued
    'priorityrange': 6, //priority section for all tasks is [0, 5]
    'returnxargs': true, //the process flow in manager will return the given task
    'loadbalance': true //channel with empty queue will help other channel do task
}
```

## process flow options
Process flow means the actual actions for completing the task corresponding to a series of processing functions whose order determines the execute sequence  
They are initialized by the file config/process.js.
```
{
    "name": "processor1", //processor name
    "asyn": false, //is asynchronous or not
    //do something according to value
    "func": function (task) {
        console.log('<processor1> with value: <' + task.options["processor1"] + '>.');
    }
}
```

# Basic usage
## manager module
Manager accepts three types of parameter.  
This stage can override all parameters loaded from config file.  
Config file path is determined by parameter named config which is assigned './config/' if it is not set.
```
let globalOpt = {
    'optioni': 'valuei', //set global default value for parameter optioni from task options
    'concurrency': -1, //override original value for parameter concurrency from manager options, -1 means infinity
    'processor1': 'valueforprocessor1' //set global default value for parameter processor1 from process flow options
};
let taskager = new Taskager(globalOpt);
taskager.queue(new Task({}, function callback(err, task){
    console.log(task.options['optioni']); //valuei, it is overridden
    console.log(task.options['optionn']); //defaultvaluen, it is not overridden when manager instace is initialized
    console.log(task.options['processor1']); //valueforprocessor1
    task.done();
}));

```
## task module
Task consists of taskInfo and callback.  
TaskInfo is a set of parameters deciding what to be done in the lifecycle.  
In addition to parameters from task options, TaskInfo can also include channel and prioroty.  
Channel decides which channel this task will be queued.Priority is just like literal meaning.  
Callback is a function that accepts two parameters deciding what to be done when the task is finished.  
Parameters in taskInfo will reset some task options to new value, but only for this task itself.  

```

let taskInfo = {
    'channel': 'channel1', //if not set, it will be default channel
    'priority': 5, //if not set, it will be  Math.floor(priorityrange / 2)
    'optioni': 'valueiformyself1', //reset optioni for this task itself
    'processor1': 'valueformyself2', //reset processor1 for this task itself
    'whatevername': 'whatevervalue' // any other information this task want to transmit
};

let callback = function(err, task){
    console.log(task instanceof Task); //true
    dosomething(task);
    task.done();
}
```
every task has one function named done to inform manager that task has been finished so that manager can continue to do the left.  
It is necessary because manager can not tell when task ends.

## process module
```
let taskager = new Taskager();

let opt = {
    name:'new1',
    asyn:'true',
    func:(options, callback)=>{

    }
};
taskager.addProcessor(opt);

```
for more detail info about processor please see [node-processor](http://zzbond.com/node-processor/)

## channel module
```
let taskager = new Taskager();

//all accepted parameters   
let opt = {
    autostart: false,
    ratelimit: 2000,
    concurrency: 10
}
taskage.addChannel(opt); 
```



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
