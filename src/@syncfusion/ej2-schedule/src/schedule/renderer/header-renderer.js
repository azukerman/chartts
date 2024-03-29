import { isNullOrUndefined, createElement, remove, closest, addClass, removeClass, extend, isBlazor } from '@syncfusion/ej2-base';
import { Toolbar } from '@syncfusion/ej2-navigations';
import { Calendar } from '@syncfusion/ej2-calendars';
import { Popup } from '@syncfusion/ej2-popups';
import * as events from '../base/constant';
import * as util from '../base/util';
import * as cls from '../base/css-constant';
/**
 * Header module
 */
var HeaderRenderer = /** @class */ (function () {
    /**
     * Constructor for render module
     */
    function HeaderRenderer(parent) {
        this.parent = parent;
        this.l10n = this.parent.localeObj;
        this.renderHeader();
        this.addEventListener();
    }
    HeaderRenderer.prototype.addEventListener = function () {
        this.parent.on(events.documentClick, this.closeHeaderPopup, this);
    };
    HeaderRenderer.prototype.removeEventListener = function () {
        this.parent.off(events.documentClick, this.closeHeaderPopup);
    };
    HeaderRenderer.prototype.closeHeaderPopup = function (e) {
        var closestEle = closest(e.event.target, '.e-date-range,.e-header-popup,.e-day,.e-selected');
        if (!isNullOrUndefined(closestEle)) {
            return;
        }
        this.hideHeaderPopup();
    };
    /** @hidden */
    HeaderRenderer.prototype.hideHeaderPopup = function () {
        if (this.headerPopup) {
            this.headerPopup.hide();
        }
    };
    HeaderRenderer.prototype.renderHeader = function () {
        this.element = createElement('div', { className: cls.TOOLBAR_CONTAINER });
        var toolbarEle = createElement('div', { className: cls.HEADER_TOOLBAR });
        this.element.appendChild(toolbarEle);
        this.parent.element.insertBefore(this.element, this.parent.element.firstElementChild);
        this.renderToolbar();
    };
    HeaderRenderer.prototype.renderToolbar = function () {
        var items = this.getItems();
        var args = { requestType: 'toolbarItemRendering', items: items };
        if (!isBlazor()) {
            this.parent.trigger(events.actionBegin, args);
        }
        this.toolbarObj = new Toolbar({
            items: args.items,
            overflowMode: 'Popup',
            clicked: this.toolbarClickHandler.bind(this),
            enableRtl: this.parent.enableRtl,
            locale: this.parent.locale
        });
        this.toolbarObj.isStringTemplate = true;
        this.toolbarObj.appendTo(this.parent.element.querySelector('.' + cls.HEADER_TOOLBAR));
        var prevNavEle = this.toolbarObj.element.querySelector('.e-prev');
        if (prevNavEle) {
            prevNavEle.firstChild.setAttribute('title', this.l10n.getConstant('previous'));
        }
        var nextNavEle = this.toolbarObj.element.querySelector('.e-next');
        if (nextNavEle) {
            nextNavEle.firstChild.setAttribute('title', this.l10n.getConstant('next'));
        }
        this.updateActiveView();
        this.parent.trigger(events.actionComplete, { requestType: 'toolBarItemRendered', items: this.toolbarObj.items });
    };
    HeaderRenderer.prototype.updateItems = function () {
        if (this.toolbarObj) {
            var items = this.getItems();
            var args = { requestType: 'toolbarItemRendering', items: items };
            if (!isBlazor()) {
                this.parent.trigger(events.actionBegin, args);
            }
            this.toolbarObj.items = args.items;
            this.toolbarObj.dataBind();
            this.parent.trigger(events.actionComplete, {
                requestType: 'toolBarItemRendered',
                items: this.toolbarObj.items
            });
        }
    };
    HeaderRenderer.prototype.getPopUpRelativeElement = function () {
        if (this.parent.isAdaptive) {
            return this.toolbarObj.element;
        }
        return this.element.querySelector('.e-date-range');
    };
    HeaderRenderer.prototype.setDayOfWeek = function (index) {
        if (this.headerCalendar) {
            this.headerCalendar.firstDayOfWeek = index;
            this.headerCalendar.dataBind();
        }
    };
    HeaderRenderer.prototype.setCalendarDate = function (date) {
        if (this.headerCalendar) {
            this.headerCalendar.value = date;
            this.headerCalendar.dataBind();
        }
    };
    HeaderRenderer.prototype.getCalendarView = function () {
        if (['Month', 'MonthAgenda', 'TimelineMonth'].indexOf(this.parent.currentView) > -1) {
            return 'Year';
        }
        else if (['Year', 'TimelineYear'].indexOf(this.parent.currentView) > -1) {
            return 'Decade';
        }
        else {
            return 'Month';
        }
    };
    HeaderRenderer.prototype.setCalendarView = function () {
        if (this.headerCalendar) {
            var calendarView = this.getCalendarView();
            this.headerCalendar.depth = calendarView;
            this.headerCalendar.start = calendarView;
            this.headerCalendar.refresh();
        }
    };
    HeaderRenderer.prototype.updateActiveView = function () {
        var selEle = this.toolbarObj.element.querySelectorAll('.e-views');
        removeClass(selEle, ['e-active-view']);
        if (selEle.length > 0 && selEle[this.parent.viewIndex]) {
            addClass([selEle[this.parent.viewIndex]], ['e-active-view']);
        }
    };
    HeaderRenderer.prototype.updateDateRange = function (text) {
        var selEle = this.toolbarObj.element.querySelector('.e-date-range');
        if (selEle) {
            selEle.setAttribute('aria-label', text);
            selEle.querySelector('.e-tbar-btn-text').innerHTML = text;
            this.toolbarObj.refreshOverflow();
        }
    };
    HeaderRenderer.prototype.getDateRangeText = function () {
        return this.parent.globalize.formatDate(this.parent.selectedDate, { format: 'MMMM y', calendar: this.parent.getCalendarMode() });
    };
    HeaderRenderer.prototype.getItems = function () {
        var items = [];
        var showInPopup = this.parent.isAdaptive;
        items.push({
            align: 'Left', prefixIcon: 'e-icon-prev', tooltipText: 'Previous', overflow: 'Show',
            cssClass: 'e-prev', htmlAttributes: { 'aria-label': 'previous period' }
        });
        items.push({
            align: 'Left', prefixIcon: 'e-icon-next', tooltipText: 'Next', overflow: 'Show',
            cssClass: 'e-next', htmlAttributes: { 'aria-label': 'next period' }
        });
        items.push({
            align: 'Left', text: this.getDateRangeText(), suffixIcon: 'e-icon-down-arrow', cssClass: 'e-date-range',
            overflow: 'Show', htmlAttributes: { 'aria-atomic': 'true', 'aria-live': 'assertive', 'aria-label': 'title' }
        });
        if (this.parent.isAdaptive) {
            items.push({
                align: 'Right', showAlwaysInPopup: showInPopup, prefixIcon: 'e-icon-add', text: this.l10n.getConstant('newEvent'),
                cssClass: 'e-add', overflow: 'Show'
            });
            items.push({
                align: 'Right', showAlwaysInPopup: showInPopup, prefixIcon: 'e-icon-today', text: this.l10n.getConstant('today'),
                cssClass: 'e-today', overflow: 'Show'
            });
        }
        else {
            items.push({
                align: 'Right', showAlwaysInPopup: showInPopup, prefixIcon: 'e-icon-day', text: this.l10n.getConstant('today'),
                cssClass: 'e-today', overflow: 'Show'
            });
            if (this.parent.views.length > 1) {
                items.push({
                    align: 'Right', type: 'Separator', cssClass: 'e-schedule-seperator'
                });
            }
        }
        if (this.parent.views.length > 1) {
            for (var _i = 0, _a = this.parent.views; _i < _a.length; _i++) {
                var item = _a[_i];
                typeof (item) === 'string' ? items.push(this.getItemObject(item.toLowerCase(), null)) :
                    items.push(this.getItemObject(item.option.toLowerCase(), item.displayName));
            }
        }
        return items;
    };
    HeaderRenderer.prototype.getItemObject = function (viewName, displayName) {
        var view;
        var showInPopup = this.parent.isAdaptive;
        switch (viewName) {
            case 'day':
                view = {
                    align: 'Right', showAlwaysInPopup: showInPopup, prefixIcon: 'e-icon-day',
                    text: displayName || this.l10n.getConstant('day'), cssClass: 'e-views e-day'
                };
                break;
            case 'week':
                view = {
                    align: 'Right', showAlwaysInPopup: showInPopup, prefixIcon: 'e-icon-week',
                    text: displayName || this.l10n.getConstant('week'), cssClass: 'e-views e-week'
                };
                break;
            case 'workweek':
                view = {
                    align: 'Right', showAlwaysInPopup: showInPopup, prefixIcon: 'e-icon-workweek',
                    text: displayName || this.l10n.getConstant('workWeek'), cssClass: 'e-views e-work-week'
                };
                break;
            case 'month':
                view = {
                    align: 'Right', showAlwaysInPopup: showInPopup, prefixIcon: 'e-icon-month',
                    text: displayName || this.l10n.getConstant('month'), cssClass: 'e-views e-month'
                };
                break;
            case 'year':
                view = {
                    align: 'Right', showAlwaysInPopup: showInPopup, prefixIcon: 'e-icon-year',
                    text: displayName || this.l10n.getConstant('year'), cssClass: 'e-views e-year'
                };
                break;
            case 'agenda':
                view = {
                    align: 'Right', showAlwaysInPopup: showInPopup, prefixIcon: 'e-icon-agenda', text: this.l10n.getConstant('agenda'),
                    cssClass: 'e-views e-agenda'
                };
                break;
            case 'monthagenda':
                view = {
                    align: 'Right', showAlwaysInPopup: showInPopup, prefixIcon: 'e-icon-month-agenda',
                    text: this.l10n.getConstant('monthAgenda'), cssClass: 'e-views e-month-agenda'
                };
                break;
            case 'timelineday':
                view = {
                    align: 'Right', showAlwaysInPopup: showInPopup, prefixIcon: 'e-icon-timeline-day',
                    text: displayName || this.l10n.getConstant('timelineDay'), cssClass: 'e-views e-timeline-day'
                };
                break;
            case 'timelineweek':
                view = {
                    align: 'Right', showAlwaysInPopup: showInPopup, prefixIcon: 'e-icon-timeline-week',
                    text: displayName || this.l10n.getConstant('timelineWeek'), cssClass: 'e-views e-timeline-week'
                };
                break;
            case 'timelineworkweek':
                view = {
                    align: 'Right', showAlwaysInPopup: showInPopup, prefixIcon: 'e-icon-timeline-workweek',
                    text: displayName || this.l10n.getConstant('timelineWorkWeek'), cssClass: 'e-views e-timeline-work-week'
                };
                break;
            case 'timelinemonth':
                view = {
                    align: 'Right', showAlwaysInPopup: showInPopup, prefixIcon: 'e-icon-timeline-month',
                    text: displayName || this.l10n.getConstant('timelineMonth'), cssClass: 'e-views e-timeline-month'
                };
                break;
            case 'timelineyear':
                view = {
                    align: 'Right', showAlwaysInPopup: showInPopup, prefixIcon: 'e-icon-timeline-year',
                    text: displayName || this.l10n.getConstant('timelineYear'), cssClass: 'e-views e-timeline-year'
                };
                break;
        }
        return view;
    };
    HeaderRenderer.prototype.renderHeaderPopup = function () {
        var headerPopupEle = createElement('div', { className: cls.HEADER_POPUP_CLASS });
        var headerCalendarEle = createElement('div', { className: cls.HEADER_CALENDAR_CLASS });
        headerPopupEle.appendChild(headerCalendarEle);
        this.element.appendChild(headerPopupEle);
        this.headerPopup = new Popup(headerPopupEle, {
            actionOnScroll: 'hide',
            targetType: 'relative',
            relateTo: this.getPopUpRelativeElement(),
            position: { X: 'left', Y: 'bottom' },
            enableRtl: this.parent.enableRtl
        });
        this.headerPopup.isStringTemplate = true;
        var calendarView = this.getCalendarView();
        this.headerCalendar = new Calendar({
            value: this.parent.selectedDate,
            firstDayOfWeek: this.parent.activeViewOptions.firstDayOfWeek,
            enableRtl: this.parent.enableRtl,
            locale: this.parent.locale,
            depth: calendarView,
            start: calendarView,
            calendarMode: this.parent.calendarMode,
            change: this.calendarChange.bind(this)
        });
        this.headerCalendar.isStringTemplate = true;
        this.headerCalendar.appendTo(headerCalendarEle);
        this.headerPopup.hide();
    };
    HeaderRenderer.prototype.calendarChange = function (args) {
        if (args.value.getTime() !== this.parent.selectedDate.getTime()) {
            this.parent.changeDate(args.value);
        }
        this.headerPopup.hide();
    };
    HeaderRenderer.prototype.calculateViewIndex = function (args) {
        var target = closest(args.originalEvent.target, '.e-views');
        var views = [].slice.call(this.element.querySelectorAll('.e-views'));
        return views.indexOf(target);
    };
    HeaderRenderer.prototype.toolbarClickHandler = function (args) {
        if (!args.item) {
            return;
        }
        var strClass = args.item.cssClass.replace('e-views ', '');
        switch (strClass) {
            case 'e-date-range':
                if (!this.headerPopup) {
                    this.renderHeaderPopup();
                }
                if (this.headerPopup.element.classList.contains(cls.POPUP_OPEN)) {
                    this.headerPopup.hide();
                }
                else {
                    this.headerPopup.show();
                }
                break;
            case 'e-day':
                this.parent.changeView('Day', args.originalEvent, undefined, this.calculateViewIndex(args));
                break;
            case 'e-week':
                this.parent.changeView('Week', args.originalEvent, undefined, this.calculateViewIndex(args));
                break;
            case 'e-work-week':
                this.parent.changeView('WorkWeek', args.originalEvent, undefined, this.calculateViewIndex(args));
                break;
            case 'e-month':
                this.parent.changeView('Month', args.originalEvent, undefined, this.calculateViewIndex(args));
                break;
            case 'e-year':
                // this.parent.changeView('Year', args.originalEvent, undefined, this.calculateViewIndex(args));
                break;
            case 'e-agenda':
                this.parent.changeView('Agenda', args.originalEvent, undefined, this.calculateViewIndex(args));
                break;
            case 'e-month-agenda':
                this.parent.changeView('MonthAgenda', args.originalEvent, undefined, this.calculateViewIndex(args));
                break;
            case 'e-timeline-day':
                this.parent.changeView('TimelineDay', args.originalEvent, undefined, this.calculateViewIndex(args));
                break;
            case 'e-timeline-week':
                this.parent.changeView('TimelineWeek', args.originalEvent, undefined, this.calculateViewIndex(args));
                break;
            case 'e-timeline-work-week':
                this.parent.changeView('TimelineWorkWeek', args.originalEvent, undefined, this.calculateViewIndex(args));
                break;
            case 'e-timeline-month':
                this.parent.changeView('TimelineMonth', args.originalEvent, undefined, this.calculateViewIndex(args));
                break;
            case 'e-timeline-year':
                this.parent.changeView('TimelineYear', args.originalEvent, undefined, this.calculateViewIndex(args));
                break;
            case 'e-today':
                if (!this.parent.isSelectedDate(util.resetTime(this.parent.getCurrentTime()))) {
                    this.parent.changeDate(util.resetTime(this.parent.getCurrentTime()), args.originalEvent);
                }
                break;
            case 'e-prev':
                this.parent.changeDate(this.parent.activeView.getNextPreviousDate('previous'), args.originalEvent);
                break;
            case 'e-next':
                this.parent.changeDate(this.parent.activeView.getNextPreviousDate('next'), args.originalEvent);
                break;
            case 'e-add':
                var data = void 0;
                var isSameTime = this.parent.activeCellsData.startTime.getTime() === this.parent.activeCellsData.endTime.getTime();
                if (this.parent.activeCellsData && !isSameTime) {
                    data = this.parent.activeCellsData;
                }
                else {
                    var interval = this.parent.activeViewOptions.timeScale.interval;
                    var slotCount = this.parent.activeViewOptions.timeScale.slotCount;
                    var msInterval = (interval * util.MS_PER_MINUTE) / slotCount;
                    var startTime = new Date(this.parent.selectedDate.getTime());
                    var currentTime = this.parent.getCurrentTime();
                    startTime.
                        setHours(currentTime.getHours(), (Math.round(startTime.getMinutes() / msInterval) * msInterval), 0);
                    var endTime = new Date(new Date(startTime.getTime()).setMilliseconds(startTime.getMilliseconds() + msInterval));
                    data = { startTime: startTime, endTime: endTime, isAllDay: false };
                }
                this.parent.eventWindow.openEditor(extend(data, { cancel: false, event: args.originalEvent }), 'Add');
                break;
        }
        var toolbarPopUp = this.toolbarObj.element.querySelector('.e-toolbar-pop');
        if (toolbarPopUp && args.item.type !== 'Input') {
            toolbarPopUp.ej2_instances[0].hide({ name: 'SlideUp', duration: 100 });
        }
    };
    HeaderRenderer.prototype.getHeaderElement = function () {
        return this.toolbarObj.element;
    };
    HeaderRenderer.prototype.updateHeaderItems = function (classType) {
        var prevNavEle = this.toolbarObj.element.querySelector('.e-prev');
        var nextNavEle = this.toolbarObj.element.querySelector('.e-next');
        var dateRangeEle = this.toolbarObj.element.querySelector('.e-date-range');
        if (prevNavEle) {
            (classType === 'add') ? addClass([prevNavEle], cls.HIDDEN_CLASS) : removeClass([prevNavEle], cls.HIDDEN_CLASS);
        }
        if (nextNavEle) {
            (classType === 'add') ? addClass([nextNavEle], cls.HIDDEN_CLASS) : removeClass([nextNavEle], cls.HIDDEN_CLASS);
        }
        if (dateRangeEle) {
            (classType === 'add') ? addClass([dateRangeEle], cls.TEXT_ELLIPSIS) : removeClass([dateRangeEle], cls.TEXT_ELLIPSIS);
        }
    };
    /**
     * Get module name.
     */
    HeaderRenderer.prototype.getModuleName = function () {
        return 'headerbar';
    };
    /**
     * To destroy the headerbar.
     * @return {void}
     * @private
     */
    HeaderRenderer.prototype.destroy = function () {
        if (this.headerPopup) {
            this.headerPopup.destroy();
        }
        if (this.headerCalendar) {
            this.headerCalendar.destroy();
        }
        if (!this.toolbarObj.isDestroyed) {
            this.toolbarObj.destroy();
            this.removeEventListener();
            remove(this.element);
        }
    };
    return HeaderRenderer;
}());
export { HeaderRenderer };
