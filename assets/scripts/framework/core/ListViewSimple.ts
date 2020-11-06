/**
 * Created by xujiawei on 2020-07-06 20:20:12
 * 简易ListView, 仿cocos官方demo实现
 */

const { ccclass, property } = cc._decorator;

const ListDirection = cc.Enum({
    HORIZIONAL: 1,
    VERTICAL: 2
});

export abstract class ItemCmp extends cc.Component {
    itemID: number = 0;  // 数据数组中的index
    itemCall(data: any): void {};  // item直接调用可以通知其他类, 子类不用实现
    abstract updateItem(index: number, data?: any): void;
}

@ccclass
export class ListViewSimple extends cc.Component {
    static ListDirection = ListDirection;

    @property({
        tooltip: 'ListView的滚动方向',
        type: ListDirection
    })
    direction = ListDirection.VERTICAL;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property({
        tooltip: 'item间隔距离'
    })
    spacing: number = 0;  // space between each item

    @property({
        tooltip: '超出显示区域的item数量，越多滑动越流程',
        min: 0,
        step: 1
    })
    outScopeCount: number = 3;

    spawnCount: number = 0;  // how many items we actually spawn

    totalCount: number = 0;  // how many items we need for the whole list

    bufferZone: number = 0;  // when item is away from bufferZone, we relocate it

    content: cc.Node = null;

    items: cc.Node[] = [];

    updateTimer: number = 0;

    updateInterval: number = 0;

    lastContentPos: cc.Vec2 = cc.v2(0, 0);

    private itemPool: cc.NodePool = null;
    private itemH: number = 0;
    private itemW: number = 0;
    private dataSet: any[] = null;

    // item调用事件
    @property(cc.Component.EventHandler)
    itemCall: cc.Component.EventHandler = null;

    onLoad() {
        this.content = this.scrollView.content;
        this.items = [];  // array to store spawned items
        this.updateTimer = 0;
        this.updateInterval = 0.1;
        this.itemPool = new cc.NodePool();

        let item = cc.instantiate(this.itemPrefab);
        this.itemH = item.height;
        this.itemW = item.width;
        this.itemPool.put(item);

        if (this.direction == ListDirection.HORIZIONAL) {
            // 显示范围外多加3个cell，加的越多越流畅
            this.spawnCount = Math.ceil(this.content.parent.width / this.itemW) + this.outScopeCount;
        } else {
            // 显示范围外多加3个cell，加的越多越流畅
            this.spawnCount = Math.ceil(this.content.parent.height / this.itemH) + this.outScopeCount;
        }

        // 预先放对象池里
        for (let i = 0; i < this.spawnCount - 1; ++i) { // spawn items, we only need to do this once
            let item = cc.instantiate(this.itemPrefab);
            this.itemPool.put(item);
        }

        this.lastContentPos = cc.v2(this.scrollView.content.x, this.scrollView.content.y);
    }

    reload(data: any[]) {
        if (!data || data.length == 0) {
            cc.error('no data for listView!');
            return;
        }

        this.scrollView.stopAutoScroll();
        // mark: 切换数据时清空之前的数据
        for (let i = 0; i < this.items.length; i++) {
            this.itemPool.put(this.items[i]);
        }
        this.items = [];

        this.dataSet = data;

        // 切换数据需要重新计算各参数
        this.totalCount = this.dataSet.length;

        if (this.direction == ListDirection.HORIZIONAL) {
            this.bufferZone = this.scrollView.node.width / 2 + this.itemW + this.spawnCount * 2;
            this.content.width = this.totalCount * (this.itemW + this.spacing) + this.spacing; // get total content height
        } else {
            this.bufferZone = this.scrollView.node.height / 2 + this.itemH + this.spawnCount * 2;
            this.content.height = this.totalCount * (this.itemH + this.spacing) + this.spacing; // get total content height
        }

        let reallyCount = Math.min(this.spawnCount, this.dataSet.length); // 数据少的时候以数据为准

        cc.log("total:%d, spawn:%d", this.totalCount, reallyCount);

        for (let i = 0; i < reallyCount; ++i) { // spawn items, we only need to do this once
            let item = this.itemPool.get();
            this.content.addChild(item);
            item.setPosition(this.getItemPositon(i));
            item.getComponent(ItemCmp).itemID = i;
            item.getComponent(ItemCmp).updateItem(i, this.dataSet[i]);
            item.getComponent(ItemCmp).itemCall = (data)=>{
                if (this.itemCall) {
                    this.itemCall.emit([data]);
                }
            }
            this.items.push(item);
        }

        if (this.direction == ListDirection.HORIZIONAL) {
            this.scrollView.scrollToLeft(0);
        } else {
            this.scrollView.scrollToTop(0);
        }
    }

    /**
     * 刷新指定位置的item，如果index < 0则刷新当前显示的全部item
     * @param index 
     */
    updateItem(index: number) {
        for (let item of this.items) {
            let itemCmp = item.getComponent(ItemCmp);
            if (index >= 0 && itemCmp.itemID == index) {
                itemCmp.updateItem(index, this.dataSet[index]);
                break;
            } else {
                itemCmp.updateItem(itemCmp.itemID, this.dataSet[itemCmp.itemID]);
            }
        }
    }

    getItemPositon(index: number) {
        if (this.direction == ListDirection.HORIZIONAL) {
            return cc.v2(this.itemW * 0.5 + this.spacing + (this.itemW + this.spacing) * index, 0);
        } else {
            return cc.v2(0, -this.itemH * (0.5 + index) - this.spacing * (index + 1));
        }
    }

