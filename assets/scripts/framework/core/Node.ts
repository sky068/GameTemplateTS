/**
 * Created by xujiawei on 2020-07-03 17:44:03
 */

const { ccclass, property } = cc._decorator;
@ccclass
export class Node extends cc.Node {
    static createNode(params: any): cc.Node {
        let node = new Node();
        Node.updateNode(node, params);
        return node;
    }

    static updateNode(node: cc.Node, params: any) {
        if (params.name) {
            node.name = params.name;
        }

        if (params.anchor) {
            node.setAnchorPoint(params.anchor);
        }

        if (typeof params.x == 'number') {
            node.x = params.x;
        }

        if (typeof params.y == 'number') {
            node.y = params.y;
        }

        if (params.position) {
            node.setPosition(params.position);
        }

        if (typeof params.width == 'number') {
            node.width = params.width;
        }

        if (typeof params.height == 'number') {
            node.height = params.height;
        }

        if (params.size) {
            node.width = params.size.width;
            node.height = params.size.height;
        }

        if (typeof params.opacity == 'number') {
            node.opacity = params.opacity;
        }

        if (params.color) {
            node.color = params.color;
        }

        if (typeof params.zIndex == 'number') {
            node.zIndex = params.zIndex;
        }

        if (typeof params.rotation == 'number') {
            node.rotation = params.rotation;
        }

        if (typeof params.scale == 'number') {
            node.scale = params.scale;
        }

        if (typeof params.scaleX == 'number') {
            node.scaleX = params.scaleX;
        }

        if (typeof params.scaleY == 'number') {
            node.scaleY = params.scaleY;
        }

        if (params.hasOwnProperty('flipX')) {
            if (params.flipX) {
                node.scaleX = -1 * Math.abs(node.scaleX);
            } else {
                node.scaleX = 1 * Math.abs(node.scaleX);
            }
        }

        if (params.hasOwnProperty('flipY')) {
            if (params.flipY) {
                node.scaleY = -1 * Math.abs(node.scaleY);
            } else {
                node.scaleY = 1 * Math.abs(node.scaleY);
            }
        }

        if (params.hasOwnProperty('active')) {
            node.active = params.active;
        }

        if (params.parent) {
            node.parent = params.parent;
        }
    }
}