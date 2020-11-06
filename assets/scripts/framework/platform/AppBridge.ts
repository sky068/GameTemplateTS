/**
 * Created by xujiawei on 2020-07-07 17:05:26
 */

/**
 * Native Bridge
 * 用法参考：http://wiki.putao-inc.com/display/ZYTech/Webview+JS+Bridge+API
 * web和native(app)交互使用
 */

const callAppBacks = {};
const callWebHandlers = {};
let uniqueId = 1;
import { reportError } from './../common/Reportor';
import { Device } from './../common/Device';
import { isFunction } from './../common/TypeOf';

// 性能分析用
function _now() {
  return (new Date().valueOf());
}

// 处理 nativeBridge 注入之前，Web 发起的 callApp 请求
let _callAppQueue = [];
if (!window.nativeBridge) {
  // nativeBridge ready 后，将 callApp 的 message 逐一发送
  once('bridgeReady', function () {
    _callAppQueue.forEach(function (message) {
      _postMessageToApp(message);
    });
    _callAppQueue = null;
  });
}

// 通过 Native 注入的方法传送数据
function _postMessageToApp(message) {
  if (window.nativeBridge) {
    try {
      window.nativeBridge.postMessage(Device.isAndroidApp ? JSON.stringify(message) : message);
    } catch (err) {
      const errMsg = 'nativeBridge.postMessage 通信异常';
      callWeb({
        callbackId: message.callbackId,
        code: 1,
        msg: err.message || errMsg,
      });
      reportError(err, errMsg);  // 上报错误
    }
  } else {
    // nativeBridge ready 前，将 callApp 的 message 存入队列
    _callAppQueue && _callAppQueue.push(message);
  }
}

// Web 调用 Native
function callApp(params: any) {
  let { action, data = {}, success, fail, complete } = params;

  const message = { action, data, callbackId:0 };
  let callbackId;

  if (success || fail || complete) {
    callbackId = uniqueId++;
    callAppBacks[callbackId] = { success, fail, complete, timestamp: _now() };
    message.callbackId = callbackId;
  }

  console.log('webCallApp', message.callbackId || 0, message);
  _postMessageToApp(message);

  return () => {
    if (callbackId) {
      delete callAppBacks[callbackId];
    }
  };
}

// Native 调用 Web
function callWeb(params: any) {
  let { action, data = {}, code = -2, msg = '', callbackId = 0, responseId = 0 } = params;

  console.log('appCallWeb', callbackId || 0, arguments[0]);

  // 处理 Web callApp 的回调
  // 没有回调，客户端默认 callAppBackId = 0
  if (callbackId) {
    const callAppBack = callAppBacks[callbackId];
    if (callAppBack) {
      console.log('appCallback', callbackId, _now() - callAppBack.timestamp + 'ms');
      try {
        if (code === 0) {
          isFunction(callAppBack.success) && callAppBack.success(data || {});
        } else {
          isFunction(callAppBack.fail) && callAppBack.fail({ code, msg });
        }
        isFunction(callAppBack.complete) && callAppBack.complete({ code, data, msg });
      } catch (err) {
        reportError(err, 'appBridge 回调函数执行异常');  // 上报错误
      }
      delete callAppBacks[callbackId];
    }
    return;
  }

  // 触发 action
  const returnData = action && _triggerAction(action, data);

  // 向 Native 发送触发 action 的回调
  if (responseId && returnData) {
    callApp({
      responseId,
      data: returnData,
    });
  }
}

// 触发 action handler
function _triggerAction(action, data) {
  const handler = callWebHandlers[action];
  if (action === 'goBack' && !handler) {
    //如果这里是goBack方法，但是页面中没有监听该方法，那么把该方法交回app处理
    callApp({ action: 'goBack' })
  }
  return handler && handler(data || {});
}

// 执行移除 action hander
function _removeHandler(action) {
  delete callWebHandlers[action];
}

// 注册 action handler
function on(action, handler) {
  if (typeof action === 'string' && isFunction(handler)) {
    callWebHandlers[action] = handler;
  }

  // 返回当前 handler 的销毁方法
  return function () {
    _removeHandler(action);
  }
}

// 销毁 action handler
function off(action) {
  if (typeof action === 'string') {
    _removeHandler(action);
  }
}

// 注册一次性 action handler
function once(action, handler) {
  if (typeof action === 'string' && isFunction(handler)) {
    callWebHandlers[action] = function (data) {
      // handler.apply(this, arguments);
      handler(data);  // 如果回参只有 data，用这种方式直接高效
      _removeHandler(action);
    };
  }
}

// 对 Native 公开 callWeb 方法
// 对 Web 公开 callApp, on, off, once 方法
window.JSBridge = { callWeb, callApp, on, off, once };

export { callApp, on, off, once };

