/**
 * Created by xujiawei on 2020-07-08 16:18:43
 */

/**
 * 消息基类对象，请求消息BaseRequest， 回调消息BaseResponse都继承BaseProtocol
 */
class BaseProtocol {
    /**
     * 请求动作类型
     */
    act: string = '';

    /**
     * 每个请求的sequence_id应该唯一
     */
    seq: number = 0;

    /**
     * 错误代码，0为正常
     */
    err: number = 0;

    /**
     * 是否需要等待服务器回调
     */
    is_async: boolean = false;
}

/**
 * 请求消息基类，客户端的请求都继承这个类
 */
export class BaseRequest extends BaseProtocol {
}

/**
 * 服务器返回的消息对应的对象，包含返回数据，一般和BaseRequest成对使用
 * @class BaseResponse
 * @extends BaseProtocol
 */
export class BaseResponse extends BaseProtocol {
    /**
     * 读取返回数据，设置BaseResponse对象
     */
    loadData(data: any) {
        let key;
        for (key in data) {
            if (!this.hasOwnProperty(key)) {
                continue;
            }

            if (data[key] !== undefined && data[key] !== null) {
                this[key] = data[key];
            }
        }
    }
}

//-------------------------------------------------------
export class  HeartRequest extends BaseRequest {
    t: number = 0;
    constructor() {
        super();
        this.act = 'heart';
        this.t = -1;    // 发送时间
    }
}

export class  HeartResponse extends BaseResponse {
    t: number = 0;
    constructor() {
        super();
        this.act = 'heart';
        this.t = -1;
    }
}

//-------------------------------------------------------
export class  CreateRoomRequest extends BaseRequest {
    constructor() {
        super();
        this.act = "createRoom";
    }
}

export class  CreateRoomResponse extends BaseResponse {
    rid: number = 0;
    constructor() {
        super();
        this.act = "createRoom";
        this.rid = 0;
    }
}
//-------------------------------------------------------
export class  JoinRoomRequest extends BaseRequest {
    rid: number = 0;
    constructor() {
        super();
        this.act = "joinRoom";
        this.rid = 0;
    }
}

//-------------------------------------------------------
export class  ChatRequest extends BaseRequest {
    msg: string = '';
    uid: string = '';
    constructor() {
        super();
        this.act = 'chat';
        this.msg = '';
        this.uid = '';
    }
}

export class  PushChat extends BaseResponse {
    msg: string = '';
    uid: string = '';
    constructor() {
        super();
        this.act = 'chat';
        this.msg = '';
        this.uid = '';
    }
}

//-------------------------------------------------------
export class  SelectChessRequest extends BaseRequest {
    cid: number = 0;
    constructor() {
        super();
        this.act = "selectChess";
        this.cid = 0;
    }
}

export class  PushSelectChess extends BaseResponse {
    cid: number = 0;
    constructor() {
        super();
        this.act = "selectChess";
        this.cid = 0;
    }
}
//-------------------------------------------------------
export class  LoginRequest extends BaseRequest {
    token: string = '';
    origin: number = 0;
    os: string = '';
    osVersion: string = '';
    deviceModel: string = '';
    channelId: number = 0;
    idfa: string = '';
    androidId: string = '';
    googleAid: string = '';
    appVersion: string = '';
    packName: string = '';
    language: string = '';
    locale: string = '';
    uid: string = '';

    constructor() {
        super();
        this.act = 'login';

        /**
         * facebook用户的accessToken，或游客的UUID
         */
        this.token = '';

        /**
         * token来源，默认0:游客，1:facebook
         */
        this.origin = 0;

        /**
         * 平台: 必须为以下几种之一：android/ios/winphone/pc
         */
        this.os = '';

        /**
         * 平台系统版本
         */
        this.osVersion = '';

        /**
         * 设备产品型号, 示例 iPhone8,2, SM-G 9280
         */
        this.deviceModel = '';

        /**
         * 渠道ID
         */
        this.channelId = 0;

        /**
         * Ios设备广告标示符
         */
        this.idfa = '';

        /**
         * 安卓设备id
         */
        this.androidId = '';

        /**
         * Google广告平台账号，安装了google play的设备可取到
         */
        this.googleAid = '';

        /**
         * 应用版本号
         */
        this.appVersion = '';

        /**
         * 取package name或者bundle id
         */
        this.packName = '';


        /**
         * 设备语言
         * @type {string}
         */
        this.language = '';

        this.locale = "";

        this.uid = '';
    }
}

export class  LoginResponse extends BaseResponse {

    token: string = '';
    self: any = null;
    other: any = null;
    order: number = 0;
    rid: number = 0;
    isReconn: boolean = false;

    constructor() {
        super();
        this.act = 'login';

        /**
         * 游客第一次登录时返回的token，需要客户端保存
         */
        this.token = '';

        this.self = {
            isBlack: false,
            chessDic: {}
        };

        this.other = {
            isBlack: false,
            chessDic: {},
            uid: 0
        };

        this.order = 0;

        this.rid = 0;

        this.isReconn = false;  // 是否断线重连

    }
}

//-------------------------------------------------------
export class  LogoutRequest extends BaseRequest{
    constructor() {
        super();
        this.act = 'logout';
    }
}

export class  LogoutResponse extends BaseResponse{
    constructor() {
        super();
        this.act = 'logout';
    }
}
//-------------------------------------------------------
/**
 * 绑定fb账号
 * @extends BaseRequest
 */
