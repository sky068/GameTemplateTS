/**
 * Created by xujiawei on 2020-07-03 18:11:25
 */

import { Node } from './Node';

const { ccclass, property } = cc._decorator;
@ccclass
export class Label extends cc.Label {
    // 工厂方法
    static createNode(params): cc.Node {
        let node = new cc.Node();
        node.addComponent(Label);
        Label.updateNode(node, params);
        return node;
    }

    static updateNode(node: cc.Node, params) {
        let label = node.getComponent(Label);
        if (!label) {
            label = node.getComponent(cc.Label);
        }
        let font = params.font ? params.font : '';
        let loadCallback = params.loadCallback;
        let systemFont = params.systemFont || true; // 系统字体 默认为FONT_NORMAL

        let updateFunc = function () {
            if (params.overflow) {
                label.overflow = params.overflow;
            }

            if (params.hasOwnProperty('string')) {
                label.string = params.string;
            }

            if (params.hasOwnProperty('verticalAlign')) {
                label.verticalAlign = params.verticalAlign;
            }

            if (params.hasOwnProperty('cacheMode')) {
                label.cacheMode = params.cacheMode;
            }

            if (params.fontSize) {
                label.fontSize = params.fontSize
            }

            if (params.lineHeight) {
                label.lineHeight = Number(params.lineHeight);
            }

            if (params.outlineWidth || params.outlineColor) {
                let outline = node.getComponent(cc.LabelOutline);
                if (!outline) {
                    outline = node.addComponent(cc.LabelOutline);
                }
                if (params.outlineWidth) {
                    outline.width = params.outlineWidth;
                }
                if (params.outlineColor) {
                    outline.color = params.outlineColor;
                }
            }
        }.bind(this);

        if (!systemFont) {
            cc.loader.loadRes(font, cc.Font, null, function (err, _font) {
                if (!err) {
                    if (cc.isValid(node)) {
                        // 字体
                        label.font = _font;

                        updateFunc();
                    }
                } else {
                    cc.log('zy.Label.updateLabel err:', err);
                }

                if (loadCallback) {
                    loadCallback(err, node);
                }

            }.bind(this));
        } else {
            updateFunc();

            if (loadCallback) {
                loadCallback(null, node);
            }
        }

        Node.updateNode(node, params);
    }
}