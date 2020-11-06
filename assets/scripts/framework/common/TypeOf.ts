/**
 * Created by xujiawei on 2020-07-07 16:52:01
 */

/**
 * 类型检测
 * 只做了常规的类型检测，如有遗漏可参考 lodash 的实现进行补充
 */


// const MAX_SAFE_INTEGER = 9007199254740991;


/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
const nativeObjectToString = Object.prototype.toString;

function objectToStringCall(value) {
  return nativeObjectToString.call(value);
}

/**
 * 原始数据类型 (null, undefined, boolean, number, string, symbol)
 */

function isPrimitive(value) {
  const type = typeof value;
  return value === null || (type !== 'object' && type !== 'function');
}

function isNull(value) {
  return value === null;
}

function isUndefined(value) {
  return value === 'undefined';
  // return typeof value === 'undefined';
}

function isBoolean(value) {
  return value === true || value === false || (isPlainObject(value) && objectToStringCall(value) === '[object Boolean]');
}

function isNumber(value) {
  return typeof value === 'number' || (isPlainObject(value) && objectToStringCall(value) === '[object Number]');
}

// function isNaN(value) {
//   return isNumber(value) && value !== +value;
// }

function isString(value) {
  return typeof value === 'string' || (isPlainObject(value) && objectToStringCall(value) === '[object String]');
}

function isSymbol(value) {
  return typeof value == 'symbol' || (isPlainObject(value) && objectToStringCall(value) === '[object Symbol]');
}


/**
 * 引用数据类型 (Object, Array, Function)
 */

function isObject(value) {
  const type = typeof value;
  return (type === 'object' || type === 'function') && value !== null;
}

function isObjectLike(value) {
  return typeof value === 'object' && value !== null;
}

function isPlainObject(value) {
  return objectToStringCall(value) === '[object Object]';
}

function isArray(value) {
  return Array.isArray(value) ||
        (typeof value === 'object' && Object.prototype.toString.call(value) === '[object Array]');
}

// function isArrayLike(value) {
//   return value != null && isLength(value.length) && !isFunction(value);
// }

// function isLength(value) {
//   return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
// }

function isFunction(value) {
  // return typeof value === 'function';
  if (!isObject(value)) {
    return false;
  }
  const tag = objectToStringCall(value);
  return tag === '[object Function]' || tag === '[object GeneratorFunction]' || tag === '[object AsyncFunction]' || tag === '[object Proxy]';
}

function isThenable(value) {
  return value && value.then && typeof value.then === 'function';
}

function isRegExp(value) {
  return objectToStringCall(value) === '[object RegExp]';
}

function isElement(value) {
  return isObjectLike(value) && value.nodeType === 1 && !isPlainObject(value);
}

/**
 * Check the obj whether is {}, [] or not
 * @param {*} obj
 * @returns {boolean}
 */
function isEmpty(obj) {
  return (isArray(obj) && obj.length == 0) || (Object.prototype.isPrototypeOf(obj) && Object.keys(obj).length == 0);
}

/**
 * 对错误、异常的判断，与 Sentry 保持一致
 */

function isError(value) {
  if (!isObjectLike(value)) {
    return false;
  }
  const tag = objectToStringCall(value);
  return tag === '[object Error]' || tag === '[object Exception]' || tag === '[object DOMException]' || value instanceof Error;
}

function isErrorEvent(value) {
  return objectToStringCall(value) === '[object ErrorEvent]';
}

function isDOMError(value) {
  return objectToStringCall(value) === '[object DOMError]';
}

function isDOMException(value) {
  return objectToStringCall(value) === '[object DOMException]';
}

export {
  isNull,
  isUndefined,
  isBoolean,
  isNumber,
  isString,
  isSymbol,
  isPrimitive,
  isObject,
  isObjectLike,
  isPlainObject,
  isArray,
  // isArrayLike,
  isFunction,
  isThenable,
  isRegExp,
  isElement,
  isEmpty,
  isError,
  isErrorEvent,
  isDOMError,
  isDOMException,
};
