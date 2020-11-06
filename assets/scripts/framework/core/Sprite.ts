/**
 * Created by xujiawei on 2020-07-03 17:50:21
 */

import {Node} from './Node';

const { ccclass, property } = cc._decorator;
@ccclass
export class Sprite extends cc.Sprite {
    static createNode(params): cc.Node {
        let node = new cc.Node();
        node.addComponent(Sprite);
        Sprite.updateNode(node, params);
        return node;
    }

    static updateNode(node: cc.Node, params: any) {
        let sprite = node.getComponent(cc.Sprite);
        // sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        // 如果需要修改节点大小则sp.sizeMode需要设置为custom否则需要切换贴图后再设置，不然会被新贴图大小覆盖掉;
        if (params.hasOwnProperty('sizeMode')) {
            sprite.sizeMode = params.sizeMode;
        }

        let url = params.url;
        let spriteFrame: cc.SpriteFrame = params.spriteFrame;
        let loadCallback = params.loadCallback;

        let updateFunc = function (_spriteFrame) {
            if (_spriteFrame) {
                sprite.spriteFrame = _spriteFrame;
            }
            // cc.Sprite.State.NORMAL : cc.Sprite.State.GRAY // 2.0
            // cc.Scale9Sprite.state.NORMAL : GRAY : DISTORTION // 1.0
            if (params.hasOwnProperty('state')) {
                sprite.setState(params.state);
            }

            // 叠加模式
            if (params.srcBlendFactor) {
                sprite.srcBlendFactor = params.srcBlendFactor;
            }

            // 叠加模式
            if (params.dstBlendFactor) {
                sprite.dstBlendFactor = params.dstBlendFactor;
            }

            // 再次刷新Node
            // 创建图片时 父节点已被销毁
            if (!params.hasOwnProperty('parent') || cc.isValid(params.parent)) {
                Node.updateNode(node, params);
            }
        };

        if (url) {
            // sprite.url = url;
            cc.resources.load(url, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
                if (!err) {
                    // if (cc.isValid(node) && sprite.url == url) {
                    if (cc.isValid(node)) {
                        sprite.spriteFrame = spriteFrame;
                        updateFunc(null);
                    }
                } else {
                    cc.error("load: " + url + " error.");
                }

                if (loadCallback) {
                    loadCallback(err, node);
                }
            });
        } else if (spriteFrame) {
            updateFunc(spriteFrame);
        } else {
            updateFunc(null);
        }
    }
}