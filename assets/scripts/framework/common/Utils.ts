/**
 * Created by xujiawei on 2020-07-07 17:38:36
 */

function clone(obj: any, newObj?: any) {
    // Cloning is better if the new object is having the same prototype chain
    // as the copied obj (or otherwise, the cloned object is certainly going to
    // have a different hidden class). Play with C1/C2 of the
    // PerformanceVirtualMachineTests suite to see how this makes an impact
    // under extreme conditions.
    //
    // Object.create(Object.getPrototypeOf(obj)) doesn't work well because the
    // prototype lacks a link to the constructor (Carakan, V8) so the new
    // object wouldn't have the hidden class that's associated with the
    // constructor (also, for whatever reasons, utilizing
    // Object.create(Object.getPrototypeOf(obj)) + Object.defineProperty is even
    // slower than the original in V8). Therefore, we call the constructor, but
    // there is a big caveat - it is possible that the this.init() in the
    // constructor would throw with no argument. It is also possible that a
    // derived class forgets to set "constructor" on the prototype. We ignore
    // these possibities for and the ultimate solution is a standardized
    // Object.clone(<object>).
    if (!newObj) {
        newObj = (obj.constructor) ? new obj.constructor() : {};
    }

    // Assuming that the constuctor above initialized all properies on obj, the
    // following keyed assignments won't turn newObj into dictionary mode
    // becasue they're not *appending new properties* but *assigning existing
    // ones* (note that appending indexed properties is another story). See
    // CCClass.js for a link to the devils when the assumption fails.
    let key;
    let copy;
    for (key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        copy = obj[key];
        // Beware that typeof null == "object" !
        if (((typeof copy) === "object") && copy) {
            newObj[key] = clone(copy, null);
        } else {
            newObj[key] = copy;
        }
    }
    return newObj;
}

/**
 * 移除数组的指定的元素（重复元素只移除第一个）
 * @param {Array} arr
 * @param {Object} obj
 */
function arrayRmObj(arr: any[], obj: any) {
    let index = arr.indexOf(obj);
    arr.splice(index, 1);
}

/**
 * pop a item from a array by idx
 * @param {Array} array
 * @param {Number} idx
 * @return {*}
 */
function arrayPopByIdx(array: any[], idx: number) {
    let item = array[idx];
    array.splice(idx, 1);

    return item;
}


function valueInArray(arr: any[], value: any) {
    let len = arr.length;
    for (let i = 0; i < len; i++) {
        if (arr[i] == value) {
            return true;
        }
    }
    return false;
}

function arrayRandomValue(arr: any[]) {
    let num = arr.length;
    if (num <= 0) {
        return null;
    }

    let idx = randomInteger(0, num - 1);
    return arr[idx];
};

function randomInteger(min: number, max: number) {
    let range = Math.round((max - min) * Math.random());
    return (min + range);
}

/**
 * 根据配置的权重随机出一个对象
 * @param array {Array} Object对象的数组
 * @param keyForWeight {String} Object对象中定义权重的属性key(权重为Number类型)
 * @return {Object}
 */
function randomByWeight(array: any[], keyForWeight: string) {
    if (!isArray(array) || !isString(keyForWeight)) {
        return null;
    }

    let sumWeight = 0;
    sumWeight = array.reduce(function (sumSoFar, item) {
        sumSoFar = sumSoFar + item[keyForWeight];
        return sumSoFar;
    }, sumWeight);

    console.log("sumWeight:" + sumWeight);
    let tempWeight = 0;
    let randomValue = Math.random() * sumWeight;
    let value = null;
    for (let i in array) {
        value = array[i];
        tempWeight += value[keyForWeight];
        if (randomValue < tempWeight) {
            return value;
        }
    }

    return value;
};

/**
 * 数组随机排序
 * @param arr 
 */
