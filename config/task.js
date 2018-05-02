module.exports = {
	"options": {
		"option1": "not_set",
		"option2": "value",
		"optionn": "n"
	},
	"before": [
		{
			"name": "processor1",
			"func": function (processor, task) {
				console.log('before_execute_process_flow <' + processor + '> is executing along with the value: <' + task.processor(processor) + '>.');
			}
		},
		{
			"name": "processor2",
			"func": function (processor, task) {
				console.log('before_execute_process_flow <' + processor + '> is executing along with the value: <' + task.processor(processor) + '>.');
			}
		},
		{
			"name": "processor3",
			"func": function (processor, task, callback) {
				console.log('before_execute_process_flow <' + processor + '> is executing along with the value: <' + task.processor(processor) + '>.');
				setTimeout(callback, 2000, 'error', 'result')
			},
			"callback": function (error, result, resolve, reject) {
				resolve(error + result);
			}
		}
	],
	"execute": function (necessary, callback) {

		console.log('execute_process  is executing.');
		let error = (Math.random() > 0.3) ? new Error('this is a default random error.') : null;
		let result = { body: 'this is a default result body' };
		setTimeout(callback, 2000, error, result);
	},
	"after": [
		{
			"name": "processor4",
			"func": function (processor, task) {
				console.log('after_execute_process_flow <' + processor + '> is executing along with the value: <' + task.processor(processor) + '>.');
			}
		}
	]
}