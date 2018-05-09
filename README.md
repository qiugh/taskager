# taskager
Taskager means task and manager.It is a scheduler for controlling task in frequency and amount.

npm install taskager

Function:
1.queue(taskOptions, callback)
queue a task or taskOptions into the priority queue.


# 系统支持通用配置和个性化配置
## 系统的默认配置包括以下部分：
   1. manager默认配置  
      A: schedule配置  
      B: channel配置  
      C: queue配置  
      D: common配置（manager其他辅助功能的通用配置容器）  
    2. task默认配置  
      E: task本体配置（取决于该task最原本的行为）  
      F: task处理器配置（取决于该task的前置处理和后置处理行为）  
## 配置参数的变化过程：
1. 实例化manager时，可传递6种配置中的任意参数组合，外加一个configFilePath参数  
   * 通过configFilePath参数，读取本地文件默认的上述6项配置  
   * 在读取默认的F配置时，将该配置的所有参数加入到D，D成为manager和task的通用配置容器  
   * 将其余参数根据名字唯一性覆盖掉6种配置中同名的参数  
2. 实例化task时，可为每个task传递个性化配置，配置中的参数被拆分成两份，拆分原则是根据名字唯一性将该个性化配置中参数名字和E中参数名字相同的拆分出来当做G，剩余当做H：  
   G：用E丰富该配置集  
   H：用D丰富该配置集  