function shuffle(arr: any[]) {
    let i,
        j,
        temp;
    for (i = arr.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

function clearArrayValue(array: any[], length: number, value: any) {
    for (let i = 0; i < length; i++) {
        array[i] = value;
    }
}

/**
 * create a object with keys from array and initial value
 * @param {Array} array
 * @param {*} value
 * @returns {Object}
 */
function createObjectWithArray(array: any[], value: any) {
    let object = {};
    for (let i in array) {
        object[array[i]] = value;
    }

    return object;
}

/**
 * 把数组转成字典，key为数组元素的某个属性
 * example: arr = [{id:1,name:'a',age:10}, {id:2, name:'b', age:11},...]
 * dic = arrayToDict(arr, 'id')
 * @param array 
 * @param key 
 */
function arrayToDict(array: any[], key: any) {
    let dict = {};
    let data = null;
    for (let i in array) {
        data = array[i];
        dict[data[key]] = data;
    }
    return dict;
}

/**
 * 
 * @param dict 字典对象转数组
 */
function dictToArray(dict) {
    let array = [];
    for (let key in dict) {
        if (dict.hasOwnProperty(key) && dict[key]) {
            array.push(dict[key]);
        }
    }
    return array;
}

/**
* 根据数据元素的类型来分割字符串，返回数据元素数组
* @param {String} str
* @param {*} valueType
* @param {String} separator
* @returns {Array}
*/
function splitWithValueType(str: string, valueType, separator) {
    if (separator === undefined) {
        separator = ",";
    }

    let arr = str.split(separator);
    arr.forEach(function (currentValue, index, array) {
        try {
            array[index] = valueType(currentValue);
        } catch (e) {
            array[index] = null;
        }
    });

    return arr;
}

/**
 * UTC 1970开始的秒数
 * @returns {number}
 */
function time(): number {
    return Math.floor(Date.now() / 1000.0);
}

/**
 * 年月日 返回 1970开始的秒数
 * @param year {int}
 * @param month {int} 1-12表示1-12月
 * @param day{int} 1-31
 * @param hour{int} 0-23
 * @param minute{int} 0-59
 * @param second{int} 0-59
 */
function timeTosecond(year: number, month: number, day: number, hour: number, minute: number, second: number): number {
    let date = new Date(year, month - 1, day, hour, minute, second);
    let n = date.getTime();
    return Math.floor(n / 1000.0);
}

/**
 * 获取某个日期之后多少天的日期
 * @param time {Date || String || Number} 标准时间格式 或者 毫秒数(since 1970)
 * @param days {Number} 20
 * @return {Date}
 */
function getTimeAfterDays(time, days: number) {
    let date = null;
    date = new Date(time);
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * 判断两个日期相差多少天
 * @param strDateStart  开始时间 标准时间格式 或者 毫秒数（since 1970)
 * @param strDateEnd    结束时间 标准时间格式 或者 毫秒数（since 1970)
 * @return {Number|*}   天数
 */
function getDaysDiff(dateStart, dateEnd) {
    console.log(dateStart && dateEnd, "getDaysDiff: date must be not null!");
    let iDays;
    dateStart = new Date(dateStart);
    dateEnd = new Date(dateEnd);

    let strDateS = new Date(dateStart.getFullYear(), dateStart.getMonth(), dateStart.getDate());
    let strDateE = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), dateEnd.getDate());
    iDays = Math.floor(Math.abs(strDateE - strDateS) / 1000 / 60 / 60 / 24);   //把相差的毫秒数转换为天数
    iDays *= (strDateE >= strDateS ? 1 : -1);
    // cc.log("day dif:" + iDays);
    return iDays;
};

function isArray(value) {
    return Array.isArray(value) ||
        (typeof value === 'object' && Object.prototype.toString.call(value) === '[object Array]');
}

function isString(value) {
    return typeof value === 'string' || (isPlainObject(value) && objectToStringCall(value) === '[object String]');
}

/**
 *
 * @param date{Date || String || Number} 标准时间格式 或者 毫秒数(since 1970)
 * @return {string} 格式 "2017-08-02"
 */
function getTimeForDay(date) {
    if (!date) {
        date = new Date();
    } else {
        date = new Date(date);
    }
    let year = date.getFullYear();
    let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1;
    let day = date.getDate() < 10 ? "0" + date.getDate() : date
        .getDate();
    let dateStr = year + "-" + month + "-" + day;
    return dateStr;
}

/**
 * 返回截止日期剩余时间（天）
 * @param {Number} current
 * @param {Number} cutOff
 * @return {Number}
 */
function getLastCutOffDay(current, cutOff) {
    let time = cutOff - current;
    if (time < 0) return -1;
    time = Math.floor(time / (24 * 3600));
    return time;
}

/**
 *
 * @param s {Number} 秒 自1970的秒数
 * @return {string}
 */
function formatTime(s) {
    let t;
    if (s >= 0) {
        let hour = Math.floor(s / 3600);
        let min = Math.floor(s / 60) % 60;
        let sec = s % 60;
        let day = Math.floor(hour / 24);
        if (day == 1) {
            return day + " day";
        }
        if (day > 1) {
            return day + " days";
        }

        if (day > 0) {
            hour = hour - 24 * day;
            t = day + "day " + ('00' + hour).slice(-2) + ":";
        }
        else if (hour > 0) {
            t = ('00' + hour).slice(-2) + ":";
        } else {
            t = "";
        }

        if (min < 10) {
            t += "0";
        }
        t += min + ":";
        if (sec < 10) {
            t += "0";
        }
        t += Math.floor(sec);
    }
    return t;
}

