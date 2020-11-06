/**
 * Created by xujiawei on 2020-07-06 20:19:07
 * 
 * 来源: https://forum.cocos.org/t/listview/67396/71
 */

const {ccclass, property} = cc._decorator;
/**
 * 通用 ListView 组件.
 * 能够显示垂直/横向ListView. 具体用法见Demo
 */
@ccclass
export default class ListView extends cc.Component {

    @property(cc.Prefab)
    private itemTemplate: cc.Prefab = null;

    @property(cc.Vec2)
    private readonly spacing: cc.Vec2 = cc.v2(0, 0);

    // 四周距离.
    @property(cc.Rect)
    private readonly margin: cc.Rect = cc.rect(0, 0, 0, 0);

    // 比可见元素多缓存2个, 缓存越多,快速滑动越流畅,但同时初始化越慢.
    @property
    private spawnCount: number = 2;

    // 横向布局的item 数量. 默认为1,即每行一个元素.
    @property
    private column: number = 1;

    @property(cc.ScrollView)
    private scrollView: cc.ScrollView = null;

    @property(cc.Node)
    private emptyView: cc.Node = null;

    private content: cc.Node = null;

    private adapter: AbsAdapter = null;

    private readonly _items: cc.NodePool = new cc.NodePool();

    // 记录当前填充在树上的索引. 用来快速查找哪些位置缺少item了.
    private _filledIds: { [key: number]: cc.Node } = {};

    private horizontal: boolean = false;

    // 初始时即计算item的高度.因为布局时要用到.
    private _itemHeight: number = 1;

    private _itemWidth: number = 1;

    private _itemsVisible: number = 1;

    private dataChanged: boolean = false;

    private _isInited: boolean = false;

    // 当前屏幕可见元素索引值.
    private readonly visibleRange: number[] = [-1, -1];

    public readonly pager: Pager;

    public onLoad() {

        this.init();

        // @ts-ignore
        this.pager = new Pager(this);
        /**
         *  如果出现列表显示异常,如边界留白,item 错位等问题,可能是所在节点树 存在缩放行为.
         *  具体bug参考: https://forum.cocos.com/t/v2-1-0-scrollview/71260/5
         *  打开以下代码即可解决布局异常问题.
         */
        if (this.scrollView) {
            // this.scheduleOnce(() => {
            //     // @ts-ignore
            //     this.scrollView._calculateBoundary();
            // }, 0.1);
        }
    }

    public async setAdapter(adapter: AbsAdapter) {
        if (this.adapter === adapter) {
            this.notifyUpdate();
            return;
        }
        this.adapter = adapter;
        if (this.adapter == null) {
            console.warn("adapter 为空.");
            return
        }
        if (this.itemTemplate == null) {
            console.error("Listview 未设置待显示的Item模板.");
            return;
        }
        this.visibleRange[0] = this.visibleRange[1] = -1;
        this.recycleAll();
        this.notifyUpdate();
    }

    public getAdapter(): AbsAdapter {
        return this.adapter;
    }

    public getScrollView(): cc.ScrollView {
        return this.scrollView;
    }

    /**
     * 滚动API
     * @param pageIndex 滚动到哪一页.
     * @param pageCount 如果>0 则以count数量的item 为一页.否则以当前可见数量为一页.
     * @param timeSecond
     * @return true = 滚动到最后一页了.
     */
    public scrollToPage(pageIndex: number, pageCount?: number, timeSecond?: number): boolean {
        if (!this.adapter || !this.scrollView) {
            return false;
        }
        const count = this.adapter.getCount() || 1;
        this.column = this.column || 1;
        if (this.horizontal) {
            let pageWidth = 0;
            const maxWidth = this.content.width;
            const columnWidth = maxWidth / (count / this.column);
            if (!pageCount) {
                // 可见区域的总宽度. 还需要进一步缩减为整数个item的区域.
                let pW = this.content.parent.width;
                pageWidth = Math.floor(pW / columnWidth) * columnWidth;
            } else {
                pageWidth = columnWidth * pageCount;
            }
            this.scrollView.scrollToOffset(cc.v2(pageWidth * pageIndex, 0), timeSecond);
            return pageWidth * (pageIndex + 1) >= maxWidth;
        } else {
            const maxHeight = this.content.height;
            const rowHeight = maxHeight / (count / this.column);
            let pageHeight = 0;
            if (!pageCount) {
                // maskView 的高度.
                let pH = this.content.parent.height;
                pageHeight = Math.floor(pH / rowHeight) * rowHeight;
            } else {
                pageHeight = rowHeight * pageCount;
            }
            this.scrollView.scrollToOffset(cc.v2(pageHeight * pageIndex, 0), timeSecond);
            return pageHeight * (pageIndex + 1) >= maxHeight;
        }
    }

