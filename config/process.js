module.exports = function () {
    return [
        {
            "name": "p1",
            "asyn": false,
            "func": function (task) {
                let processor = 'p1'
                console.log('flow <' + processor + '> with value: <' + task.info[processor] + '>.');
            }
        },
        {
            "name": "p2",
            "asyn": false,
            "func": function (task) {
                let processor = 'p2'
                console.log('flow <' + processor + '> with value: <' + task.info[processor] + '>.');
            }
        },
        {
            "name": "p3",
            "asyn": true,
            "func": function (task, callback) {
                let processor = 'p3'
                console.log('flow <' + processor + '> with value: <' + task.info[processor] + '>.');
                setTimeout(callback, 2000, null, task)
            }
        }
    ];
}