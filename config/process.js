module.exports = function () {
    return [
        {
            "name": "p1",
            "asyn": false,
            "func": function (task) {
                console.log('p1 value:' + task.options['p1']);
            }
        },
        {
            "name": "p2",
            "asyn": false,
            "func": function (task) {
                console.log('p2 value:' + task.options['p2']);
            }
        },
        {
            "name": "p3",
            "asyn": true,
            "func": function (task, callback) {
                console.log('p3 value:' + task.options['p3']);
                setTimeout(callback, 2000, null, task)
            }
        }
    ];
}