/**
 * 返回100，000类型字符串
 * @param {Number} number
 * @returns {String}
 */
function getThousandSeparatorString(number) {

    // return number.toString().split('').reverse().join('').replace(/(\d{3}(?=\d)(?!\d+\.|$))/g, '$1,').split('').reverse().join('');
    // 保留一位小数
    let str = number.toString().split('').reverse().join('').replace(/(\d{3}(?=\d)(?!\d+\.|$))/g, '$1,').split('').reverse().join('');
    let dot = str.indexOf('.');
    if (dot >= 0) {
        str = str.substring(0, dot + 2);
    }
    return str;
}

/**
 * 获取KBM字符串
 * @param num 
 * 比如99999返回99K
 */
function getKMBString(num: number): string {
    if (num / 1000000000 >= 1) {
        return getThousandSeparatorString(num / 1000000000) + "B";
    }
    else if (num / 1000000 >= 1) {
        return getThousandSeparatorString(num / 1000000) + "M";
    }
    // 至少显示10k
    else if (num / 10000 >= 1) {
        return getThousandSeparatorString(num / 1000) + "K";
    }
    return getThousandSeparatorString(num);
}

/**
* 对象已定义
* @param {*} obj
* @returns {boolean}
*/
function D(obj: any) {
    return obj !== undefined;
}

function _dumpObject(prefix, o, depth, extraBlank, _ignore_function_member, max_depth) {
    if (D(max_depth) && depth > max_depth) {
        return;
    }

    function printWithDepth(txt, depth, extraBlank) {
        while (depth > 0) {
            txt = "  " + txt;
            --depth;
        }
        if (extraBlank > 0) {
            let blanks = "";
            let i;
            for (i = 0; i < extraBlank; ++i) {
                blanks += " ";
            }
            txt = blanks + txt;
        }
        cc.log(txt);
    }

    function getFuncDescriptor(f) {
        return (f.toString().replace(/function\s?/mi, "").split(")"))[0] + ")";
    }

    let type = Object.prototype.toString.call(o).slice(8, -1);
    let t;
    let neb;
    let npfx;
    let len;
    let blanks;
    switch (type) {
        case "Number":
        case "String":
            t = "\"" + o.toString() + "\"";
            if (prefix) {
                t = prefix + t;
            }
            printWithDepth(t, depth, extraBlank);
            break;
        case "Undefined":
            t = 'UNDEFINED!';
            if (prefix) {
                t = prefix + t;
            }
            printWithDepth(t, depth, extraBlank);
            break;
        case "Boolean":

            t = o.toString();
            if (prefix) {
                t = prefix + t;
            }
            printWithDepth(t, depth, extraBlank);

            break;
        case "Object":

            t = "{";
            if (prefix) {
                t = prefix + t;
            }
            printWithDepth(t, depth, extraBlank);
            let prop;
            for (prop in o) {
                if (!o.hasOwnProperty(prop)) {
                    continue;
                }
                npfx = "\"" + prop + "\" : ";
                neb = (prefix ? prefix.length : 0) - 2 + extraBlank;
                _dumpObject(npfx, o[prop], depth + 1, neb, _ignore_function_member, max_depth);
            }

            len = prefix ? prefix.length : 0;
            t = "}";
            if (len > 0) {
                blanks = "";
                let i1;
                for (i1 = 0; i1 < len; ++i1) {
                    blanks += " ";
                }
                t = blanks + t;
            }
            printWithDepth(t, depth, extraBlank);

            break;
        case "Array":

            t = "[";
            if (prefix) {
                t = prefix + t;
            }
            printWithDepth(t, depth, extraBlank);
            let i2;
            for (i2 = 0; i2 < o.length; ++i2) {
                npfx = i2 + " : ";
                neb = (prefix ? prefix.length : 0) - 2 + extraBlank;
                _dumpObject(npfx, o[i2], depth + 1, neb, _ignore_function_member, max_depth);
            }

            len = prefix ? prefix.length : 0;
            t = "]";
            if (len > 0) {
                blanks = "";
                let i;
                for (i = 0; i < len; ++i) {
                    blanks += " ";
                }
                t = blanks + t;
            }
            printWithDepth(t, depth, extraBlank);

            break;
        case "Function":

            if (!_ignore_function_member) {
                t = getFuncDescriptor(o);
                if (prefix) {
                    t = prefix + t;
                }
                printWithDepth(t, depth, extraBlank);
            }
            break;
    }
};