export class  BindFacebookRequest extends BaseRequest{
    token: string = '';
    constructor () {
        super();
        this.act = 'bindFb';

        /**
         * facebook用户的accessToken，或游客的UUID
         */
        this.token = '';
    }
}
/**
 * 绑定fb账号
 * @extends BaseResponse
 */
export class  BindFacebookResponse extends BaseResponse{
    me: any = 0;
    friends: any = 0;
    constructor() {
        super();
        this.act = 'bindFb';

        /**
         * fb数据
         */
        this.me = 0;

        /**
         * fb好友
         */
        this.friends = 0;
    }
}
//-------------------------------------------------------
/**
 * 获取排名
 * @extends BaseRequest
 */
export class  RankRequest extends BaseRequest{
    type: number = 0;
    constructor () {
        super();
        this.act = 'rankboard';

        /**
         * 请求动作类型{ 0全部，1本地，2好友 }
         * @type {int}
         */
        this.type = 0;
    }
}
/**
 * 获取排名
 * @extends BaseResponse
 */
export class  RankResponse extends BaseResponse{
    myRank: number = 0;
    men: any[] = [];
    constructor () {
        super();
        this.act = 'rankboard';

        /**
         *  我的排名
         */
        this.myRank = 0;

        /**
         * 排名玩家数据
         */
        this.men = [];
    }
}


//----------------------only push------------------------
export class  PushExitRoom extends BaseResponse{
    uid: string = '';
    constructor () {
        super();

        this.act = 'exitRoom';

        this.uid = '';   // 退出玩家的uid
    }
}
//-------------------------------------------------------
/**
 * 推送消息 推送消息好友已赠送体力
 * @extends BaseResponse
 */
export class  PushSendSpResponse extends BaseResponse{
    friend: any = null;
    constructor () {
        super();

        this.act = 'sendSpNotify';

        /**
         * 好友对象
         */
        this.friend = null;
    }
}

//-------------------------------------------------------
/**
 * 推送消息 同步好友信息
 * @extends BaseResponse
 */
export class  PushSyncFriendInfo extends BaseResponse{
    friend: any = null;
    constructor () {
        super();
        this.act = 'friendInfoSync';

        /**
         * 好友
         */
        this.friend = null;
    }
}

//-------------------------------------------------------
/**
 * debug回调
 * @extends BaseRequest
 */
export class  DebugChangeMeRequest extends BaseRequest{
    cmd: string = '';
    constructor () {
        super();

        this.act = "cmdTest";					//请求动作类型
        this.cmd = "";
        //  "player coins add 100", cmd格式：player field value 或者 player field add value
        //  Building field [add] value where playerId value type value
    }
}
/**
 * debug回调
 * @extends BaseResponse
 */
export class  DebugChangeMeResponse extends BaseResponse{
    me: any = {};
    spInterval: number = 0;
    spStepLeftTime: number = 0;
    farmDailyOut: number = 0;
    farmCoins: number = 0;
    farmInterval: number = 0;
    buildings: any = 0;

    constructor() {
        super();

        this.act = "cmdTest";

        /**
         * 玩家数据
         * @type {Object}
         */
        this.me = {};

        /**
         * 体力恢复周期
         * @type {Number}
         */
        this.spInterval = null;

        /**
         * 体力恢复剩余时间
         * @type {Number}
         */
        this.spStepLeftTime = null;

        /**
         * 存钱罐速度
         * @type {Number}
         */
        this.farmDailyOut = null;

        /**
         * 存钱罐可回收金币
         * @type {Number}
         */
        this.farmCoins = null;

        /**
         * 存钱罐回收周期
         * @type {Number}
         */
        this.farmInterval = null;

        /**
         * 岛屿建筑数据
         * @type {Array}
         */
        this.buildings = null;
    }
}

/**
 * 通过服务器返回的数据的act快速找到对应的Response类
 * act: Response 
 */
export let response_classes = {
    login: LoginResponse,
    logout: LogoutResponse,
    bindFb: BindFacebookResponse,
    rankboard: RankResponse,
    heart: HeartResponse,
    createRoom: CreateRoomResponse,

    //push
    chat: PushChat,
    exitRoom: PushExitRoom,
    selectChess: PushSelectChess,
    sendSpNotify: PushSendSpResponse,
    friendInfoSync: PushSyncFriendInfo,

    // debug
    cmdTest: DebugChangeMeResponse,
};

// module.exports = {
//     LoginRequest: LoginRequest,
//     LoginResponse: LoginResponse,
//     LogoutRequest: LogoutRequest,
//     LogoutResponse: LogoutResponse,
//     BindFacebookRequest: BindFacebookRequest,
//     BindFacebookResponse: BindFacebookResponse,
//     RankRequest: RankRequest,
//     RankResponse: RankResponse,
//     HeartRequest: HeartRequest,
//     HeartResponse: HeartResponse,
//     ChatRequest: ChatRequest,
//     SelectChessRequest: SelectChessRequest,
//     CreateRoomRequest: CreateRoomRequest,
//     CreateRoomResponse: CreateRoomResponse,
//     JoinRoomRequest: JoinRoomRequest,

//     // debug
//     DebugChangeMeRequest: DebugChangeMeRequest,
//     DebugChangeMeResponse: DebugChangeMeResponse,

//     //push消息
//     PushChat: PushChat,
//     PushExitRoom: PushExitRoom,
//     PushSendSpResponse: PushSendSpResponse,
//     PushSyncFriendInfo: PushSyncFriendInfo,

//     response_classes: response_classes
// };
