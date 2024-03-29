var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Property, Event, closest, Collection, Complex, attributes, detach } from '@syncfusion/ej2-base';
import { NotifyPropertyChanges, ChildProperty, select, isVisible } from '@syncfusion/ej2-base';
import { KeyboardEvents, Browser, formatUnit, L10n } from '@syncfusion/ej2-base';
import { setStyleAttribute as setStyle, isNullOrUndefined as isNOU, selectAll, addClass, removeClass, remove } from '@syncfusion/ej2-base';
import { EventHandler, rippleEffect, Touch, compile, Animation } from '@syncfusion/ej2-base';
import { updateBlazorTemplate, resetBlazorTemplate, isBlazor } from '@syncfusion/ej2-base';
import { Toolbar } from '../toolbar/toolbar';
var CLS_TAB = 'e-tab';
var CLS_HEADER = 'e-tab-header';
var CLS_BLA_TEM = 'blazor-template';
var CLS_CONTENT = 'e-content';
var CLS_NEST = 'e-nested';
var CLS_ITEMS = 'e-items';
var CLS_ITEM = 'e-item';
var CLS_TEMPLATE = 'e-template';
var CLS_RTL = 'e-rtl';
var CLS_ACTIVE = 'e-active';
var CLS_DISABLE = 'e-disable';
var CLS_HIDDEN = 'e-hidden';
var CLS_FOCUS = 'e-focused';
var CLS_ICONS = 'e-icons';
var CLS_ICON = 'e-icon';
var CLS_ICON_TAB = 'e-icon-tab';
var CLS_ICON_CLOSE = 'e-close-icon';
var CLS_CLOSE_SHOW = 'e-close-show';
var CLS_TEXT = 'e-tab-text';
var CLS_INDICATOR = 'e-indicator';
var CLS_WRAP = 'e-tab-wrap';
var CLS_TEXT_WRAP = 'e-text-wrap';
var CLS_TAB_ICON = 'e-tab-icon';
var CLS_TB_ITEMS = 'e-toolbar-items';
var CLS_TB_ITEM = 'e-toolbar-item';
var CLS_TB_POP = 'e-toolbar-pop';
var CLS_TB_POPUP = 'e-toolbar-popup';
var CLS_HOR_NAV = 'e-hor-nav';
var CLS_POPUP_OPEN = 'e-popup-open';
var CLS_POPUP_CLOSE = 'e-popup-close';
var CLS_PROGRESS = 'e-progress';
var CLS_IGNORE = 'e-ignore';
var CLS_OVERLAY = 'e-overlay';
var CLS_HSCRCNT = 'e-hscroll-content';
var CLS_VSCRCNT = 'e-vscroll-content';
var CLS_HORIZONTAL = 'e-horizontal';
var CLS_VTAB = 'e-vertical-tab';
var CLS_VERTICAL = 'e-vertical';
var CLS_VLEFT = 'e-vertical-left';
var CLS_VRIGHT = 'e-vertical-right';
var CLS_HBOTTOM = 'e-horizontal-bottom';
var CLS_FILL = 'e-fill-mode';
var TabActionSettings = /** @class */ (function (_super) {
    __extends(TabActionSettings, _super);
    function TabActionSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('SlideLeftIn')
    ], TabActionSettings.prototype, "effect", void 0);
    __decorate([
        Property(600)
    ], TabActionSettings.prototype, "duration", void 0);
    __decorate([
        Property('ease')
    ], TabActionSettings.prototype, "easing", void 0);
    return TabActionSettings;
}(ChildProperty));
export { TabActionSettings };
var TabAnimationSettings = /** @class */ (function (_super) {
    __extends(TabAnimationSettings, _super);
    function TabAnimationSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Complex({ effect: 'SlideLeftIn', duration: 600, easing: 'ease' }, TabActionSettings)
    ], TabAnimationSettings.prototype, "previous", void 0);
    __decorate([
        Complex({ effect: 'SlideRightIn', duration: 600, easing: 'ease' }, TabActionSettings)
    ], TabAnimationSettings.prototype, "next", void 0);
    return TabAnimationSettings;
}(ChildProperty));
export { TabAnimationSettings };
/**
 * Objects used for configuring the Tab item header properties.
 */
var Header = /** @class */ (function (_super) {
    __extends(Header, _super);
    function Header() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], Header.prototype, "text", void 0);
    __decorate([
        Property('')
    ], Header.prototype, "iconCss", void 0);
    __decorate([
        Property('left')
    ], Header.prototype, "iconPosition", void 0);
    return Header;
}(ChildProperty));
export { Header };
/**
 * An array of object that is used to configure the Tab.
 */
var TabItem = /** @class */ (function (_super) {
    __extends(TabItem, _super);
    function TabItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Complex({}, Header)
    ], TabItem.prototype, "header", void 0);
    __decorate([
        Property(null)
    ], TabItem.prototype, "headerTemplate", void 0);
    __decorate([
        Property('')
    ], TabItem.prototype, "content", void 0);
    __decorate([
        Property('')
    ], TabItem.prototype, "cssClass", void 0);
    __decorate([
        Property(false)
    ], TabItem.prototype, "disabled", void 0);
    return TabItem;
}(ChildProperty));
export { TabItem };
/**
 * Tab is a content panel to show multiple contents in a single space, one at a time.
 * Each Tab item has an associated content, that will be displayed based on the active Tab header item.
 * ```html
 * <div id="tab"></div>
 * <script>
 *   var tabObj = new Tab();
 *   tab.appendTo("#tab");
 * </script>
 * ```
 */
