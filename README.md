Taskager means task and manager.It is a scheduler for controlling execution of task in frequency and amount.

# start 
npm install taskager

# Task模型

* Task的本质是根据一个参数集合执行某些动作，这些动作的顺序排列形成Task的processFlow。  
* Task执行完之后可调用回调函数。  
* Task执行完之后会有结果返回，该结果可内置到task的自定义属性里。  

# Manager模型

* 最上层是管理器Manager，管理器拥有一个调度器Schedule，调度器拥有多个执行通道Channel，每个通道拥有一个优先级队列Queue  
* 管理器将一个task加入到队列的意义是：根据Task配置里的通道参数和优先级参数将Task添加到Manager的指定Channel的指定优先级队列里排队，等待时机执行。  
* 每个执行通道有两个控制参数决定何时执行一个任务：  
  1. executeRate：代表每个通道执行任务的频率  
  2. concurrency：代表每个通道同时执行的任务数量  
* 管理器Manager通过读取配置文件生成任务的处理流processFlow，任务的执行本质是指将任务作为一个参数输入到processFlow  
* 处理流processFlow包含了一个处理器数组，每个处理器具体的行为是自定义的，且多样化的，可根据任务的配置参数决定在该处理器环节执行何种操作。  

# 系统支持通用配置和个性化配置
## 系统的默认配置包括以下部分：
* manager配置  
  1. A: schedule配置  
  2. B: channel配置  
  3. C: queue配置  
  4. D: common配置（通用配置的参数集合）  
* task配置  
  1. E: task本体配置（取决于该task最原本的行为）  
  2. F: task处理器配置（取决于该task的前置处理和后置处理行为）  
## 配置参数的变化过程：
1. 实例化manager时，可传递6种配置中的任意参数组合，外加一个configFilePath参数  
   * 通过configFilePath参数，读取本地文件默认的上述6项配置  
   * 在读取F配置时，将该配置的所有处理器名字当做通用参数加入到D  
   * 将其余参数根据名字唯一性覆盖掉6种配置中同名的参数  
2. 实例化task时，可为每个task传递个性化配置
   * 用E丰富个性化参数集
   * 用D丰富个性化参数集
   * 将个性化参数集拆分成个性化的E和个性化的F
# 动态添加处理器和channel功能
## 动态添加处理器
* 处理器可以在配置文件里提前规划好，也可以在实例化manager后通过addProcessor功能动态增加处理器，以应对不同任务所需的处理器不同的场景。
## 动态添加channel
* channel的创建一般是通过任务的channel参数，也可以通过manager实例动态添加个性化的channel。

# 事件监听
## queue事件监听
* 当把一个task加入到队列里时，也许manager需要统一对任务做某种操作，此时通过queue事件拦截task，并处理。
## done事件监听
* 每当一个任务结束时，需要调用task的done方法以通知manager任务的状态变更。当所有task都done的时候，manager检测到所有channel的所有队列里已经没有任务，就会触发manager的done事件，提供程序收尾动作的接口。
