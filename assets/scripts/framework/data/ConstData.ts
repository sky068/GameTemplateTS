/**
 * Created by xujiawei on 2020-07-07 14:47:29
 * 固定配置数据
 */

export const ConstData = {
    DesignSize: cc.size(1024, 768),
    ZIndex: {
        // 基于CANVAS
        POP_BASE: 800,
        LOADING: 997,
        ALERT: 998,
        TIP: 999,

        // 基于POP
        POP_MASK: -999, // POP遮罩

        GUIDE: 900,
    },

    MAIN_CASTLE_ID: 101,  // 主城堡id

    StaticKey: {
        SaveDataVersion: 'V1',  // 附加给本地储存的key上，用来更新版本强制清空用户数据
        PlayerDataKey: 'playerDataKey',
        EVENT_NETWORK_OPENED: 'EVENT_NETWORK_OPENED',
        EVENT_NETWORK_CLOSED: 'EVENT_NETWORK_CLOSED',
        EVENT_LOGIN_FAILED: 'EVENT_LOGIN_FAILED',
        EVENT_LOGIN_SUC: 'EVENT_LOGIN_SUC'
    }
}