/**
 * 打印对象的所有属性和方法
 * @param o 目标对象
 * @param _ignore_function_member 是否忽略函数
 * @param max_depth 显示的深度
 */
function dumpObject(o, _ignore_function_member, max_depth) {
    _dumpObject(undefined, o, 0, 0, _ignore_function_member || false, max_depth);
}


//-----------------------------------------------------------------
/**
 * 求线段ab和cd的交点，如果不相交则返回false，相交则返回交点坐标
 * @param a{cc.Vec2}
 * @param b{cc.Vec2}
 * @param c{cc.Vec2}
 * @param d{cc.Vec2}
 * @returns {cc.Vec2 | boolean}
 */
function getSegmentsInter(a: cc.Vec2, b: cc.Vec2, c: cc.Vec2, d: cc.Vec2): cc.Vec2 | boolean {
    //线段ab的法线N1
    let nx1 = (b.y - a.y), ny1 = (a.x - b.x);

    //线段cd的法线N2
    let nx2 = (d.y - c.y), ny2 = (c.x - d.x);

    //两条法线做叉乘, 如果结果为0, 说明线段ab和线段cd平行或共线,不相交
    let denominator = nx1 * ny2 - ny1 * nx2;
    if (denominator == 0) {
        return false;
    }

    //在法线N2上的投影
    let distC_N2 = nx2 * c.x + ny2 * c.y;
    let distA_N2 = nx2 * a.x + ny2 * a.y - distC_N2;
    let distB_N2 = nx2 * b.x + ny2 * b.y - distC_N2;

    // 点a投影和点b投影在点c投影同侧 (对点在线段上的情况,本例当作不相交处理);
    if (distA_N2 * distB_N2 >= 0) {
        return false;
    }

    //
    //判断点c点d 和线段ab的关系, 原理同上
    //
    //在法线N1上的投影
    let distA_N1 = nx1 * a.x + ny1 * a.y;
    let distC_N1 = nx1 * c.x + ny1 * c.y - distA_N1;
    let distD_N1 = nx1 * d.x + ny1 * d.y - distA_N1;
    if (distC_N1 * distD_N1 >= 0) {
        return false;
    }

    //计算交点坐标
    let fraction = distA_N2 / denominator;
    let dx = fraction * ny1,
        dy = -fraction * nx1;

    return cc.v2(a.x + dx, a.y + dy);
};

/**
 * 检测触摸是否击中
 * @param {cc.Point} touchPoint 触摸点坐标（世界坐标）
 * @param {cc.Node} node
 * @return {Boolean}
 */
function checkTouchIsHit(touchPoint: cc.Vec2, node: cc.Node) {
    return node.getBoundingBoxToWorld().contains(touchPoint);
};

/**
 * 根据节点和指定的锚点得到坐标
 * @param {cc.Node} node
 * @param {cc.Point} anchorPoint
 * @return {*}
 */
function getPositionByAnchor(node: cc.Node, anchorPoint: cc.Vec2) {
    if (!node) {
        return cc.v2();
    }

    let bounding = node.getBoundingBox();
    bounding.x += bounding.width * anchorPoint.x;
    bounding.y += bounding.height * anchorPoint.y;
    return cc.v2(bounding.x, bounding.y);
}

let Utils = {
    clone: clone,
    arrayRmObj: arrayRmObj,
    arrayPopByIdx: arrayPopByIdx,
    valueInArray: valueInArray,
    arrayRandomValue: arrayRandomValue,
    randomInteger: randomInteger,
    randomByWeight: randomByWeight,
    shuffle: shuffle,
    clearArrayValue: clearArrayValue,
    createObjectWithArray: createObjectWithArray,
    arrayToDict: arrayToDict,
    dictToArray: dictToArray,
    splitWithValueType: splitWithValueType,
    time: time,
    timeTosecond: timeTosecond,
    getTimeAfterDays: getTimeAfterDays,
    getDaysDiff: getDaysDiff,
    getTimeForDay: getTimeForDay,
    getLastCutOffDay: getLastCutOffDay,
    formatTime: formatTime,
    getThousandSeparatorString: getThousandSeparatorString,
    getKMBString: getKMBString,
    dumpObject: dumpObject,
    getSegmentsInter: getSegmentsInter,
    checkTouchIsHit: checkTouchIsHit,
    getPositionByAnchor: getPositionByAnchor,

}

export {
    Utils
}