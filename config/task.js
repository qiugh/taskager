module.exports = {
  "options": {
    "option1": "not_set",
    "option2": "value",
    "optionn": "n"
  },
  "processors": [
    {
      "name": "p1",
      "func": function (task) {
        let processor = 'p1'
        console.log('flow <' + processor + '> is executing along with the value: <' + task.processor(processor) + '>.');
      },
      asyn: false
    },
    {
      "name": "p2",
      "func": function (task) {
        let processor = 'p2'
        console.log('flow <' + processor + '> is executing along with the value: <' + task.processor(processor) + '>.');
      },
      asyn: false
    },
    {
      "name": "p3",
      "func": function (task) {
        let processor = 'p3'
        console.log('flow <' + processor + '> is executing along with the value: <' + task.processor(processor) + '>.');
      },
      asyn: true
    }
  ]
}