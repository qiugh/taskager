module.exports = function () {
    return {
        "options": {
            "option1": "not_set",
            "option2": "value",
            "optionn": "n"
        },
        "processors": [
            {
                "name": "p1",
                "asyn": false,
                "func": function (task) {
                    let processor = 'p1'
                    console.log('flow <' + processor + '> is executing along with the value: <' + task.attr(processor) + '>.');
                }
            },
            {
                "name": "p2",
                "asyn": false,
                "func": function (task) {
                    let processor = 'p2'
                    console.log('flow <' + processor + '> is executing along with the value: <' + task.attr(processor) + '>.');
                }
            },
            {
                "name": "p3",
                "asyn": true,
                "func": function (task, callback) {
                    let processor = 'p3'
                    console.log('flow <' + processor + '> is executing along with the value: <' + task.attr(processor) + '>.');
                    setTimeout(callback, 2000, null, task)
                }
            }
        ]
    };
};