var Tab = /** @class */ (function (_super) {
    __extends(Tab, _super);
    /**
     * Initializes a new instance of the Tab class.
     * @param options  - Specifies Tab model properties as options.
     * @param element  - Specifies the element that is rendered as a Tab.
     */
    function Tab(options, element) {
        var _this = _super.call(this, options, element) || this;
        _this.show = {};
        _this.hide = {};
        _this.animateOptions = {};
        _this.animObj = new Animation(_this.animateOptions);
        _this.maxHeight = 0;
        _this.title = 'Close';
        _this.lastIndex = 0;
        _this.isAdd = false;
        _this.isIconAlone = false;
        _this.resizeContext = _this.refreshActElePosition.bind(_this);
        /**
         * Contains the keyboard configuration of the Tab.
         */
        _this.keyConfigs = {
            tab: 'tab',
            home: 'home',
            end: 'end',
            enter: 'enter',
            space: 'space',
            delete: 'delete',
            moveLeft: 'leftarrow',
            moveRight: 'rightarrow',
            moveUp: 'uparrow',
            moveDown: 'downarrow'
        };
        return _this;
    }
    /**
     * Removes the component from the DOM and detaches all its related event handlers, attributes and classes.
     * @returns void
     */
    Tab.prototype.destroy = function () {
        var _this = this;
        if (!isNOU(this.tbObj)) {
            this.tbObj.destroy();
        }
        this.unWireEvents();
        ['role', 'aria-disabled', 'aria-activedescendant', 'tabindex', 'aria-orientation'].forEach(function (val) {
            _this.element.removeAttribute(val);
        });
        this.expTemplateContent();
        if (!this.isTemplate) {
            while (this.element.firstElementChild) {
                remove(this.element.firstElementChild);
            }
        }
        else {
            var cntEle = select('.' + CLS_TAB + ' > .' + CLS_CONTENT, this.element);
            this.element.classList.remove(CLS_TEMPLATE);
            if (!isNOU(cntEle)) {
                cntEle.innerHTML = this.cnt;
            }
        }
        _super.prototype.destroy.call(this);
        this.trigger('destroyed');
    };
    /**
     * Initialize component
     * @private
     */
    Tab.prototype.preRender = function () {
        var nested = closest(this.element, '.' + CLS_CONTENT);
        this.prevIndex = 0;
        this.isNested = false;
        this.isPopup = false;
        this.initRender = true;
        this.isSwipeed = false;
        this.itemIndexArray = [];
        this.templateEle = [];
        if (!isNOU(nested)) {
            nested.parentElement.classList.add(CLS_NEST);
            this.isNested = true;
        }
        var name = Browser.info.name;
        var css = (name === 'msie') ? 'e-ie' : (name === 'edge') ? 'e-edge' : (name === 'safari') ? 'e-safari' : '';
        setStyle(this.element, { 'width': formatUnit(this.width), 'height': formatUnit(this.height) });
        this.setCssClass(this.element, this.cssClass, true);
        attributes(this.element, { role: 'tablist', 'aria-disabled': 'false', 'aria-activedescendant': '' });
        this.setCssClass(this.element, css, true);
        this.updatePopAnimationConfig();
    };
    /**
     * Initialize the component rendering
     * @private
     */
    Tab.prototype.render = function () {
        this.btnCls = this.createElement('span', { className: CLS_ICONS + ' ' + CLS_ICON_CLOSE, attrs: { title: this.title } });
        this.renderContainer();
        this.wireEvents();
        this.initRender = false;
        if (isBlazor()) {
            this.renderComplete();
        }
    };
    Tab.prototype.renderContainer = function () {
        var ele = this.element;
        if (this.items.length > 0 && ele.children.length === 0) {
            ele.appendChild(this.createElement('div', { className: CLS_CONTENT }));
            this.setOrientation(this.headerPlacement, this.createElement('div', { className: CLS_HEADER }));
            this.isTemplate = false;
        }
        else if (this.element.children.length > 0) {
            this.isTemplate = true;
            ele.classList.add(CLS_TEMPLATE);
            var header = ele.querySelector('.' + CLS_HEADER);
            if (header && this.headerPlacement === 'Bottom') {
                this.setOrientation(this.headerPlacement, header);
            }
        }
        if (!isNOU(select('.' + CLS_HEADER, this.element)) && !isNOU(select('.' + CLS_CONTENT, this.element))) {
            this.renderHeader();
            this.tbItems = select('.' + CLS_HEADER + ' .' + CLS_TB_ITEMS, this.element);
            if (!isNOU(this.tbItems)) {
                rippleEffect(this.tbItems, { selector: '.e-tab-wrap' });
            }
            this.renderContent();
            if (selectAll('.' + CLS_TB_ITEM, this.element).length > 0) {
                var scrCnt = void 0;
                this.tbItems = select('.' + CLS_HEADER + ' .' + CLS_TB_ITEMS, this.element);
                this.bdrLine = this.createElement('div', { className: CLS_INDICATOR + ' ' + CLS_HIDDEN + ' ' + CLS_IGNORE });
                scrCnt = select('.' + this.scrCntClass, this.tbItems);
                if (!isNOU(scrCnt)) {
                    scrCnt.insertBefore(this.bdrLine, scrCnt.firstChild);
                }
                else {
                    this.tbItems.insertBefore(this.bdrLine, this.tbItems.firstChild);
                }
                this.setContentHeight(true);
                this.select(this.selectedItem);
            }
            this.setRTL(this.enableRtl);
        }
    };
    Tab.prototype.renderHeader = function () {
        var _this = this;
        var hdrPlace = this.headerPlacement;
        var tabItems = [];
        this.hdrEle = this.getTabHeader();
        this.addVerticalClass();
        if (!this.isTemplate) {
            tabItems = this.parseObject(this.items, 0);
        }
        else {
            if (this.element.children.length > 1 && this.element.children[1].classList.contains(CLS_HEADER)) {
                this.setProperties({ headerPlacement: 'Bottom' }, true);
            }
            var count = this.hdrEle.children.length;
            var hdrItems = [];
            for (var i = 0; i < count; i++) {
                hdrItems.push(this.hdrEle.children.item(i).innerHTML);
            }
            if (count > 0) {
                while (this.hdrEle.firstElementChild) {
                    detach(this.hdrEle.firstElementChild);
                }
                var tabItems_1 = this.createElement('div', { className: CLS_ITEMS });
                this.hdrEle.appendChild(tabItems_1);
                hdrItems.forEach(function (item, index) {
                    _this.lastIndex = index;
                    var attr = {
                        className: CLS_ITEM, id: CLS_ITEM + '_' + index,
                        attrs: { role: 'tab', 'aria-controls': CLS_CONTENT + '_' + index, 'aria-selected': 'false' }
                    };
                    var txt = _this.createElement('span', {
                        className: CLS_TEXT, innerHTML: item, attrs: { 'role': 'presentation' }
                    }).outerHTML;
                    var cont = _this.createElement('div', {
                        className: CLS_TEXT_WRAP, innerHTML: txt + _this.btnCls.outerHTML
                    }).outerHTML;
                    var wrap = _this.createElement('div', { className: CLS_WRAP, innerHTML: cont, attrs: { tabIndex: '-1' } });
                    tabItems_1.appendChild(_this.createElement('div', attr));
                    selectAll('.' + CLS_ITEM, tabItems_1)[index].appendChild(wrap);
                });
            }
        }
        this.tbObj = new Toolbar({
            width: (hdrPlace === 'Left' || hdrPlace === 'Right') ? 'auto' : '100%',
            height: (hdrPlace === 'Left' || hdrPlace === 'Right') ? '100%' : 'auto',
            overflowMode: this.overflowMode,
            items: (tabItems.length !== 0) ? tabItems : [],
            clicked: this.clickHandler.bind(this),
            scrollStep: this.scrollStep
        });
        this.tbObj.isStringTemplate = true;
        this.tbObj.createElement = this.createElement;
        this.tbObj.appendTo(this.hdrEle);
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.headerTemplate && isBlazor() && !this.isStringTemplate &&
                item.headerTemplate.indexOf('<div>Blazor') === 0) {
                updateBlazorTemplate(this.element.id + i + '_' + 'headerTemplate', 'HeaderTemplate', item);
            }
        }
        this.updateOrientationAttribute();
        this.setCloseButton(this.showCloseButton);
    };
    Tab.prototype.renderContent = function () {
        this.cntEle = select('.' + CLS_CONTENT, this.element);
        var hdrItem = selectAll('.' + CLS_TB_ITEM, this.element);
        if (this.isTemplate) {
            this.cnt = (this.cntEle.children.length > 0) ? this.cntEle.innerHTML : '';
            var contents = this.cntEle.children;
            for (var i = 0; i < hdrItem.length; i++) {
                if (contents.length - 1 >= i) {
                    contents.item(i).className += CLS_ITEM;
                    attributes(contents.item(i), { 'role': 'tabpanel', 'aria-labelledby': CLS_ITEM + '_' + i });
                    contents.item(i).id = CLS_CONTENT + '_' + i;
                }
            }
        }
    };
    Tab.prototype.reRenderItems = function () {
        this.renderContainer();
        if (!isNOU(this.cntEle)) {
            this.touchModule = new Touch(this.cntEle, { swipe: this.swipeHandler.bind(this) });
        }
    };
    Tab.prototype.parseObject = function (items, index) {
        var _this = this;
        var tbCount = selectAll('.' + CLS_TB_ITEM, this.element).length;
        var tItems = [];
        var txtWrapEle;
        var spliceArray = [];
        var i = 0;
        items.forEach(function (item, i) {
            var pos = (isNOU(item.header) || isNOU(item.header.iconPosition)) ? '' : item.header.iconPosition;
            var css = (isNOU(item.header) || isNOU(item.header.iconCss)) ? '' : item.header.iconCss;
            if ((isNOU(item.headerTemplate)) && (isNOU(item.header) || isNOU(item.header.text) ||
                ((item.header.text.length === 0)) && (css === ''))) {
                spliceArray.push(i);
                return;
            }
            var txt = item.headerTemplate || item.header.text;
            _this.lastIndex = ((tbCount === 0) ? i : ((_this.isReplace) ? (index + i) : (_this.lastIndex + 1)));
            var disabled = (item.disabled) ? ' ' + CLS_DISABLE + ' ' + CLS_OVERLAY : '';
            txtWrapEle = _this.createElement('div', { className: CLS_TEXT, attrs: { 'role': 'presentation' } });
            var tHtml = ((txt instanceof Object) ? txt.outerHTML : txt);
            var txtEmpty = (!isNOU(tHtml) && tHtml !== '');
            if (!isNOU(txt.tagName)) {
                txtWrapEle.appendChild(txt);
            }
            else {
                _this.headerTextCompile(txtWrapEle, txt, i);
            }
            var tEle;
            var icon = _this.createElement('span', {
                className: CLS_ICONS + ' ' + CLS_TAB_ICON + ' ' + CLS_ICON + '-' + pos + ' ' + css
            });
            var tCont = _this.createElement('div', { className: CLS_TEXT_WRAP });
            tCont.appendChild(txtWrapEle);
            if ((txt !== '' && txt !== undefined) && css !== '') {
                if ((pos === 'left' || pos === 'top')) {
                    tCont.insertBefore(icon, tCont.firstElementChild);
                }
                else {
                    tCont.appendChild(icon);
                }
                tEle = txtWrapEle;
                _this.isIconAlone = false;
            }
            else {
                tEle = ((css === '') ? txtWrapEle : icon);
                if (tEle === icon) {
                    detach(txtWrapEle);
                    tCont.appendChild(icon);
                    _this.isIconAlone = true;
                }
            }
            var wrapAttrs = (item.disabled) ? {} : { tabIndex: '-1' };
            tCont.appendChild(_this.btnCls.cloneNode(true));
            var wrap = _this.createElement('div', { className: CLS_WRAP, attrs: wrapAttrs });
            wrap.appendChild(tCont);
            if (_this.itemIndexArray === []) {
                _this.itemIndexArray.push(CLS_ITEM + '_' + _this.lastIndex);
            }
            else {
                _this.itemIndexArray.splice((index + i), 0, CLS_ITEM + '_' + _this.lastIndex);
            }
            var attrObj = {
                id: CLS_ITEM + '_' + _this.lastIndex, role: 'tab', 'aria-selected': 'false'
            };
            var tItem = { htmlAttributes: attrObj, template: wrap };
            tItem.cssClass = item.cssClass + ' ' + disabled + ' ' + ((css !== '') ? 'e-i' + pos : '') + ' ' + ((!txtEmpty) ? CLS_ICON : '');
            if (pos === 'top' || pos === 'bottom') {
                _this.element.classList.add('e-vertical-icon');
            }
            tItems.push(tItem);
            i++;
        });
        if (!this.isAdd) {
            spliceArray.forEach(function (spliceItemIndex) {
                _this.items.splice(spliceItemIndex, 1);
            });
        }
        (this.isIconAlone) ? this.element.classList.add(CLS_ICON_TAB) : this.element.classList.remove(CLS_ICON_TAB);
        return tItems;
    };
    Tab.prototype.removeActiveClass = function () {
        var tabHeader = this.getTabHeader();
        if (tabHeader) {
            var tabItems = selectAll('.' + CLS_TB_ITEM + '.' + CLS_ACTIVE, tabHeader);
            [].slice.call(tabItems).forEach(function (node) { return node.classList.remove(CLS_ACTIVE); });
        }
    };
    Tab.prototype.checkPopupOverflow = function (ele) {
        this.tbPop = select('.' + CLS_TB_POP, this.element);
        var popIcon = select('.e-hor-nav', this.element);
        var tbrItems = select('.' + CLS_TB_ITEMS, this.element);
        var lastChild = tbrItems.lastChild;
        var isOverflow = false;
        if (!this.isVertical() && ((this.enableRtl && ((popIcon.offsetLeft + popIcon.offsetWidth) > tbrItems.offsetLeft))
            || (!this.enableRtl && popIcon.offsetLeft < tbrItems.offsetWidth))) {
            isOverflow = true;
        }
        else if (this.isVertical() && (popIcon.offsetTop < lastChild.offsetTop + lastChild.offsetHeight)) {
            isOverflow = true;
        }
        if (isOverflow) {
            ele.classList.add(CLS_TB_POPUP);
            this.tbPop.insertBefore(ele.cloneNode(true), selectAll('.' + CLS_TB_POPUP, this.tbPop)[0]);
            ele.outerHTML = '';
        }
        return true;
    };
    Tab.prototype.popupHandler = function (target) {
        var ripEle = target.querySelector('.e-ripple-element');
        if (!isNOU(ripEle)) {
            ripEle.outerHTML = '';
            target.querySelector('.' + CLS_WRAP).classList.remove('e-ripple');
        }
        this.tbItem = selectAll('.' + CLS_TB_ITEMS + ' .' + CLS_TB_ITEM, this.hdrEle);
        var lastChild = this.tbItem[this.tbItem.length - 1];
        if (this.tbItem.length !== 0) {
            target.classList.remove(CLS_TB_POPUP);
            target.removeAttribute('style');
            this.tbItems.appendChild(target.cloneNode(true));
            this.actEleId = target.id;
            target.outerHTML = '';
            if (this.checkPopupOverflow(lastChild)) {
                var prevEle = this.tbItems.lastChild.previousElementSibling;
                this.checkPopupOverflow(prevEle);
            }
            this.isPopup = true;
        }
        return selectAll('.' + CLS_TB_ITEM, this.tbItems).length - 1;
    };
    Tab.prototype.updateOrientationAttribute = function () {
        attributes(this.element, { 'aria-orientation': (this.isVertical() ? 'vertical' : 'horizontal') });
    };
    Tab.prototype.setCloseButton = function (val) {
        var trg = select('.' + CLS_HEADER, this.element);
        (val === true) ? trg.classList.add(CLS_CLOSE_SHOW) : trg.classList.remove(CLS_CLOSE_SHOW);
        this.tbObj.refreshOverflow();
        this.refreshActElePosition();
    };
    Tab.prototype.prevCtnAnimation = function (prev, current) {
        var animation;
        var checkRTL = this.enableRtl || this.element.classList.contains(CLS_RTL);
        if (this.isPopup || prev <= current) {
            if (this.animation.previous.effect === 'SlideLeftIn') {
                animation = { name: 'SlideLeftOut',
                    duration: this.animation.previous.duration, timingFunction: this.animation.previous.easing };
            }
            else {
                animation = null;
            }
        }
        else {
            if (this.animation.next.effect === 'SlideRightIn') {
                animation = { name: 'SlideRightOut',
                    duration: this.animation.next.duration, timingFunction: this.animation.next.easing };
            }
            else {
                animation = null;
            }
        }
        return animation;
    };
    Tab.prototype.triggerPrevAnimation = function (oldCnt, prevIndex) {
        var _this = this;
        var animateObj = this.prevCtnAnimation(prevIndex, this.selectedItem);
        if (!isNOU(animateObj)) {
            animateObj.begin = function () {
                setStyle(oldCnt, { 'position': 'absolute' });
                oldCnt.classList.add(CLS_PROGRESS);
                oldCnt.classList.add('e-view');
            };
            animateObj.end = function () {
                oldCnt.style.display = 'none';
                oldCnt.classList.remove(CLS_ACTIVE);
                oldCnt.classList.remove(CLS_PROGRESS);
                oldCnt.classList.remove('e-view');
                setStyle(oldCnt, { 'display': '', 'position': '' });
                if (oldCnt.childNodes.length === 0 && !_this.isTemplate) {
                    detach(oldCnt);
                }
            };
            new Animation(animateObj).animate(oldCnt);
        }
        else {
            oldCnt.classList.remove(CLS_ACTIVE);
        }
    };
    Tab.prototype.triggerAnimation = function (id, value) {
        var _this = this;
        var prevIndex = this.prevIndex;
        var itemCollection = [].slice.call(this.element.querySelector('.' + CLS_CONTENT).children);
        var oldCnt;
        itemCollection.forEach(function (item) {
            if (item.id === _this.prevActiveEle) {
                oldCnt = item;
            }
        });
        var prevEle = this.tbItem[prevIndex];
        var no = this.extIndex(this.tbItem[this.selectedItem].id);
        var newCnt = this.getTrgContent(this.cntEle, no);
        if (isNOU(oldCnt) && !isNOU(prevEle)) {
            var idNo = this.extIndex(prevEle.id);
            oldCnt = this.getTrgContent(this.cntEle, idNo);
        }
        this.prevActiveEle = newCnt.id;
        if (this.initRender || value === false || this.animation === {} || isNOU(this.animation)) {
            if (oldCnt && oldCnt !== newCnt) {
                oldCnt.classList.remove(CLS_ACTIVE);
            }
            return;
        }
        var cnt = select('.' + CLS_CONTENT, this.element);
        var animateObj;
        if (this.prevIndex > this.selectedItem && !this.isPopup) {
            var openEff = this.animation.previous.effect;
            animateObj = {
                name: ((openEff === 'None') ? '' : ((openEff !== 'SlideLeftIn') ? openEff : 'SlideLeftIn')),
                duration: this.animation.previous.duration,
                timingFunction: this.animation.previous.easing
            };
        }
        else if (this.isPopup || this.prevIndex < this.selectedItem || this.prevIndex === this.selectedItem) {
            var clsEff = this.animation.next.effect;
            animateObj = {
                name: ((clsEff === 'None') ? '' : ((clsEff !== 'SlideRightIn') ? clsEff : 'SlideRightIn')),
                duration: this.animation.next.duration,
                timingFunction: this.animation.next.easing
            };
        }
        animateObj.progress = function () {
            cnt.classList.add(CLS_PROGRESS);
            _this.setActiveBorder();
        };
        animateObj.end = function () {
            cnt.classList.remove(CLS_PROGRESS);
            newCnt.classList.add(CLS_ACTIVE);
        };
        if (!this.initRender && !isNOU(oldCnt)) {
            this.triggerPrevAnimation(oldCnt, prevIndex);
        }
        this.isPopup = false;
        if (animateObj.name === '') {
            newCnt.classList.add(CLS_ACTIVE);
        }
        else {
            new Animation(animateObj).animate(newCnt);
        }
    };
    Tab.prototype.keyPressed = function (trg) {
        var trgParent = closest(trg, '.' + CLS_HEADER + ' .' + CLS_TB_ITEM);
        var trgIndex = this.getEleIndex(trgParent);
        if (!isNOU(this.popEle) && trg.classList.contains('e-hor-nav')) {
            (this.popEle.classList.contains(CLS_POPUP_OPEN)) ? this.popObj.hide(this.hide) : this.popObj.show(this.show);
        }
        else if (trg.classList.contains('e-scroll-nav')) {
            trg.click();
        }
        else {
            if (!isNOU(trgParent) && trgParent.classList.contains(CLS_ACTIVE) === false) {
                this.select(trgIndex);
                if (!isNOU(this.popEle)) {
                    this.popObj.hide(this.hide);
                }
            }
        }
    };
    Tab.prototype.getTabHeader = function () {
        var headers = [].slice.call(this.element.children).filter(function (e) { return e.classList.contains(CLS_HEADER); });
        if (headers.length > 0) {
            return headers[0];
        }
        else {
            var wrap = [].slice.call(this.element.children).filter(function (e) { return !e.classList.contains(CLS_BLA_TEM); })[0];
            if (!wrap) {
                return undefined;
            }
            return [].slice.call(wrap.children).filter(function (e) { return e.classList.contains(CLS_HEADER); })[0];
        }
    };
    Tab.prototype.getEleIndex = function (item) {
        return Array.prototype.indexOf.call(selectAll('.' + CLS_TB_ITEM, this.getTabHeader()), item);
    };
    Tab.prototype.extIndex = function (id) {
        return id.replace(CLS_ITEM + '_', '');
    };
    Tab.prototype.expTemplateContent = function () {
        var _this = this;
        this.templateEle.forEach(function (eleStr) {
            if (!isNOU(_this.element.querySelector(eleStr))) {
                document.body.appendChild(_this.element.querySelector(eleStr)).style.display = 'none';
            }
        });
    };
    Tab.prototype.templateCompile = function (ele, cnt, index) {
        var tempEle = this.createElement('div');
        this.compileElement(tempEle, cnt, 'content', index);
        if (tempEle.childNodes.length !== 0) {
            ele.appendChild(tempEle);
            var item = this.items[index];
            if (!isNOU(item)) {
                if (item.content && isBlazor() && !this.isStringTemplate && item.content.indexOf('<div>Blazor') === 0) {
                    updateBlazorTemplate(this.element.id + index + '_' + 'content', 'ContentTemplate', item);
                }
            }
        }
    };
    Tab.prototype.compileElement = function (ele, val, prop, index) {
        var templateFn;
        if (typeof val === 'string' && isBlazor() && val.indexOf('<div>Blazor') !== 0) {
            val = val.trim();
            ele.innerHTML = val;
        }
        else {
            templateFn = compile(val);
        }
        var templateFUN;
        if (!isNOU(templateFn)) {
            if (isBlazor() && !this.isStringTemplate && val.indexOf('<div>Blazor') === 0) {
                templateFUN = templateFn({}, this, prop, this.element.id + index + '_' + prop, this.isStringTemplate);
            }
            else {
                templateFUN = templateFn({}, this, prop);
            }
        }
        if (!isNOU(templateFn) && templateFUN.length > 0) {
            [].slice.call(templateFUN).forEach(function (el) {
                ele.appendChild(el);
            });
        }
    };
    Tab.prototype.headerTextCompile = function (element, text, index) {
        this.compileElement(element, text, 'headerTemplate', index);
    };
    Tab.prototype.getContent = function (ele, cnt, callType, index) {
        var eleStr;
        if (typeof cnt === 'string' || isNOU(cnt.innerHTML)) {
            if (cnt[0] === '.' || cnt[0] === '#') {
                if (document.querySelectorAll(cnt).length) {
                    var eleVal = document.querySelector(cnt);
                    eleStr = eleVal.outerHTML.trim();
                    if (callType === 'clone') {
                        ele.appendChild(eleVal.cloneNode(true));
                    }
                    else {
                        ele.appendChild(eleVal);
                        eleVal.style.display = '';
                    }
                }
                else {
                    this.templateCompile(ele, cnt, index);
                }
            }
            else {
                this.templateCompile(ele, cnt, index);
            }
        }
        else {
            ele.appendChild(cnt);
        }
        if (!isNOU(eleStr)) {
            if (this.templateEle.indexOf(cnt.toString()) === -1) {
                this.templateEle.push(cnt.toString());
            }
        }
    };
    Tab.prototype.getTrgContent = function (cntEle, no) {
        var ele;
        if (this.element.classList.contains(CLS_NEST)) {
            ele = select('.' + CLS_NEST + '> .' + CLS_CONTENT + ' > #' + CLS_CONTENT + '_' + no, this.element);
        }
        else {
            ele = this.findEle(cntEle.children, CLS_CONTENT + '_' + no);
        }
        return ele;
    };
    Tab.prototype.findEle = function (items, key) {
        var ele;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === key) {
                ele = items[i];
                break;
            }
        }
        return ele;
    };
    Tab.prototype.isVertical = function () {
        var isVertical = (this.headerPlacement === 'Left' || this.headerPlacement === 'Right') ? true : false;
        this.scrCntClass = (isVertical) ? CLS_VSCRCNT : CLS_HSCRCNT;
        return isVertical;
    };
    Tab.prototype.addVerticalClass = function () {
        if (this.isVertical()) {
            var tbPos = (this.headerPlacement === 'Left') ? CLS_VLEFT : CLS_VRIGHT;
            addClass([this.hdrEle], [CLS_VERTICAL, tbPos]);
            this.element.classList.add(CLS_VTAB);
        }
        if (this.headerPlacement === 'Bottom') {
            this.hdrEle.classList.add(CLS_HBOTTOM);
        }
    };
    Tab.prototype.updatePopAnimationConfig = function () {
        this.show = { name: (this.isVertical() ? 'FadeIn' : 'SlideDown'), duration: 100 };
        this.hide = { name: (this.isVertical() ? 'FadeOut' : 'SlideUp'), duration: 100 };
    };
    Tab.prototype.changeOrientation = function (place) {
        this.setOrientation(place, this.hdrEle);
        var isVertical = this.hdrEle.classList.contains(CLS_VERTICAL) ? true : false;
        removeClass([this.element], [CLS_VTAB]);
        removeClass([this.hdrEle], [CLS_VERTICAL, CLS_VLEFT, CLS_VRIGHT]);
        if (isVertical !== this.isVertical()) {
            this.tbObj.setProperties({ height: (this.isVertical() ? '100%' : 'auto'), width: (this.isVertical() ? 'auto' : '100%') }, true);
            this.tbObj.changeOrientation();
            this.updatePopAnimationConfig();
        }
        this.addVerticalClass();
        this.updateOrientationAttribute();
        this.select(this.selectedItem);
    };
    Tab.prototype.setOrientation = function (place, ele) {
        var headerPos = Array.prototype.indexOf.call(this.element.children, ele);
        var contentPos = Array.prototype.indexOf.call(this.element.children, this.element.querySelector('.' + CLS_CONTENT));
        if (place === 'Bottom' && (contentPos > headerPos)) {
            this.element.appendChild(ele);
        }
        else {
            this.element.insertBefore(ele, select('.' + CLS_CONTENT, this.element));
        }
    };
    Tab.prototype.setCssClass = function (ele, cls, val) {
        if (cls === '') {
            return;
        }
        var list = cls.split(' ');
        for (var i = 0; i < list.length; i++) {
            if (val) {
                ele.classList.add(list[i]);
            }
            else {
                ele.classList.remove(list[i]);
            }
        }
    };
    Tab.prototype.setContentHeight = function (val) {
        if (this.element.classList.contains(CLS_FILL)) {
            removeClass([this.element], [CLS_FILL]);
        }
        if (isNOU(this.cntEle)) {
            return;
        }
        var hdrEle = this.getTabHeader();
        if (this.heightAdjustMode === 'None') {
            if (this.height === 'auto') {
                return;
            }
            else {
                if (!this.isVertical()) {
                    setStyle(this.cntEle, { 'height': (this.element.offsetHeight - hdrEle.offsetHeight) + 'px' });
                }
            }
        }
        else if (this.heightAdjustMode === 'Fill') {
            addClass([this.element], [CLS_FILL]);
            setStyle(this.element, { 'height': '100%' });
            setStyle(this.cntEle, { 'height': '100%' });
        }
        else if (this.heightAdjustMode === 'Auto') {
            var cnt = selectAll('.' + CLS_CONTENT + ' > .' + CLS_ITEM, this.element);
            if (this.isTemplate === true) {
                for (var i = 0; i < cnt.length; i++) {
                    cnt[i].setAttribute('style', 'display:block; visibility: visible');
                    this.maxHeight = Math.max(this.maxHeight, this.getHeight(cnt[i]));
                    cnt[i].style.removeProperty('display');
                    cnt[i].style.removeProperty('visibility');
                }
            }
            else {
                this.cntEle = select('.' + CLS_CONTENT, this.element);
                if (val === true) {
                    this.cntEle.appendChild(this.createElement('div', {
                        id: (CLS_CONTENT + '_' + 0), className: CLS_ITEM + ' ' + CLS_ACTIVE,
                        attrs: { 'role': 'tabpanel', 'aria-labelledby': CLS_ITEM + '_' + 0 }
                    }));
                }
                var ele = this.cntEle.children.item(0);
                for (var i = 0; i < this.items.length; i++) {
                    this.getContent(ele, this.items[i].content, 'clone', i);
                    this.maxHeight = Math.max(this.maxHeight, this.getHeight(ele));
                    while (ele.firstChild) {
                        ele.removeChild(ele.firstChild);
                    }
                }
                this.clearTemplate(['content']);
                this.templateEle = [];
                this.getContent(ele, this.items[0].content, 'render', 0);
                ele.classList.remove(CLS_ACTIVE);
            }
            setStyle(this.cntEle, { 'height': this.maxHeight + 'px' });
        }
        else {
            setStyle(this.cntEle, { 'height': 'auto' });
        }
    };
    Tab.prototype.getHeight = function (ele) {
        var cs = window.getComputedStyle(ele);
        return ele.offsetHeight + parseFloat(cs.getPropertyValue('padding-top')) + parseFloat(cs.getPropertyValue('padding-bottom')) +
            parseFloat(cs.getPropertyValue('margin-top')) + parseFloat(cs.getPropertyValue('margin-bottom'));
    };
    Tab.prototype.setActiveBorder = function () {
        var bar;
        var scrollCnt;
        var trgHdrEle = this.getTabHeader();
        var trg = select('.' + CLS_TB_ITEM + '.' + CLS_ACTIVE, trgHdrEle);
        if (trg === null) {
            return;
        }
        var root = closest(trg, '.' + CLS_TAB);
        if (this.element !== root) {
            return;
        }
        this.tbItems = select('.' + CLS_TB_ITEMS, trgHdrEle);
        bar = select('.' + CLS_INDICATOR, trgHdrEle);
        scrollCnt = select('.' + CLS_TB_ITEMS + ' .' + this.scrCntClass, trgHdrEle);
        if (this.isVertical()) {
            setStyle(bar, { 'left': '', 'right': '' });
            var tbHeight = (isNOU(scrollCnt)) ? this.tbItems.offsetHeight : scrollCnt.offsetHeight;
            if (tbHeight !== 0) {
                setStyle(bar, { 'top': trg.offsetTop + 'px', 'height': trg.offsetHeight + 'px' });
            }
            else {
                setStyle(bar, { 'top': 0, 'height': 0 });
            }
        }
        else {
            setStyle(bar, { 'top': '', 'height': '' });
            var tbWidth = (isNOU(scrollCnt)) ? this.tbItems.offsetWidth : scrollCnt.offsetWidth;
            if (tbWidth !== 0) {
                setStyle(bar, { 'left': trg.offsetLeft + 'px', 'right': tbWidth - (trg.offsetLeft + trg.offsetWidth) + 'px' });
            }
            else {
                setStyle(bar, { 'left': 'auto', 'right': 'auto' });
            }
        }
        if (!isNOU(this.bdrLine)) {
            this.bdrLine.classList.remove(CLS_HIDDEN);
        }
    };
    Tab.prototype.setActive = function (value) {
        this.tbItem = selectAll('.' + CLS_TB_ITEM, this.getTabHeader());
        var trg = this.tbItem[value];
        if (value >= 0) {
            this.setProperties({ selectedItem: value }, true);
        }
        if (value < 0 || isNaN(value) || this.tbItem.length === 0) {
            return;
        }
        if (trg.classList.contains(CLS_ACTIVE)) {
            this.setActiveBorder();
            return;
        }
        if (!this.isTemplate) {
            var prev = this.tbItem[this.prevIndex];
            if (!isNOU(prev)) {
                prev.removeAttribute('aria-controls');
            }
            attributes(trg, { 'aria-controls': CLS_CONTENT + '_' + value });
        }
        var id = trg.id;
        this.removeActiveClass();
        trg.classList.add(CLS_ACTIVE);
        trg.setAttribute('aria-selected', 'true');
        var no = Number(this.extIndex(id));
        if (isNOU(this.prevActiveEle)) {
            this.prevActiveEle = CLS_CONTENT + '_' + no;
        }
        attributes(this.element, { 'aria-activedescendant': id });
        if (this.isTemplate) {
            if (select('.' + CLS_CONTENT, this.element).children.length > 0) {
                var trg_1 = this.findEle(select('.' + CLS_CONTENT, this.element).children, CLS_CONTENT + '_' + no);
                if (!isNOU(trg_1)) {
                    trg_1.classList.add(CLS_ACTIVE);
                }
                this.triggerAnimation(id, this.enableAnimation);
            }
        }
        else {
            this.cntEle = select('.' + CLS_TAB + ' > .' + CLS_CONTENT, this.element);
            var item = this.getTrgContent(this.cntEle, this.extIndex(id));
            if (isNOU(item)) {
                this.cntEle.appendChild(this.createElement('div', {
                    id: CLS_CONTENT + '_' + this.extIndex(id), className: CLS_ITEM + ' ' + CLS_ACTIVE,
                    attrs: { role: 'tabpanel', 'aria-labelledby': CLS_ITEM + '_' + this.extIndex(id) }
                }));
                var eleTrg = this.getTrgContent(this.cntEle, this.extIndex(id));
                var itemIndex = Array.prototype.indexOf.call(this.itemIndexArray, trg.id);
                this.getContent(eleTrg, this.items[itemIndex].content, 'render', itemIndex);
            }
            else {
                item.classList.add(CLS_ACTIVE);
            }
            this.triggerAnimation(id, this.enableAnimation);
        }
        this.setActiveBorder();
        var curActItem = select('.' + CLS_HEADER + ' #' + id, this.element);
        this.refreshItemVisibility(curActItem);
        if (!this.initRender) {
            curActItem.firstChild.focus();
        }
        var eventArg = {
            previousItem: this.prevItem,
            previousIndex: this.prevIndex,
            selectedItem: trg,
            selectedIndex: value,
            selectedContent: select('#' + CLS_CONTENT + '_' + this.selectingID, this.content),
            isSwiped: this.isSwipeed
        };
        if (!this.initRender || this.selectedItem !== 0) {
            this.trigger('selected', eventArg);
        }
    };
    Tab.prototype.setItems = function (items) {
        this.isReplace = true;
        this.tbItems = select('.' + CLS_TB_ITEMS, this.getTabHeader());
        this.tbObj.items = this.parseObject(items, 0);
        this.tbObj.dataBind();
        this.isReplace = false;
    };
    Tab.prototype.setRTL = function (value) {
        this.tbObj.enableRtl = value;
        this.tbObj.dataBind();
        this.setCssClass(this.element, CLS_RTL, value);
        this.refreshActiveBorder();
    };
    Tab.prototype.refreshActiveBorder = function () {
        if (!isNOU(this.bdrLine)) {
            this.bdrLine.classList.add(CLS_HIDDEN);
        }
        this.setActiveBorder();
    };
    Tab.prototype.showPopup = function (config) {
        var tbPop = select('.e-popup.e-toolbar-pop', this.hdrEle);
        if (tbPop.classList.contains('e-popup-close')) {
            var tbPopObj = (tbPop && tbPop.ej2_instances[0]);
            tbPopObj.position.X = (this.headerPlacement === 'Left') ? 'left' : 'right';
            tbPopObj.dataBind();
            tbPopObj.show(config);
        }
    };
    Tab.prototype.wireEvents = function () {
        window.addEventListener('resize', this.resizeContext);
        EventHandler.add(this.element, 'mouseover', this.hoverHandler, this);
        EventHandler.add(this.element, 'keydown', this.spaceKeyDown, this);
        if (!isNOU(this.cntEle)) {
            this.touchModule = new Touch(this.cntEle, { swipe: this.swipeHandler.bind(this) });
        }
        this.keyModule = new KeyboardEvents(this.element, { keyAction: this.keyHandler.bind(this), keyConfigs: this.keyConfigs });
        this.tabKeyModule = new KeyboardEvents(this.element, {
            keyAction: this.keyHandler.bind(this),
            keyConfigs: { openPopup: 'shift+f10', tab: 'tab', shiftTab: 'shift+tab' },
            eventName: 'keydown'
        });
    };
    Tab.prototype.unWireEvents = function () {
        this.keyModule.destroy();
        this.tabKeyModule.destroy();
        if (!isNOU(this.cntEle)) {
            this.touchModule.destroy();
        }
        window.removeEventListener('resize', this.resizeContext);
        EventHandler.remove(this.element, 'mouseover', this.hoverHandler);
        EventHandler.remove(this.element, 'keydown', this.spaceKeyDown);
        this.element.classList.remove(CLS_RTL);
        this.element.classList.remove(CLS_FOCUS);
    };
    Tab.prototype.clickHandler = function (args) {
        this.element.classList.remove(CLS_FOCUS);
        var trg = args.originalEvent.target;
        var trgParent = closest(trg, '.' + CLS_TB_ITEM);
        var trgIndex = this.getEleIndex(trgParent);
        if (trg.classList.contains(CLS_ICON_CLOSE)) {
            this.removeTab(trgIndex);
        }
        else if (this.isVertical() && closest(trg, '.' + CLS_HOR_NAV)) {
            this.showPopup(this.show);
        }
        else {
            this.isPopup = false;
            if (!isNOU(trgParent) && trgIndex !== this.selectedItem) {
                this.select(trgIndex);
            }
        }
    };
    Tab.prototype.swipeHandler = function (e) {
        if (e.velocity < 3 && isNOU(e.originalEvent.changedTouches)) {
            return;
        }
        this.isSwipeed = true;
        if (e.swipeDirection === 'Right' && this.selectedItem !== 0) {
            for (var k = this.selectedItem - 1; k >= 0; k--) {
                if (!this.tbItem[k].classList.contains(CLS_HIDDEN)) {
                    this.select(k);
                    break;
                }
            }
        }
        else if (e.swipeDirection === 'Left' && (this.selectedItem !== selectAll('.' + CLS_TB_ITEM, this.element).length - 1)) {
            for (var i = this.selectedItem + 1; i < this.tbItem.length; i++) {
                if (!this.tbItem[i].classList.contains(CLS_HIDDEN)) {
                    this.select(i);
                    break;
                }
            }
        }
        this.isSwipeed = false;
    };
    Tab.prototype.spaceKeyDown = function (e) {
        if ((e.keyCode === 32 && e.which === 32) || (e.keyCode === 35 && e.which === 35)) {
            var clstHead = closest(e.target, '.' + CLS_HEADER);
            if (!isNOU(clstHead)) {
                e.preventDefault();
            }
        }
    };
    Tab.prototype.keyHandler = function (e) {
        if (this.element.classList.contains(CLS_DISABLE)) {
            return;
        }
        this.element.classList.add(CLS_FOCUS);
        var trg = e.target;
        var tabHeader = this.getTabHeader();
        var actEle = select('.' + CLS_ACTIVE, tabHeader);
        this.popEle = select('.' + CLS_TB_POP, tabHeader);
        if (!isNOU(this.popEle)) {
            this.popObj = this.popEle.ej2_instances[0];
        }
        switch (e.action) {
            case 'space':
            case 'enter':
                if (trg.parentElement.classList.contains(CLS_DISABLE)) {
                    return;
                }
                if (e.action === 'enter' && trg.classList.contains('e-hor-nav')) {
                    this.showPopup(this.show);
                    break;
                }
                this.keyPressed(trg);
                break;
            case 'tab':
            case 'shiftTab':
                if (trg.classList.contains(CLS_WRAP)
                    && closest(trg, '.' + CLS_TB_ITEM).classList.contains(CLS_ACTIVE) === false) {
                    trg.setAttribute('tabindex', '-1');
                }
                if (this.popObj && isVisible(this.popObj.element)) {
                    this.popObj.hide(this.hide);
                }
                actEle.children.item(0).setAttribute('tabindex', '0');
                break;
            case 'moveLeft':
            case 'moveRight':
                var item = closest(document.activeElement, '.' + CLS_TB_ITEM);
                if (!isNOU(item)) {
                    this.refreshItemVisibility(item);
                }
                break;
            case 'openPopup':
                e.preventDefault();
                if (!isNOU(this.popEle) && this.popEle.classList.contains(CLS_POPUP_CLOSE)) {
                    this.popObj.show(this.show);
                }
                break;
            case 'delete':
                var trgParent = closest(trg, '.' + CLS_TB_ITEM);
                if (this.showCloseButton === true && !isNOU(trgParent)) {
                    var nxtSib = trgParent.nextSibling;
                    if (!isNOU(nxtSib) && nxtSib.classList.contains(CLS_TB_ITEM)) {
                        nxtSib.firstChild.focus();
                    }
                    this.removeTab(this.getEleIndex(trgParent));
                }
                this.setActiveBorder();
                break;
        }
    };
    Tab.prototype.refreshActElePosition = function () {
        var activeEle = select('.' + CLS_TB_ITEM + '.' + CLS_TB_POPUP + '.' + CLS_ACTIVE, this.element);
        if (!isNOU(activeEle)) {
            this.select(this.getEleIndex(activeEle));
        }
        this.refreshActiveBorder();
    };
    Tab.prototype.refreshItemVisibility = function (target) {
        var scrCnt = select('.' + this.scrCntClass, this.tbItems);
        if (!this.isVertical() && !isNOU(scrCnt)) {
            var scrBar = select('.e-hscroll-bar', this.tbItems);
            var scrStart = scrBar.scrollLeft;
            var scrEnd = scrStart + scrBar.offsetWidth;
            var eleStart = target.offsetLeft;
            var eleWidth = target.offsetWidth;
            var eleEnd = target.offsetLeft + target.offsetWidth;
            if ((scrStart < eleStart) && (scrEnd < eleEnd)) {
                var eleViewRange = scrEnd - eleStart;
                scrBar.scrollLeft = scrStart + (eleWidth - eleViewRange);
            }
            else {
                if ((scrStart > eleStart) && (scrEnd > eleEnd)) {
                    var eleViewRange = eleEnd - scrStart;
                    scrBar.scrollLeft = scrStart - (eleWidth - eleViewRange);
                }
            }
        }
        else {
            return;
        }
    };
    Tab.prototype.hoverHandler = function (e) {
        var trg = e.target;
        if (!isNOU(trg.classList) && trg.classList.contains(CLS_ICON_CLOSE)) {
            trg.setAttribute('title', new L10n('tab', { closeButtonTitle: this.title }, this.locale).getConstant('closeButtonTitle'));
        }
    };
    Tab.prototype.evalOnPropertyChangeItems = function (newProp, oldProp) {
        if (!(newProp.items instanceof Array && oldProp.items instanceof Array)) {
            var changedProp = Object.keys(newProp.items);
            for (var i = 0; i < changedProp.length; i++) {
                var index = parseInt(Object.keys(newProp.items)[i], 10);
                var property = Object.keys(newProp.items[index])[0];
                var oldVal = Object(oldProp.items[index])[property];
                var newVal = Object(newProp.items[index])[property];
                var hdrItem = select('.' + CLS_TB_ITEMS + ' #' + CLS_ITEM + '_' + index, this.element);
                var cntItem = select('.' + CLS_CONTENT + ' #' + CLS_CONTENT + '_' + index, this.element);
                if (property === 'header' || property === 'headerTemplate') {
                    var icon = (isNOU(this.items[index].header) ||
                        isNOU(this.items[index].header.iconCss)) ? '' : this.items[index].header.iconCss;
                    var textVal = this.items[index].headerTemplate || this.items[index].header.text;
                    if ((textVal === '') && (icon === '')) {
                        this.removeTab(index);
                    }
                    else {
                        var arr = [];
                        arr.push(this.items[index]);
                        this.items.splice(index, 1);
                        this.itemIndexArray.splice(index, 1);
                        this.tbObj.items.splice(index, 1);
                        var isHiddenEle = hdrItem.classList.contains(CLS_HIDDEN);
                        detach(hdrItem);
                        this.isReplace = true;
                        this.addTab(arr, index);
                        if (isHiddenEle) {
                            this.hideTab(index);
                        }
                        this.isReplace = false;
                    }
                }
                if (property === 'content' && !isNOU(cntItem)) {
                    var strVal = typeof newVal === 'string' || isNOU(newVal.innerHTML);
                    if (strVal && (newVal[0] === '.' || newVal[0] === '#') && newVal.length) {
                        var eleVal = document.querySelector(newVal);
                        cntItem.appendChild(eleVal);
                        eleVal.style.display = '';
                    }
                    else if (newVal === '' && oldVal[0] === '#') {
                        document.body.appendChild(this.element.querySelector(oldVal)).style.display = 'none';
                        cntItem.innerHTML = newVal;
                    }
                    else {
                        cntItem.innerHTML = newVal;
                    }
                }
                if (property === 'cssClass') {
                    if (!isNOU(hdrItem)) {
                        hdrItem.classList.remove(oldVal);
                        hdrItem.classList.add(newVal);
                    }
                    if (!isNOU(cntItem)) {
                        cntItem.classList.remove(oldVal);
                        cntItem.classList.add(newVal);
                    }
                }
                if (property === 'disabled') {
                    this.enableTab(index, ((newVal === true) ? false : true));
                }
            }
        }
        else {
            this.lastIndex = 0;
            if (isNOU(this.tbObj)) {
                this.reRenderItems();
            }
            else {
                var items = newProp.items;
                for (var i = 0; i < items.length; i++) {
                    this.resetBlazorTemplates(items[i], i);
                }
                this.setItems(newProp.items);
                if (this.templateEle.length > 0) {
                    this.expTemplateContent();
                }
                this.templateEle = [];
                var selectElement = select('.' + CLS_TAB + ' > .' + CLS_CONTENT, this.element);
                while (selectElement.firstElementChild) {
                    detach(selectElement.firstElementChild);
                }
                this.select(this.selectedItem);
            }
        }
    };
    Tab.prototype.resetBlazorTemplates = function (item, index) {
        if (!isBlazor()) {
            return;
        }
        if (item.headerTemplate && !this.isStringTemplate && (item.headerTemplate).indexOf('<div>Blazor') === 0) {
            resetBlazorTemplate(this.element.id + index + '_' + 'headerTemplate', 'HeaderTemplate');
        }
        if (item.content && !this.isStringTemplate && item.content.indexOf('<div>Blazor') === 0) {
            resetBlazorTemplate(this.element.id + index + '_' + 'content', 'ContentTemplate');
        }
    };
    /**
     * Enables or disables the specified Tab item. On passing value as `false`, the item will be disabled.
     * @param  {number} index - Index value of target Tab item.
     * @param  {boolean} value - Boolean value that determines whether the command should be enabled or disabled.
     * By default, isEnable is true.
     * @returns void.
     */
    Tab.prototype.enableTab = function (index, value) {
        var tbItems = selectAll('.' + CLS_TB_ITEM, this.element)[index];
        if (isNOU(tbItems)) {
            return;
        }
        if (value === true) {
            tbItems.classList.remove(CLS_DISABLE, CLS_OVERLAY);
            tbItems.firstChild.setAttribute('tabindex', '-1');
        }
        else {
            tbItems.classList.add(CLS_DISABLE, CLS_OVERLAY);
            tbItems.firstChild.removeAttribute('tabindex');
            if (tbItems.classList.contains(CLS_ACTIVE)) {
                this.select(index + 1);
            }
        }
        if (!isNOU(this.items[index])) {
            this.items[index].disabled = !value;
            this.dataBind();
        }
        tbItems.setAttribute('aria-disabled', (value === true) ? 'false' : 'true');
    };
    /**
     * Adds new items to the Tab that accepts an array as Tab items.
     * @param  {TabItemsModel[]} items - An array of item that is added to the Tab.
     * @param  {number} index - Number value that determines where the items to be added. By default, index is 0.
     * @returns void.
     */
    Tab.prototype.addTab = function (items, index) {
        var _this = this;
        var addArgs = { addedItems: items, cancel: false };
        if (!this.isReplace) {
            this.trigger('adding', addArgs, function (tabAddingArgs) {
                if (!tabAddingArgs.cancel) {
                    _this.addingTabContent(items, index);
                }
            });
        }
        else {
            this.addingTabContent(items, index);
        }
    };
    Tab.prototype.addingTabContent = function (items, index) {
        var _this = this;
        var lastEleIndex = 0;
        this.hdrEle = select('.' + CLS_HEADER, this.element);
        if (isNOU(this.hdrEle)) {
            this.items = items;
            this.reRenderItems();
        }
        else {
            var itemsCount = selectAll('.' + CLS_TB_ITEM, this.element).length;
            if (itemsCount !== 0) {
                lastEleIndex = this.lastIndex + 1;
            }
            if (isNOU(index)) {
                index = itemsCount - 1;
            }
            if (itemsCount < index || index < 0 || isNaN(index)) {
                return;
            }
            if (itemsCount === 0 && !isNOU(this.hdrEle)) {
                this.hdrEle.style.display = '';
            }
            if (!isNOU(this.bdrLine)) {
                this.bdrLine.classList.add(CLS_HIDDEN);
            }
            this.tbItems = select('.' + CLS_TB_ITEMS, this.getTabHeader());
            this.isAdd = true;
            var tabItems = this.parseObject(items, index);
            this.isAdd = false;
            var i_1 = 0;
            var textValue_1;
            items.forEach(function (item, place) {
                textValue_1 = item.headerTemplate || item.header.text;
                if (!(isNOU(item.headerTemplate || item.header) ||
                    isNOU(textValue_1) || (textValue_1.length === 0) && isNOU(item.header.iconCss))) {
                    _this.items.splice((index + i_1), 0, item);
                    i_1++;
                }
                if (_this.isTemplate && !isNOU(item.header) && !isNOU(item.header.text)) {
                    var no = lastEleIndex + place;
                    var ele = _this.createElement('div', {
                        id: CLS_CONTENT + '_' + no, className: CLS_ITEM, attrs: { role: 'tabpanel', 'aria-labelledby': CLS_ITEM + '_' + no }
                    });
                    _this.cntEle.insertBefore(ele, _this.cntEle.children[(index + place)]);
                    var eleTrg = _this.getTrgContent(_this.cntEle, no.toString());
                    _this.getContent(eleTrg, item.content, 'render', index);
                }
            });
            this.tbObj.addItems(tabItems, index);
            if (!this.isReplace) {
                this.trigger('added', { addedItems: items });
            }
            if (this.selectedItem === index) {
                this.select(index);
            }
            else {
                this.setActiveBorder();
            }
        }
    };
    /**
     * Removes the items in the Tab from the specified index.
     * @param  {number} index - Index of target item that is going to be removed.
     * @returns void.
     */
    Tab.prototype.removeTab = function (index) {
        var _this = this;
        var trg = selectAll('.' + CLS_TB_ITEM, this.element)[index];
        if (isNOU(trg)) {
            return;
        }
        var removeArgs = { removedItem: trg, removedIndex: index, cancel: false };
        this.trigger('removing', removeArgs, function (tabRemovingArgs) {
            if (!tabRemovingArgs.cancel) {
                _this.resetBlazorTemplates(_this.items[index], index);
                _this.tbObj.removeItems(index);
                _this.items.splice(index, 1);
                _this.itemIndexArray.splice(index, 1);
                _this.refreshActiveBorder();
                var cntTrg = select('#' + CLS_CONTENT + '_' + _this.extIndex(trg.id), select('.' + CLS_CONTENT, _this.element));
                if (!isNOU(cntTrg)) {
                    detach(cntTrg);
                }
                _this.trigger('removed', tabRemovingArgs);
                if (trg.classList.contains(CLS_ACTIVE)) {
                    // tslint:disable-next-line:max-line-length
                    index = (index > selectAll('.' + CLS_TB_ITEM + ':not(.' + CLS_TB_POPUP + ')', _this.element).length - 1) ? index - 1 : index;
                    _this.enableAnimation = false;
                    _this.selectedItem = index;
                    _this.select(index);
                }
                if (selectAll('.' + CLS_TB_ITEM, _this.element).length === 0) {
                    _this.hdrEle.style.display = 'none';
                }
                _this.enableAnimation = true;
            }
        });
    };
    /**
     * Shows or hides the Tab that is in the specified index.
     * @param  {number} index - Index value of target item.
     * @param  {boolean} value - Based on this Boolean value, item will be hide (false) or show (true). By default, value is true.
     * @returns void.
     */
    Tab.prototype.hideTab = function (index, value) {
        var items;
        var item = selectAll('.' + CLS_TB_ITEM, this.element)[index];
        if (isNOU(item)) {
            return;
        }
        if (isNOU(value)) {
            value = true;
        }
        this.bdrLine.classList.add(CLS_HIDDEN);
        if (value === true) {
            item.classList.add(CLS_HIDDEN);
            items = selectAll('.' + CLS_TB_ITEM + ':not(.' + CLS_HIDDEN + ')', this.tbItems);
            if (items.length !== 0 && item.classList.contains(CLS_ACTIVE)) {
                if (index !== 0) {
                    for (var i = index - 1; i >= 0; i--) {
                        if (!this.tbItem[i].classList.contains(CLS_HIDDEN)) {
                            this.select(i);
                            break;
                        }
                        else if (i === 0) {
                            for (var k = index + 1; k < this.tbItem.length; k++) {
                                if (!this.tbItem[k].classList.contains(CLS_HIDDEN)) {
                                    this.select(k);
                                    break;
                                }
                            }
                        }
                    }
                }
                else {
                    for (var k = index + 1; k < this.tbItem.length; k++) {
                        if (!this.tbItem[k].classList.contains(CLS_HIDDEN)) {
                            this.select(k);
                            break;
                        }
                    }
                }
            }
            else if (items.length === 0) {
                this.element.classList.add(CLS_HIDDEN);
            }
        }
        else {
            this.element.classList.remove(CLS_HIDDEN);
            items = selectAll('.' + CLS_TB_ITEM + ':not(.' + CLS_HIDDEN + ')', this.tbItems);
            if (items.length === 0) {
                this.select(index);
            }
            item.classList.remove(CLS_HIDDEN);
        }
        this.setActiveBorder();
        item.setAttribute('aria-hidden', '' + value);
    };
    /**
     * Specifies the index or HTMLElement to select an item from the Tab.
     * @param  {number | HTMLElement} args - Index or DOM element is used for selecting an item from the Tab.
     * @returns void.
     */
    Tab.prototype.select = function (args) {
        var _this = this;
        var tabHeader = this.getTabHeader();
        this.tbItems = select('.' + CLS_TB_ITEMS, tabHeader);
        this.tbItem = selectAll('.' + CLS_TB_ITEM, tabHeader);
        this.content = select('.' + CLS_CONTENT, this.element);
        this.prevItem = this.tbItem[this.prevIndex];
        if (isNOU(this.selectedItem) || (this.selectedItem < 0) || (this.tbItem.length <= this.selectedItem) || isNaN(this.selectedItem)) {
            this.selectedItem = 0;
        }
        else {
            this.selectedID = this.extIndex(this.tbItem[this.selectedItem].id);
        }
        var trg = this.tbItem[args];
        if (isNOU(trg)) {
            this.selectedID = '0';
        }
        else {
            this.selectingID = this.extIndex(trg.id);
        }
        if (!isNOU(this.prevItem) && !this.prevItem.classList.contains(CLS_DISABLE)) {
            this.prevItem.children.item(0).setAttribute('tabindex', '-1');
        }
        var eventArg = {
            previousItem: this.prevItem,
            previousIndex: this.prevIndex,
            selectedItem: this.tbItem[this.selectedItem],
            selectedIndex: this.selectedItem,
            selectedContent: !isNOU(this.content) ? select('#' + CLS_CONTENT + '_' + this.selectedID, this.content) : null,
            selectingItem: trg,
            selectingIndex: args,
            selectingContent: !isNOU(this.content) ? select('#' + CLS_CONTENT + '_' + this.selectingID, this.content) : null,
            isSwiped: this.isSwipeed,
            cancel: false
        };
        if (!this.initRender || this.selectedItem !== 0) {
            this.trigger('selecting', eventArg, function (selectArgs) {
                if (!selectArgs.cancel) {
                    _this.selectingContent(args);
                }
            });
        }
        else {
            this.selectingContent(args);
        }
    };
    Tab.prototype.selectingContent = function (args) {
        if (typeof args === 'number') {
            if (!isNOU(this.tbItem[args]) && this.tbItem[args].classList.contains(CLS_DISABLE)) {
                for (var i = args + 1; i < this.items.length; i++) {
                    if (this.items[i].disabled === false) {
                        args = i;
                        break;
                    }
                    else {
                        args = 0;
                    }
                }
            }
            if (this.tbItem.length > args && args >= 0 && !isNaN(args)) {
                this.prevIndex = this.selectedItem;
                if (this.tbItem[args].classList.contains(CLS_TB_POPUP)) {
                    this.setActive(this.popupHandler(this.tbItem[args]));
                }
                else {
                    this.setActive(args);
                }
            }
            else {
                this.setActive(0);
            }
        }
        else if (args instanceof (HTMLElement)) {
            this.setActive(this.getEleIndex(args));
        }
    };
    /**
     * Specifies the value to disable/enable the Tab component.
     * When set to `true`, the component will be disabled.
     * @param  {boolean} value - Based on this Boolean value, Tab will be enabled (false) or disabled (true).
     * @returns void.
     */
    Tab.prototype.disable = function (value) {
        this.setCssClass(this.element, CLS_DISABLE, value);
        this.element.setAttribute('aria-disabled', '' + value);
    };
    /**
     * Get the properties to be maintained in the persisted state.
     * @returns string
     */
    Tab.prototype.getPersistData = function () {
        return this.addOnPersist(['selectedItem', 'actEleId']);
    };
    /**
     * Returns the current module name.
     * @returns string
     * @private
     */
    Tab.prototype.getModuleName = function () {
        return 'tab';
    };
    /**
     * Gets called when the model property changes.The data that describes the old and new values of the property that changed.
     * @param  {TabModel} newProp
     * @param  {TabModel} oldProp
     * @returns void
     * @private
     */
    Tab.prototype.onPropertyChanged = function (newProp, oldProp) {
        for (var _i = 0, _a = Object.keys(newProp); _i < _a.length; _i++) {
            var prop = _a[_i];
            switch (prop) {
                case 'width':
                    setStyle(this.element, { width: formatUnit(newProp.width) });
                    break;
                case 'height':
                    setStyle(this.element, { height: formatUnit(newProp.height) });
                    this.setContentHeight(false);
                    break;
                case 'cssClass':
                    if (oldProp.cssClass !== '') {
                        this.setCssClass(this.element, oldProp.cssClass, false);
                        this.setCssClass(this.element, newProp.cssClass, true);
                    }
                    else {
                        this.setCssClass(this.element, newProp.cssClass, true);
                    }
                    break;
                case 'items':
                    this.evalOnPropertyChangeItems(newProp, oldProp);
                    break;
                case 'showCloseButton':
                    this.setCloseButton(newProp.showCloseButton);
                    break;
                case 'selectedItem':
                    this.selectedItem = oldProp.selectedItem;
                    this.select(newProp.selectedItem);
                    break;
                case 'headerPlacement':
                    this.changeOrientation(newProp.headerPlacement);
                    break;
                case 'enableRtl':
                    this.setRTL(newProp.enableRtl);
                    break;
                case 'overflowMode':
                    this.tbObj.overflowMode = newProp.overflowMode;
                    this.tbObj.dataBind();
                    this.refreshActElePosition();
                    break;
                case 'heightAdjustMode':
                    this.setContentHeight(false);
                    this.select(this.selectedItem);
                    break;
                case 'scrollStep':
                    if (this.tbObj) {
                        this.tbObj.scrollStep = this.scrollStep;
                    }
                    break;
            }
        }
    };
    __decorate([
        Collection([], TabItem)
    ], Tab.prototype, "items", void 0);
    __decorate([
        Property('100%')
    ], Tab.prototype, "width", void 0);
    __decorate([
        Property('auto')
    ], Tab.prototype, "height", void 0);
    __decorate([
        Property('')
    ], Tab.prototype, "cssClass", void 0);
    __decorate([
        Property(0)
    ], Tab.prototype, "selectedItem", void 0);
    __decorate([
        Property('Top')
    ], Tab.prototype, "headerPlacement", void 0);
    __decorate([
        Property('Content')
    ], Tab.prototype, "heightAdjustMode", void 0);
    __decorate([
        Property('Scrollable')
    ], Tab.prototype, "overflowMode", void 0);
    __decorate([
        Property(false)
    ], Tab.prototype, "enablePersistence", void 0);
    __decorate([
        Property(false)
    ], Tab.prototype, "showCloseButton", void 0);
    __decorate([
        Property()
    ], Tab.prototype, "scrollStep", void 0);
    __decorate([
        Complex({}, TabAnimationSettings)
    ], Tab.prototype, "animation", void 0);
    __decorate([
        Event()
    ], Tab.prototype, "created", void 0);
    __decorate([
        Event()
    ], Tab.prototype, "adding", void 0);
    __decorate([
        Event()
    ], Tab.prototype, "added", void 0);
    __decorate([
        Event()
    ], Tab.prototype, "selecting", void 0);
    __decorate([
        Event()
    ], Tab.prototype, "selected", void 0);
    __decorate([
        Event()
    ], Tab.prototype, "removing", void 0);
    __decorate([
        Event()
    ], Tab.prototype, "removed", void 0);
    __decorate([
        Event()
    ], Tab.prototype, "destroyed", void 0);
    Tab = __decorate([
        NotifyPropertyChanges
    ], Tab);
    return Tab;
}(Component));
export { Tab };