    getPositionInView(item: cc.Node) { // get item position in scrollview's node space
        let worldPos = item.parent.convertToWorldSpaceAR(item.position);
        let viewPos = this.scrollView.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    }

    update(dt: number) {
        this.updateTimer += dt;
        if (this.updateTimer < this.updateInterval) return; // we don't need to do the math every frame
        this.updateTimer = 0;

        if (this.direction == ListDirection.HORIZIONAL) {
            this.updateHorizonal(dt);
        } else {
            this.updateVertical(dt);
        }

        // update lastContentPosY
        this.lastContentPos = cc.v2(this.scrollView.content.x, this.scrollView.content.y);
    }

    updateHorizonal(dt) {
        let items = this.items;
        let buffer = this.bufferZone;
        let isLeft = this.scrollView.content.x < this.lastContentPos.x; // scrolling direction
        let offset = (this.itemW + this.spacing) * items.length;

        for (let i = 0; i < items.length; ++i) {
            let viewPos = this.getPositionInView(items[i]);
            if (isLeft) {
                // 超出范围并且没有到最右端 item.x < content.width - offset
                if (viewPos.x < -buffer && items[i].x + offset < this.content.width) {
                    items[i].x = items[i].x + offset;
                    let item = items[i].getComponent(ItemCmp);
                    let itemId = item.itemID + items.length; // update item id
                    item.itemID = itemId;
                    item.updateItem(itemId, this.dataSet[itemId]);
                }
            } else {
                // 超出范围并且没有到最左端  item.x > offset
                if (viewPos.x > buffer && items[i].x - offset > 0) {
                    items[i].x = items[i].x - offset;
                    let item = items[i].getComponent(ItemCmp);
                    let itemId = item.itemID - items.length;
                    item.itemID = itemId;
                    item.updateItem(itemId, this.dataSet[itemId]);
                }
            }
        }
    }

    updateVertical(dt) {
        let items = this.items;
        let buffer = this.bufferZone;
        let isDown = this.scrollView.content.y < this.lastContentPos.y; // scrolling direction
        let offset = (this.itemH + this.spacing) * items.length;
        for (let i = 0; i < items.length; ++i) {
            let viewPos = this.getPositionInView(items[i]);
            if (isDown) {
                // if away from buffer zone and not reaching top of content
                if (viewPos.y < -buffer && items[i].y + offset < 0) {
                    items[i].y = items[i].y + offset;
                    let item = items[i].getComponent(ItemCmp);
                    let itemId = item.itemID - items.length; // update item id
                    item.itemID = itemId;
                    item.updateItem(itemId, this.dataSet[itemId]);
                }
            } else {
                // if away from buffer zone and not reaching bottom of content
                if (viewPos.y > buffer && items[i].y - offset > -this.content.height) {
                    items[i].y = items[i].y - offset;
                    let item = items[i].getComponent(ItemCmp);
                    let itemId = item.itemID + items.length;
                    item.itemID = itemId;
                    item.updateItem(itemId, this.dataSet[itemId]);
                }
            }
        }
    }

    scrollEvent(sender: any, event: any) {
        switch (event) {
            // case 0:
            //     this.lblScrollEvent.string = "Scroll to Top";
            //     break;
            // case 1:
            //     this.lblScrollEvent.string = "Scroll to Bottom";
            //     break;
            // case 2:
            //     this.lblScrollEvent.string = "Scroll to Left";
            //     break;
            // case 3:
            //     this.lblScrollEvent.string = "Scroll to Right";
            //     break;
            // case 4:
            //     this.lblScrollEvent.string = "Scrolling";
            //     break;
            // case 5:
            //     this.lblScrollEvent.string = "Bounce Top";
            //     break;
            // case 6:
            //     this.lblScrollEvent.string = "Bounce bottom";
            //     break;
            // case 7:
            //     this.lblScrollEvent.string = "Bounce left";
            //     break;
            // case 8:
            //     this.lblScrollEvent.string = "Bounce right";
            //     break;
            // case 9:
            //     this.lblScrollEvent.string = "Auto scroll ended";
            //     break;
        }
    }

    addItem() {
        this.content.height = (this.totalCount + 1) * (this.itemH + this.spacing) + this.spacing; // get total content height
        this.totalCount = this.totalCount + 1;
    }

    removeItem() {
        if (this.totalCount - 1 < 30) {
            cc.error("can't remove item less than 30!");
            return;
        }

        this.content.height = (this.totalCount - 1) * (this.itemH + this.spacing) + this.spacing; // get total content height
        this.totalCount = this.totalCount - 1;

        this.moveBottomItemToTop();
    }

    moveBottomItemToTop() {
        let offset = (this.itemH + this.spacing) * this.items.length;
        let length = this.items.length;
        let item = this.getItemAtBottom();

        // whether need to move to top
        if (item.y + offset < 0) {
            item.y = item.y + offset;
            let itemComp = item.getComponent(ItemCmp);
            let itemId = itemComp.itemID - length;
            itemComp.updateItem(itemId);
        }
    }

    getItemAtBottom() {
        let item = this.items[0];
        for (let i = 1; i < this.items.length; ++i) {
            if (item.y > this.items[i].y) {
                item = this.items[i];
            }
        }
        return item;
    }

    scrollToFixedPosition() {
        this.scrollView.scrollToOffset(cc.v2(0, 500), 2);
    }

    // 清空已缓存节点
    clearNodePool() {
        this.itemPool.clear();
    }

}