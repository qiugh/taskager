
function isObject(param) {
    if (typeof param !== 'object' || param === null)
        return false;
    return true;
}

function enable(obj, propertyName, type, initValue) {
    if (type === 2) {
        enablePropertySet(obj, propertyName, initValue)
    } else {
        enableProperty(obj, propertyName, initValue)
    }
}

function enableProperty(obj, propertyName, initValue) {
    let key = '_' + propertyName;
    obj[key] = initValue;
    obj[propertyName] = function (value) {
        if (arguments.length === 0)
            return obj[key];
        if (arguments.length === 1)
            obj[key] = value;
    }
}

function enablePropertySet(obj, propertyName, initValue) {
    let key = '_' + propertyName;
    if (!isObject(obj[key])) {
        if (isObject(initValue)) {
            obj[key] = initValue;
        } else {
            obj[key] = {};
        }
    }
    obj[propertyName] = function (name, value) {
        if (arguments.length === 0)
            return obj[key];
        if (arguments.length === 1)
            return obj[key][name];
        obj[key][name] = value;
    }
}

function fillJson(master, slave) {
    if (typeof slave !== 'object'
        || typeof master !== 'object'
        || master === null
        || slave === null) {
        throw new Error('master and slave must be valid object');
    }
    return _mergeJsonByMaster(master, slave);
}

function _mergeJsonByMaster(master, slave) {
    if (typeof slave !== 'object'
        || typeof master !== 'object'
        || master === null
        || slave === null) {
        return master;
    }
    for (let skey in slave) {
        if (slave.hasOwnProperty(skey)) {
            if (master.hasOwnProperty(skey)) {
                master[skey] = _mergeJsonByMaster(master[skey], slave[skey]);
                continue;
            }
            master[skey] = isObject(slave[skey]) ? JSON.parse(JSON.stringify(slave[skey])) : slave[skey];
        }
    }
    return master;
}

function divideJson(master, slave) {
    let options = {};
    for (let skey in slave) {
        if (slave.hasOwnProperty(skey) && master.hasOwnProperty(skey)) {
            options[skey] = master[skey];
            delete master[skey];
        }
    }
    return options;
}

function overrideJson(master, slave) {
    if (typeof slave !== 'object'
        || typeof master !== 'object'
        || master === null
        || slave === null) {
        throw new Error('master and slave must be valid object');
    }
    for (let mkey in master) {
        if (master.hasOwnProperty(mkey) && slave.hasOwnProperty(mkey)) {
            master[mkey] = _mergeJsonBySlave(master[mkey], slave[mkey]);
        }
    }
    return master;
}

function _mergeJsonBySlave(master, slave) {
    if (typeof slave !== 'object'
        || typeof master !== 'object'
        || master === null
        || slave === null) {
        return slave;
    }
    for (let skey in slave) {
        if (slave.hasOwnProperty(skey)) {
            master[skey] = _mergeJsonBySlave(master[skey], slave[skey]);
        }
    }
    return master;
}