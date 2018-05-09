Taskager means task and manager.It is a scheduler for controlling execution of task in frequency and amount.

# start 
npm install taskager

# Task模型

* Task的本质是根据一个参数集合执行某些动作，这些动作的顺序排列形成Task的processFlow。  
* Task执行完之后可调用回调函数。  
* Task执行完之后会有结果返回，该结果可内置到task的自定义属性里。  

# Manager模型

* 最上层是管理器Manager，管理器拥有一个调度器Schedule，调度器拥有多个执行通道Channel，每个通道拥有一个优先级队列Queue  
* 管理器queue一个task的意义是：根据Task配置里的通道参数和优先级参数将Task添加到Manager的指定Channel的指定优先级队列里排队。  
* 每个执行通道有两个控制参数决定何时执行一个任务：  
  1. executeRate：代表每个通道执行任务的频率  
  2. concurrency：代表每个通道同时执行的任务数量  
* 管理器Manager通过读取配置文件生成任务的处理流processFlow，任务的执行本质是指将任务作为一个参数输入到processFlow  
* 处理流processFlow包含了一个处理器数组，每个处理器具体的行为是自定义的，且多样化的，可根据任务的配置参数决定在该处理器环节执行何种操作。  

# 系统支持通用配置和个性化配置
## 系统的默认配置包括以下部分：
* manager默认配置  
  1. A: schedule配置  
  2. B: channel配置  
  3. C: queue配置  
  4. D: common配置（manager其他辅助功能的通用配置容器）  
* task默认配置  
  1. E: task本体配置（取决于该task最原本的行为）  
  2. F: task处理器配置（取决于该task的前置处理和后置处理行为）  
## 配置参数的变化过程：
1. 实例化manager时，可传递6种配置中的任意参数组合，外加一个configFilePath参数  
   * 通过configFilePath参数，读取本地文件默认的上述6项配置  
   * 在读取默认的F配置时，将该配置的所有参数加入到D，D成为manager和task的通用配置容器  
   * 将其余参数根据名字唯一性覆盖掉6种配置中同名的参数  
2. 实例化task时，可为每个task传递个性化配置，配置中的参数被拆分成两份，拆分原则是根据名字唯一性将该个性化配置中参数名字和E中参数名字相同的拆分出来当做G，剩余当做H：  
   G：用E丰富该配置集  
   H：用D丰富该配置集  
# 动态添加处理器和channel功能
## 动态添加处理器
* 处理器可以在配置文件里提前规划好，也可以在实例化manager后通过addProcessor功能动态增加处理器，以应对不同任务所需的处理器不同的场景。
## 动态添加channel
* channel的创建是通过任务的channel参数，也可以通过manager实例动态添加个性化的channel，甚至在当前channel负载过大时通过添加新的channel降低压力。

# 事件监听
## queue事件监听
* 当把一个task加入到队列里时，也许manager需要统一对任务做某种操作，此时通过queue事件拦截task，并处理。
## done事件监听
* 每当一个任务结束时，需要调用task的done方法以通知manager任务的状态变更。当所有task都done的时候，manager检测到所有channel的所有队列里已经没有任务，就会触发manager的done事件，可供程序在此时进行收尾工作。