    // 获取可见区域的最大元素个数。不包含遮挡一半的元素。
    public getVisibleElements(): number {
        let visibleCount = 0;
        const count = this.adapter ? (this.adapter.getCount() || 1) : 1;
        if (this.horizontal) {
            const maxWidth = this.content.width;
            const columnWidth = maxWidth / (count / this.column);
            // 可见区域的总宽度. 还需要进一步缩减为整数个item的区域.
            let pW = this.content.parent.width;
            visibleCount = Math.floor(pW / columnWidth);
        } else {
            const maxHeight = this.content.height;
            const rowHeight = maxHeight / (count / this.column);
            // maskView 的高度.
            let pH = this.content.parent.height;
            visibleCount = Math.floor(pH / rowHeight);
        }
        return visibleCount;
    }

    // 数据变更了需要进行更新UI显示, 可只更新某一条.
    public notifyUpdate() {
        if (this.adapter == null) {
            return;
        }
        if (!this._isOnLoadCalled) {
            this.init();
        }
        if (!this.scrollView || !this.content) {
            return;
        }
        if (this.emptyView) {
            this.emptyView.opacity = this.adapter.getCount() > 0 ? 0 : 255;
        }
        this.visibleRange[0] = this.visibleRange[1] = -1;
        if (this.horizontal) {
            this.content.width = Math.ceil(this.adapter.getCount() / this.column) * (this._itemWidth + this.spacing.x)
                - this.spacing.x + this.margin.x + this.margin.width;
        } else {
            this.content.height = Math.ceil(this.adapter.getCount() / this.column) * (this._itemHeight + this.spacing.y)
                - this.spacing.y + this.margin.y + this.margin.height;
        }
        this.dataChanged = true;
    }

    protected lateUpdate() {
        const range = this.getVisibleRange();
        if (!this.checkNeedUpdate(range)) {
            return;
        }
        this.recycleDirty(range);
        this.updateView(range)
    }

    // 向某位置添加一个item.
    private _layoutVertical(child: cc.Node, posIndex: number) {
        this.content.addChild(child);
        // 当columns 大于1时,从左到右依次排列, 否则进行居中排列.
        const column = posIndex % (this.column || 1);
        const row = Math.floor(posIndex / (this.column || 1));
        child.setPosition(
            this.column > 1 ? this.margin.x + child.width * child.anchorX
                + (child.width + this.spacing.x) * column - this.content.width * this.content.anchorX : 0,
            -this.margin.y - child.height * (child.anchorY + row) - this.spacing.y * row);
    }

    // 向某位置添加一个item.
    private _layoutHorizontal(child: cc.Node, posIndex: number) {
        this.content.addChild(child);
        const row = posIndex % (this.column || 1);
        const column = Math.floor(posIndex / (this.column || 1));
        child.setPosition(
            child.width * (child.anchorX + column) + this.spacing.x * column + this.margin.x,
            this.column > 1 ? this.margin.y + child.height * child.anchorY + (child.height + this.spacing.y) * row
                - this.content.height * this.content.anchorY : 0);
    }

    private recycleAll() {
        for (const child in this._filledIds) {
            if (this._filledIds.hasOwnProperty(child)) {
                this._items.put(this._filledIds[child]);
            }
        }
        this._filledIds = {};
    }

    private recycleDirty(visibleRange: number[]) {
        if (!visibleRange || visibleRange.length < 2) {
            return;
        }
        for (let i = this.visibleRange[0]; i < visibleRange[0]; i++) {
            if (i < 0 || !this._filledIds[i]) {
                continue;
            }
            this._items.put(this._filledIds[i]);
            this._filledIds[i] = null;
        }
        for (let j = this.visibleRange[1]; j > visibleRange[1]; j--) {
            if (j < 0 || !this._filledIds[j]) {
                continue;
            }
            this._items.put(this._filledIds[j]);
            this._filledIds[j] = null;
        }
        this.visibleRange[0] = visibleRange[0];
        this.visibleRange[1] = visibleRange[1];
    }

    private checkNeedUpdate(visibleRange: number[]): boolean {
        return visibleRange && this.visibleRange && (this.visibleRange[0] != visibleRange[0] || this.visibleRange[1] != visibleRange[1]);
    }

    // 填充View.
    private updateView(visibleRange: number[]) {
        for (let i = visibleRange[0]; i <= visibleRange[1]; i++) {
            if (!this.dataChanged) {
                if (this._filledIds[i]) {
                    continue;
                }
            }
            let child = this._filledIds[i] || this._items.get() || cc.instantiate(this.itemTemplate);
            child.removeFromParent(false);
            this._filledIds[i] = this.adapter._getView(child, i);
            this.horizontal ?
                this._layoutHorizontal(child, i) :
                this._layoutVertical(child, i);
        }
        this.dataChanged = false;
    }

