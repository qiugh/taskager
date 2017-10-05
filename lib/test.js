let Worker = require('../index.js');

let worker = new Worker();

worker.queue({}, callback);

function callback(error, result, task) {
  console.log(task)
} 