    // 获取当前屏幕可见元素索引.
    private getVisibleRange(): number[] {
        if (this.adapter == null) {
            return null;
        }
        let scrollOffset = this.scrollView.getScrollOffset();
        let startIndex = 0;

        if (this.horizontal) {
            startIndex = Math.floor(-scrollOffset.x / (this._itemWidth + this.spacing.x))
        } else {
            startIndex = Math.floor(scrollOffset.y / (this._itemHeight + this.spacing.y))
        }
        if (startIndex < 0) {
            startIndex = 0;
        }
        let visible = this.column * (startIndex + this._itemsVisible + this.spawnCount);
        if (visible >= this.adapter.getCount()) {
            visible = this.adapter.getCount() - 1;
        }
        return [startIndex * this.column, visible];
    }

    private init() {
        if (this._isInited) return;
        this._isInited = true;
        if (this.scrollView) {
            this.content = this.scrollView.content;
            this.horizontal = this.scrollView.horizontal;
            if (this.horizontal) {
                this.scrollView.vertical = false;
                this.content.anchorX = 0;
                this.content.anchorY = this.content.parent.anchorY;
                this.content.x = 0 - this.content.parent.width * this.content.parent.anchorX;
                this.content.y = 0;
            } else {
                this.scrollView.vertical = true;
                this.content.anchorX = this.content.parent.anchorX;
                this.content.anchorY = 1;
                this.content.x = 0;
                this.content.y = this.content.parent.height * this.content.parent.anchorY;
            }
        } else {
            console.error("ListView need a scrollView for showing.")
        }

        let itemOne = this._items.get() || cc.instantiate(this.itemTemplate);
        this._items.put(itemOne);
        this._itemHeight = itemOne.height || 10;
        this._itemWidth = itemOne.width || 10;

        if (this.horizontal) {
            this._itemsVisible = Math.ceil((this.content.parent.width - this.margin.x - this.margin.width) / (this._itemWidth + this.spacing.x));
        } else {
            this._itemsVisible = Math.ceil((this.content.parent.height - this.margin.y - this.margin.height) / (this._itemHeight + this.spacing.y));
        }
    }
}

export class Pager {
    private listView: ListView = null;

    // 每一页的item数量。用于控制一次滚动多少条。
    private pageOfItems: number = 0;

    //当前所在的页数位置。
    private currentPageIndex: number = 0;

    // Page 变化事件。
    private onPageChangeListener: Function = null;

    constructor(listView: ListView, pageOfItems: number = 0) {
        this.listView = listView;
        this.pageOfItems = pageOfItems;
        // this.getPageCount();
    }

    public getPageCount(): number {
        if (!this.listView.getAdapter()) return 1;
        const count = this.listView.getAdapter().getCount();
        if (!this.pageOfItems) {
            this.pageOfItems = this.listView.getVisibleElements();
        }
        if (this.pageOfItems <= 0) {
            this.pageOfItems = 1;
        }
        const pages = Math.ceil(count / this.pageOfItems);
        console.log("page = ", pages);
        return pages;
    }

    public getCurrentPage(): number {
        return this.currentPageIndex;
    }

    public prePage() {
        this.currentPageIndex--;
        if (this.currentPageIndex < 0) this.currentPageIndex = 0;
        this.listView.scrollToPage(this.currentPageIndex, this.pageOfItems, 0.2);
        if (this.onPageChangeListener) {
            this.onPageChangeListener(this.listView, this.currentPageIndex);
        }
    }

    public nextPage() {
        this.currentPageIndex++;
        const pageCount = this.getPageCount();
        if (this.currentPageIndex > pageCount - 1) {
            this.currentPageIndex = pageCount - 1;
        }
        this.listView.scrollToPage(this.currentPageIndex, this.pageOfItems, 0.2);
        if (this.onPageChangeListener) {
            this.onPageChangeListener(this.listView, this.currentPageIndex);
        }
    }

    public canPrePage(): boolean {
        return this.currentPageIndex > 0;
    }

    public canNextPage(): boolean {
        return this.currentPageIndex < this.getPageCount() - 1;
    }

    public setOnPageChangeListener(l: (listView: ListView, curPage: number) => void) {
        this.onPageChangeListener = l;
    }
}

// 数据绑定的辅助适配器
export abstract class AbsAdapter {

    private dataSet: any[] = [];

    public setDataSet(data: any[]) {
        this.dataSet = data || [];

    }

    public getCount(): number {
        return this.dataSet ? this.dataSet.length : 0;
    }

    public getItem(posIndex: number): any {
        return this.dataSet[posIndex];
    }

    public _getView(item: cc.Node, posIndex: number): cc.Node {
        this.updateView(item, posIndex);
        return item;
    }

    public abstract updateView(item: cc.Node, posIndex: number);
}