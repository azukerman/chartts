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
import { isNullOrUndefined, extend, EventHandler, formatUnit, Browser, isBlazor } from '@syncfusion/ej2-base';
import { createElement, remove, addClass, removeClass, append, prepend } from '@syncfusion/ej2-base';
import { ViewBase, ViewHelper } from './view-base';
import { VerticalEvent } from '../event-renderer/vertical-view';
import { MonthEvent } from '../event-renderer/month';
import * as util from '../base/util';
import * as event from '../base/constant';
import * as cls from '../base/css-constant';
/**
 * vertical view
 */
var VerticalView = /** @class */ (function (_super) {
    __extends(VerticalView, _super);
    /**
     * Constructor for vertical view
     */
    function VerticalView(parent) {
        var _this = _super.call(this, parent) || this;
        _this.viewClass = 'e-day-view';
        _this.isInverseTableSelect = true;
        _this.baseCssClass = 'e-vertical-view';
        return _this;
    }
    VerticalView.prototype.addEventListener = function () {
        this.parent.on(event.scrollUiUpdate, this.scrollUiUpdate, this);
        this.parent.on(event.dataReady, this.renderEvents, this);
    };
    VerticalView.prototype.removeEventListener = function () {
        this.parent.off(event.scrollUiUpdate, this.scrollUiUpdate);
        this.parent.off(event.dataReady, this.renderEvents);
    };
    VerticalView.prototype.renderEvents = function () {
        if (this.parent.activeViewOptions.timeScale.enable) {
            var appointment = new VerticalEvent(this.parent);
            appointment.renderAppointments();
        }
        else {
            var appointment = new MonthEvent(this.parent);
            appointment.renderAppointments();
        }
        this.parent.notify(event.eventsLoaded, {});
    };
    VerticalView.prototype.onContentScroll = function (e) {
        this.parent.removeNewEventElement();
        var target = e.target;
        this.parent.notify(event.virtualScroll, e);
        this.scrollLeftPanel(target);
        this.scrollTopPanel(target);
        if (!this.parent.isAdaptive) {
            this.parent.uiStateValues.top = target.scrollTop;
        }
        this.parent.uiStateValues.left = target.scrollLeft;
        if (!isNullOrUndefined(this.parent.quickPopup)) {
            this.parent.quickPopup.quickPopupHide();
        }
    };
    VerticalView.prototype.onApaptiveMove = function (e) {
        if (this.parent.uiStateValues.action) {
            e.preventDefault();
        }
    };
    VerticalView.prototype.onApaptiveScroll = function (e) {
        this.parent.removeNewEventElement();
        this.parent.uiStateValues.top = e.target.scrollTop;
    };
    VerticalView.prototype.scrollLeftPanel = function (target) {
        var leftPanel = this.getLeftPanelElement();
        if (!isNullOrUndefined(leftPanel)) {
            leftPanel.scrollTop = target.scrollTop;
        }
    };
    VerticalView.prototype.scrollUiUpdate = function (args) {
        var headerBarHeight = this.getHeaderBarHeight();
        var timecells = this.getLeftPanelElement();
        var content = this.getScrollableElement();
        var header = this.getDatesHeaderElement();
        var scrollerHeight = this.parent.element.offsetHeight - headerBarHeight - header.offsetHeight;
        this.setContentHeight(content, timecells, scrollerHeight);
        var scrollBarWidth = util.getScrollBarWidth();
        // tslint:disable:no-any
        if (content.offsetWidth - content.clientWidth > 0) {
            header.firstChild.style[args.cssProperties.border] = scrollBarWidth > 0 ? '1px' : '0px';
            header.style[args.cssProperties.padding] = scrollBarWidth > 0 ? scrollBarWidth - 1 + 'px' : '0px';
        }
        else {
            header.firstChild.style[args.cssProperties.border] = '';
            header.style[args.cssProperties.padding] = '';
        }
        // tslint:enable:no-any
        if (!args.isPreventScrollUpdate) {
            if (this.parent.uiStateValues.isInitial) {
                this.scrollToWorkHour();
                this.parent.uiStateValues.isInitial = false;
            }
            else {
                content.scrollTop = this.parent.uiStateValues.top;
                content.scrollLeft = this.parent.uiStateValues.left;
            }
        }
        this.setColWidth(content);
        if (this.parent.activeViewOptions.timeScale.enable) {
            this.highlightCurrentTime();
        }
    };
    VerticalView.prototype.setContentHeight = function (element, leftPanelElement, height) {
        if (this.parent.isAdaptive && !this.isTimelineView()) {
            element.style.height = formatUnit(height);
        }
        else {
            if (!isNullOrUndefined(leftPanelElement)) {
                leftPanelElement.style.height = formatUnit(height - this.getScrollXIndent(element));
            }
            element.style.height = formatUnit(height);
        }
    };
    VerticalView.prototype.scrollToWorkHour = function () {
        if (this.parent.workHours.highlight) {
            var firstWorkHourCell = this.element.querySelector('.' + cls.WORK_HOURS_CLASS);
            if (firstWorkHourCell) {
                this.getScrollableElement().scrollTop = firstWorkHourCell.offsetTop;
                this.parent.uiStateValues.top = firstWorkHourCell.offsetTop;
                this.parent.uiStateValues.left = 0;
            }
        }
    };
    VerticalView.prototype.scrollToHour = function (hour) {
        var date = this.parent.getStartEndTime(hour);
        if (isNullOrUndefined(date)) {
            return;
        }
        this.getScrollableElement().scrollTop = this.getTopFromDateTime(date);
    };
    VerticalView.prototype.generateColumnLevels = function () {
        var level = this.getDateSlots(this.renderDates, this.parent.activeViewOptions.workDays);
        var columnLevels = [];
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            columnLevels = this.parent.resourceBase.generateResourceLevels(level);
            if (this.parent.uiStateValues.isGroupAdaptive && this.parent.resourceBase.lastResourceLevel.length > 0) {
                var resourceLevel = this.parent.resourceBase.lastResourceLevel[this.parent.uiStateValues.groupIndex];
                var resStartHour = resourceLevel.resourceData[resourceLevel.resource.startHourField];
                var resEndHour = resourceLevel.resourceData[resourceLevel.resource.endHourField];
                var dateSlots = this.getDateSlots(resourceLevel.renderDates, resourceLevel.workDays, resStartHour, resEndHour);
                columnLevels = [dateSlots];
            }
        }
        else {
            columnLevels.push(level);
        }
        this.colLevels = columnLevels;
        return columnLevels;
    };
    VerticalView.prototype.getDateSlots = function (renderDates, workDays, workStartHour, workEndHour) {
        if (workStartHour === void 0) { workStartHour = this.parent.workHours.start; }
        if (workEndHour === void 0) { workEndHour = this.parent.workHours.end; }
        var dateCol = [];
        var start = this.parent.getStartEndTime(workStartHour);
        var end = this.parent.getStartEndTime(workEndHour);
        for (var _i = 0, renderDates_1 = renderDates; _i < renderDates_1.length; _i++) {
            var col = renderDates_1[_i];
            var classList = [cls.HEADER_CELLS_CLASS];
            if (this.isCurrentDate(col)) {
                classList.push(cls.CURRENT_DAY_CLASS);
            }
            dateCol.push({
                date: col, type: 'dateHeader', className: classList, colSpan: 1,
                workDays: workDays, startHour: new Date(+start), endHour: new Date(+end)
            });
        }
        return dateCol;
    };
    VerticalView.prototype.isWorkHourRange = function (date) {
        return (this.getStartHour().getTime() <= date.getTime()) && (this.getEndHour().getTime() >= date.getTime());
    };
    VerticalView.prototype.highlightCurrentTime = function () {
        var _this = this;
        if (this.parent.activeViewOptions.headerRows.length > 0 &&
            this.parent.activeViewOptions.headerRows.slice(-1)[0].option !== 'Hour') {
            return;
        }
        if (this.parent.showTimeIndicator && this.isWorkHourRange(this.parent.getCurrentTime())) {
            var currentDateIndex = this.getCurrentTimeIndicatorIndex();
            if (currentDateIndex.length > 0) {
                var workCells = [].slice.call(this.element.querySelectorAll('.' + cls.WORK_CELLS_CLASS));
                if (workCells.length > 0) {
                    this.changeCurrentTimePosition();
                }
                if (isNullOrUndefined(this.currentTimeIndicatorTimer)) {
                    this.currentTimeIndicatorTimer = window.setInterval(function () { _this.changeCurrentTimePosition(); }, util.MS_PER_MINUTE);
                }
            }
            else {
                this.clearCurrentTimeIndicatorTimer();
            }
        }
        else {
            this.clearCurrentTimeIndicatorTimer();
        }
    };
    VerticalView.prototype.getCurrentTimeIndicatorIndex = function () {
        var currentDateIndex = [];
        if (!isNullOrUndefined(this.parent.resourceBase) && (this.parent.activeViewOptions.group.resources.length > 0) &&
            !this.parent.uiStateValues.isGroupAdaptive) {
            var count = 0;
            for (var _i = 0, _a = this.parent.resourceBase.lastResourceLevel; _i < _a.length; _i++) {
                var resource = _a[_i];
                var index = this.parent.getIndexOfDate(resource.renderDates, util.resetTime(this.parent.getCurrentTime()));
                if (index >= 0) {
                    var resIndex = this.parent.activeViewOptions.group.byDate ?
                        (this.parent.resourceBase.lastResourceLevel.length * index) + count : count + index;
                    currentDateIndex.push(resIndex);
                }
                count += this.parent.activeViewOptions.group.byDate ? 1 : resource.renderDates.length;
            }
        }
        else {
            var renderDates = (this.parent.uiStateValues.isGroupAdaptive && this.parent.resourceBase.lastResourceLevel.length > 0) ?
                this.parent.resourceBase.lastResourceLevel[this.parent.uiStateValues.groupIndex].renderDates : this.renderDates;
            var index = this.parent.getIndexOfDate(renderDates, util.resetTime(this.parent.getCurrentTime()));
            if (index >= 0) {
                currentDateIndex.push(index);
            }
        }
        return currentDateIndex;
    };
    VerticalView.prototype.clearCurrentTimeIndicatorTimer = function () {
        if (!isNullOrUndefined(this.currentTimeIndicatorTimer)) {
            window.clearInterval(this.currentTimeIndicatorTimer);
            this.currentTimeIndicatorTimer = null;
            this.removeCurrentTimeIndicatorElements();
        }
    };
    VerticalView.prototype.removeCurrentTimeIndicatorElements = function () {
        var queryString = '.' + cls.PREVIOUS_TIMELINE_CLASS + ',.' + cls.CURRENT_TIMELINE_CLASS + ',.' + cls.CURRENT_TIME_CLASS;
        var timeIndicator = [].slice.call(this.element.querySelectorAll(queryString));
        timeIndicator.forEach(function (indicator) { return remove(indicator); });
    };
    VerticalView.prototype.changeCurrentTimePosition = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.removeCurrentTimeIndicatorElements();
        var currentDateIndex = this.getCurrentTimeIndicatorIndex();
        var firstRow = this.parent.getContentTable().rows[0];
        var top = this.getTopFromDateTime(this.parent.getCurrentTime());
        var topInPx = formatUnit(top);
        var rowIndex = Math.floor(top / firstRow.cells[0].offsetHeight);
        if (isNullOrUndefined(rowIndex) || isNaN(rowIndex)) {
            return;
        }
        var curTimeWrap = this.element.querySelectorAll('.' + cls.TIMELINE_WRAPPER_CLASS);
        for (var i = 0, length_1 = currentDateIndex[0]; i < length_1; i++) {
            curTimeWrap[i].appendChild(createElement('div', { className: cls.PREVIOUS_TIMELINE_CLASS, styles: 'top:' + topInPx }));
        }
        for (var _i = 0, currentDateIndex_1 = currentDateIndex; _i < currentDateIndex_1.length; _i++) {
            var day = currentDateIndex_1[_i];
            curTimeWrap[day].appendChild(createElement('div', { className: cls.CURRENT_TIMELINE_CLASS, styles: 'top:' + topInPx }));
        }
        var currentTimeEle = createElement('div', {
            innerHTML: this.parent.getTimeString(this.parent.getCurrentTime()),
            className: cls.CURRENT_TIME_CLASS,
            styles: 'top:' + topInPx
        });
        var timeCellsWrap = this.getLeftPanelElement();
        removeClass(timeCellsWrap.querySelectorAll('.' + cls.HIDE_CHILDS_CLASS), cls.HIDE_CHILDS_CLASS);
        addClass([timeCellsWrap.querySelectorAll('tr')[rowIndex].lastChild], cls.HIDE_CHILDS_CLASS);
        prepend([currentTimeEle], timeCellsWrap);
        currentTimeEle.style.top = formatUnit(currentTimeEle.offsetTop - (currentTimeEle.offsetHeight / 2));
    };
    VerticalView.prototype.getTopFromDateTime = function (date) {
        var startHour = this.getStartHour();
        var diffInMinutes = ((date.getHours() - startHour.getHours()) * 60) + (date.getMinutes() - startHour.getMinutes());
        return (diffInMinutes * this.getWorkCellHeight() * this.parent.activeViewOptions.timeScale.slotCount) /
            this.parent.activeViewOptions.timeScale.interval;
    };
    VerticalView.prototype.getWorkCellHeight = function () {
        return this.element.querySelector('.' + cls.WORK_CELLS_CLASS).offsetHeight;
    };
    VerticalView.prototype.getTdContent = function (date, type, groupIndex) {
        var cntEle;
        var wrapper = createElement('div');
        var templateName = '';
        var templateId = this.parent.element.id + '_';
        var dateValue = util.addLocalOffset(date);
        switch (type) {
            case 'dateHeader':
                if (this.parent.activeViewOptions.dateHeaderTemplate) {
                    templateName = 'dateHeaderTemplate';
                    var args = { date: dateValue, type: type };
                    var viewName = this.parent.activeViewOptions.dateHeaderTemplateName;
                    cntEle =
                        this.parent.getDateHeaderTemplate()(args, this.parent, templateName, templateId + viewName + templateName, false);
                }
                else {
                    wrapper.innerHTML = this.parent.activeView.isTimelineView() ?
                        "<span class=\"e-header-date e-navigate\">" + ViewHelper.getTimelineDate(this.parent, date) + "</span>" :
                        "<div class=\"e-header-day\">" + ViewHelper.getDayName(this.parent, date) + "</div>" +
                            ("<div class=\"e-header-date e-navigate\" role=\"link\">" + ViewHelper.getDate(this.parent, date) + "</div>");
                    cntEle = wrapper.childNodes;
                }
                break;
            case 'majorSlot':
                if (this.parent.activeViewOptions.timeScale.majorSlotTemplate) {
                    templateName = 'majorSlotTemplate';
                    var args = { date: dateValue, type: type };
                    cntEle =
                        this.parent.getMajorSlotTemplate()(args, this.parent, templateName, templateId + templateName, false);
                }
                else {
                    wrapper.innerHTML = "<span>" + ViewHelper.getTime(this.parent, date) + "</span>";
                    cntEle = wrapper.childNodes;
                }
                break;
            case 'minorSlot':
                if (this.parent.activeViewOptions.timeScale.minorSlotTemplate) {
                    templateName = 'minorSlotTemplate';
                    var args = { date: dateValue, type: type };
                    cntEle =
                        this.parent.getMinorSlotTemplate()(args, this.parent, templateName, templateId + templateName, false);
                }
                else {
                    wrapper.innerHTML = '&nbsp;';
                    cntEle = wrapper.childNodes;
                }
                break;
            case 'alldayCells':
                if (this.parent.activeViewOptions.cellTemplate) {
                    var viewName = this.parent.activeViewOptions.cellTemplateName;
                    templateName = 'cellTemplate';
                    var args = { date: dateValue, type: type, groupIndex: groupIndex };
                    cntEle =
                        this.parent.getCellTemplate()(args, this.parent, templateName, templateId + viewName + templateName, false);
                }
                break;
        }
        return cntEle;
    };
    VerticalView.prototype.renderLayout = function (type) {
        this.setPanel(createElement('div', { className: cls.TABLE_WRAP_CLASS }));
        var clsList = [this.baseCssClass, this.viewClass];
        clsList.push(type);
        if (this.parent.activeViewOptions.group.byDate) {
            clsList.push('e-by-date');
        }
        if (!this.parent.activeViewOptions.timeScale.enable) {
            addClass([this.element], [cls.TIMESCALE_DISABLE, this.viewClass]);
        }
        if (this.parent.activeViewOptions.allowVirtualScrolling) {
            clsList.push(cls.VIRTUAL_SCROLL_CLASS);
        }
        this.renderPanel(type);
        addClass([this.element], clsList);
        this.element.appendChild(this.createTableLayout(cls.OUTER_TABLE_CLASS));
        this.colLevels = this.generateColumnLevels();
        this.renderHeader();
        this.renderContent();
        if (this.parent.uiStateValues.isGroupAdaptive && !this.parent.element.querySelector('.' + cls.RESOURCE_TOOLBAR_CONTAINER)) {
            this.renderResourceMobileLayout();
        }
        this.parent.notify(event.contentReady, {});
        this.parent.updateLayoutTemplates();
    };
    VerticalView.prototype.renderHeader = function () {
        var tr = createElement('tr');
        var dateTd = createElement('td');
        dateTd.appendChild(this.renderDatesHeader());
        if (this.parent.activeViewOptions.timeScale.enable) {
            var indentTd = createElement('td', { className: cls.LEFT_INDENT_CLASS });
            indentTd.appendChild(this.renderLeftIndent());
            tr.appendChild(indentTd);
        }
        tr.appendChild(dateTd);
        prepend([tr], this.element.querySelector('tbody'));
    };
    VerticalView.prototype.renderContent = function () {
        var tr = createElement('tr');
        var workTd = createElement('td');
        if (this.parent.isAdaptive) {
            workTd.setAttribute('colspan', (this.parent.activeViewOptions.timeScale.enable ? '2' : '1'));
            var scrollContainer = createElement('div', { className: cls.SCROLL_CONTAINER_CLASS });
            if (this.parent.activeViewOptions.timeScale.enable) {
                scrollContainer.appendChild(this.renderTimeCells());
            }
            scrollContainer.appendChild(this.renderContentArea());
            workTd.appendChild(scrollContainer);
            EventHandler.add(scrollContainer, 'scroll', this.onApaptiveScroll, this);
            EventHandler.add(scrollContainer, Browser.touchMoveEvent, this.onApaptiveMove, this);
            tr.appendChild(workTd);
        }
        else {
            workTd.appendChild(this.renderContentArea());
            if (this.parent.activeViewOptions.timeScale.enable) {
                var timesTd = createElement('td');
                timesTd.appendChild(this.renderTimeCells());
                tr.appendChild(timesTd);
            }
            tr.appendChild(workTd);
        }
        this.element.querySelector('tbody').appendChild(tr);
    };
    VerticalView.prototype.renderLeftIndent = function () {
        var wrap = createElement('div', { className: cls.LEFT_INDENT_WRAP_CLASS });
        var tbl = this.createTableLayout();
        var trEle = createElement('tr');
        var rowCount = this.colLevels.length;
        for (var i = 0; i < rowCount; i++) {
            var ntr_1 = trEle.cloneNode();
            var data_1 = { className: [(this.colLevels[i][0] && this.colLevels[i][0].className[0])], type: 'emptyCells' };
            if (this.parent.activeViewOptions.showWeekNumber && data_1.className.indexOf(cls.HEADER_CELLS_CLASS) !== -1) {
                data_1.className.push(cls.WEEK_NUMBER_CLASS);
                var weekNumberDate = util.getWeekLastDate(this.renderDates.slice(-1)[0], this.parent.firstDayOfWeek);
                var weekNo = this.parent.currentView === 'Day' ? util.getWeekNumber(weekNumberDate) :
                    util.getWeekNumber(this.renderDates.slice(-1)[0]);
                data_1.template = [createElement('span', {
                        innerHTML: '' + weekNo,
                        attrs: { title: this.parent.localeObj.getConstant('week') + ' ' + weekNo }
                    })];
            }
            ntr_1.appendChild(this.createTd(data_1));
            tbl.querySelector('tbody').appendChild(ntr_1);
        }
        var ntr = trEle.cloneNode();
        var appointmentExpandCollapse = createElement('div', {
            attrs: { 'tabindex': '0', title: 'Expand-all-day-section', 'aria-disabled': 'false', 'aria-label': 'Expand section' },
            className: cls.ALLDAY_APPOINTMENT_SECTION_CLASS + ' ' + cls.APPOINTMENT_ROW_EXPAND_CLASS + ' ' +
                cls.ICON + ' ' + cls.DISABLE_CLASS,
        });
        var data = { className: [cls.ALLDAY_CELLS_CLASS], type: 'emptyCells' };
        var nth = this.createTd(data);
        nth.appendChild(appointmentExpandCollapse);
        ntr.appendChild(nth);
        tbl.querySelector('tbody').appendChild(ntr);
        wrap.appendChild(tbl);
        return wrap;
    };
    VerticalView.prototype.renderDatesHeader = function () {
        var container = createElement('div', { className: cls.DATE_HEADER_CONTAINER_CLASS });
        var wrap = createElement('div', { className: cls.DATE_HEADER_WRAP_CLASS });
        container.appendChild(wrap);
        var tbl = this.createTableLayout();
        var trEle = createElement('tr');
        var rowCount = this.colLevels.length;
        var lastLevel = this.colLevels[rowCount - 1];
        this.createColGroup(tbl, lastLevel);
        for (var i = 0; i < rowCount; i++) {
            var ntr = trEle.cloneNode();
            addClass([ntr], cls.HEADER_ROW_CLASS);
            var level = this.colLevels[i];
            for (var j = 0; j < level.length; j++) {
                ntr.appendChild(this.createTd(level[j]));
            }
            tbl.querySelector('tbody').appendChild(ntr);
        }
        this.createAllDayRow(tbl, lastLevel);
        wrap.appendChild(tbl);
        return container;
    };
    VerticalView.prototype.createAllDayRow = function (table, tdData) {
        var ntr = createElement('tr');
        addClass([ntr], cls.ALLDAY_ROW_CLASS);
        for (var j = 0; j < tdData.length; j++) {
            var td = extend({}, tdData[j]);
            td.className = [cls.ALLDAY_CELLS_CLASS];
            td.type = 'alldayCells';
            var ntd = this.createTd(td);
            ntd.setAttribute('data-date', td.date.getTime().toString());
            if (!isNullOrUndefined(td.groupIndex)) {
                ntd.setAttribute('data-group-index', '' + td.groupIndex);
            }
            this.wireCellEvents(ntd);
            ntr.appendChild(ntd);
        }
        table.querySelector('tbody').appendChild(ntr);
        var thead = createElement('thead');
        thead.appendChild(this.createEventWrapper('allDay'));
        prepend([thead], table);
    };
    VerticalView.prototype.createTd = function (td) {
        var tdEle = createElement('td');
        this.addAttributes(td, tdEle);
        if (td.date && td.type) {
            var ele = this.getTdContent(td.date, td.type, td.groupIndex);
            if (ele && ele.length) {
                append([].slice.call(ele), tdEle);
            }
        }
        if (td.type === 'resourceHeader') {
            this.setResourceHeaderContent(tdEle, td);
        }
        if (td.type === 'dateHeader' && td.className.indexOf(cls.HEADER_CELLS_CLASS) >= 0) {
            tdEle.setAttribute('data-date', td.date.getTime().toString());
            if (!isNullOrUndefined(td.groupIndex)) {
                tdEle.setAttribute('data-group-index', '' + td.groupIndex);
            }
            this.wireMouseEvents(tdEle);
        }
        var args = { elementType: td.type, element: tdEle, date: td.date, groupIndex: td.groupIndex };
        this.parent.trigger(event.renderCell, args);
        return tdEle;
    };
    VerticalView.prototype.wireCellEvents = function (element) {
        EventHandler.add(element, 'mousedown', this.parent.workCellAction.cellMouseDown, this.parent.workCellAction);
        this.wireMouseEvents(element);
    };
    VerticalView.prototype.wireMouseEvents = function (element) {
        EventHandler.add(element, 'click', this.parent.workCellAction.cellClick, this.parent.workCellAction);
        if (!this.parent.isAdaptive) {
            EventHandler.add(element, 'dblclick', this.parent.workCellAction.cellDblClick, this.parent.workCellAction);
        }
    };
    VerticalView.prototype.renderTimeCells = function () {
        var _this = this;
        var wrap = createElement('div', { className: cls.TIME_CELLS_WRAP_CLASS });
        var tbl = this.createTableLayout();
        var trEle = createElement('tr');
        var handler = function (r) {
            r.type = r.first ? 'majorSlot' : 'minorSlot';
            r.className = r.last ? [cls.TIME_CELLS_CLASS, cls.TIME_SLOT_CLASS] : [cls.TIME_SLOT_CLASS];
            var ntr = trEle.cloneNode();
            var data = { date: r.date, type: r.type, className: r.className };
            ntr.appendChild(_this.createTd(data));
            tbl.querySelector('tbody').appendChild(ntr);
            return r;
        };
        this.getTimeSlotRows(handler);
        wrap.appendChild(tbl);
        return wrap;
    };
    VerticalView.prototype.renderContentArea = function () {
        var wrap = createElement('div', { className: cls.CONTENT_WRAP_CLASS });
        var tbl = this.createTableLayout(cls.CONTENT_TABLE_CLASS);
        this.addAutoHeightClass(tbl);
        this.createColGroup(tbl, this.colLevels.slice(-1)[0]);
        this.renderContentTable(tbl);
        wrap.appendChild(tbl);
        this.wireCellEvents(tbl.querySelector('tbody'));
        EventHandler.add(wrap, 'scroll', this.onContentScroll, this);
        EventHandler.add(wrap, Browser.touchMoveEvent, this.onApaptiveMove, this);
        return wrap;
    };
    VerticalView.prototype.renderContentTable = function (table) {
        var _this = this;
        var tr = createElement('tr', { attrs: { role: 'row' } });
        var td = createElement('td', { attrs: { role: 'gridcell', 'aria-selected': 'false' } });
        var tbody = table.querySelector('tbody');
        var handler = function (r) {
            var ntr = tr.cloneNode();
            for (var _i = 0, _a = _this.colLevels[_this.colLevels.length - 1]; _i < _a.length; _i++) {
                var tdData = _a[_i];
                var ntd = _this.createContentTd(tdData, r, td);
                ntr.appendChild(ntd);
            }
            tbody.appendChild(ntr);
            return r;
        };
        this.getTimeSlotRows(handler);
        this.renderContentTableHeader(table);
    };
    VerticalView.prototype.createContentTd = function (tdData, r, td) {
        var ntd = td.cloneNode();
        if (tdData.colSpan) {
            ntd.setAttribute('colspan', tdData.colSpan.toString());
        }
        var clsName = this.getContentTdClass(r);
        var cellDate = util.resetTime(new Date('' + tdData.date));
        util.setTime(cellDate, util.getDateInMs(r.date));
        var type = 'workCells';
        if (tdData.className.indexOf(cls.RESOURCE_PARENT_CLASS) !== -1) {
            clsName.push(cls.RESOURCE_GROUP_CELLS_CLASS);
            type = 'resourceGroupCells';
        }
        if (this.parent.workHours.highlight && ((this.parent.activeViewOptions.timeScale.enable &&
            this.isWorkHour(cellDate, tdData.startHour, tdData.endHour, tdData.workDays)) ||
            (!this.parent.activeViewOptions.timeScale.enable && this.isWorkDay(cellDate, tdData.workDays)))) {
            clsName.push(cls.WORK_HOURS_CLASS);
        }
        addClass([ntd], clsName);
        if (this.parent.activeViewOptions.cellTemplate) {
            var dateValue = util.addLocalOffset(cellDate);
            var args_1 = { date: dateValue, type: type, groupIndex: tdData.groupIndex };
            var scheduleId = this.parent.element.id + '_';
            var viewName = this.parent.activeViewOptions.cellTemplateName;
            var templateId = scheduleId + viewName + 'cellTemplate';
            var tooltipTemplate = this.parent.getCellTemplate()(args_1, this.parent, 'cellTemplate', templateId, false);
            append([].slice.call(tooltipTemplate), ntd);
        }
        ntd.setAttribute('data-date', cellDate.getTime().toString());
        if (!isNullOrUndefined(tdData.groupIndex) || this.parent.uiStateValues.isGroupAdaptive) {
            var groupIndex = this.parent.uiStateValues.isGroupAdaptive ? this.parent.uiStateValues.groupIndex :
                tdData.groupIndex;
            ntd.setAttribute('data-group-index', '' + groupIndex);
        }
        var args = { elementType: type, element: ntd, date: cellDate, groupIndex: tdData.groupIndex };
        this.parent.trigger(event.renderCell, args);
        return ntd;
    };
    VerticalView.prototype.getContentTdClass = function (r) {
        return r.last ? [cls.WORK_CELLS_CLASS] : [cls.WORK_CELLS_CLASS, cls.ALTERNATE_CELLS_CLASS];
    };
    VerticalView.prototype.renderContentTableHeader = function (table) {
        var thead = createElement('thead');
        thead.appendChild(this.createEventWrapper());
        if (this.parent.activeViewOptions.timeScale.enable) {
            thead.appendChild(this.createEventWrapper('timeIndicator'));
        }
        prepend([thead], table);
    };
    VerticalView.prototype.createEventWrapper = function (type) {
        if (type === void 0) { type = ''; }
        var tr = createElement('tr');
        this.colLevels.slice(-1)[0].forEach(function (col, day) {
            var appointmentWrap = createElement('td', {
                className: (type === 'allDay') ? cls.ALLDAY_APPOINTMENT_WRAPPER_CLASS : (type === 'timeIndicator') ?
                    cls.TIMELINE_WRAPPER_CLASS : cls.DAY_WRAPPER_CLASS, attrs: { 'data-date': col.date.getTime().toString() }
            });
            if (!isNullOrUndefined(col.groupIndex)) {
                appointmentWrap.setAttribute('data-group-index', col.groupIndex.toString());
            }
            if (type === '') {
                var innerWrapper = createElement('div', {
                    id: cls.APPOINTMENT_WRAPPER_CLASS + '-' + day.toString(),
                    className: cls.APPOINTMENT_WRAPPER_CLASS
                });
                appointmentWrap.appendChild(innerWrapper);
            }
            tr.appendChild(appointmentWrap);
        });
        return tr;
    };
    VerticalView.prototype.getScrollableElement = function () {
        if (this.parent.isAdaptive && this.parent.currentView.indexOf('Timeline') === -1) {
            return this.element.querySelector('.' + cls.SCROLL_CONTAINER_CLASS);
        }
        else {
            return this.getContentAreaElement();
        }
    };
    VerticalView.prototype.getLeftPanelElement = function () {
        return this.element.querySelector('.' + cls.TIME_CELLS_WRAP_CLASS);
    };
    VerticalView.prototype.getEndDateFromStartDate = function (start) {
        var msMajorInterval = this.parent.activeViewOptions.timeScale.interval * util.MS_PER_MINUTE;
        var msInterval = msMajorInterval / this.parent.activeViewOptions.timeScale.slotCount;
        var end = new Date(start.getTime());
        end.setMilliseconds(end.getMilliseconds() + msInterval);
        return end;
    };
    VerticalView.prototype.getTimeSlotRows = function (handler) {
        var rows = [];
        var startHour = this.getStartHour();
        var endHour = this.getEndHour();
        var msMajorInterval = this.parent.activeViewOptions.timeScale.interval * util.MS_PER_MINUTE;
        var msInterval = msMajorInterval / this.parent.activeViewOptions.timeScale.slotCount;
        var length = Math.round(util.MS_PER_DAY / msInterval);
        var msStartHour = startHour.getTime();
        var msEndHour = endHour.getTime();
        if (msStartHour !== msEndHour) {
            var milliSeconds = (startHour.getTimezoneOffset() !== endHour.getTimezoneOffset()) ?
                (msEndHour - msStartHour) - 3600000 : (msEndHour - msStartHour);
            length = Math.round(milliSeconds / msInterval);
        }
        if (!this.parent.activeViewOptions.timeScale.enable) {
            length = 1;
        }
        var dt = new Date(msStartHour);
        var start = this.parent.getStartEndTime(this.parent.workHours.start);
        var end = this.parent.getStartEndTime(this.parent.workHours.end);
        for (var i = 0; i < length; i++) {
            var majorTickDivider = i % (msMajorInterval / msInterval);
            var row = {
                date: new Date('' + dt),
                startHour: start,
                endHour: end,
                first: (majorTickDivider === 0),
                middle: (majorTickDivider < this.parent.activeViewOptions.timeScale.slotCount - 1),
                last: (majorTickDivider === this.parent.activeViewOptions.timeScale.slotCount - 1),
                type: ''
            };
            if (handler) {
                handler(row);
            }
            rows.push(row);
            dt.setMilliseconds(msInterval);
        }
        return rows;
    };
    /**
     * Get module name.
     */
    VerticalView.prototype.getModuleName = function () {
        return 'verticalView';
    };
    /**
     * To destroy the vertical view.
     * @return {void}
     * @private
     */
    VerticalView.prototype.destroy = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.clearCurrentTimeIndicatorTimer();
        if (this.element) {
            var contentScrollableEle = this.getContentAreaElement();
            if (contentScrollableEle) {
                EventHandler.remove(contentScrollableEle, 'scroll', this.onContentScroll);
            }
            if (this.parent.resourceBase) {
                this.parent.resourceBase.destroy();
            }
            if (isBlazor()) {
                this.parent.resetLayoutTemplates();
                this.parent.resetEventTemplates();
            }
            remove(this.element);
            this.element = null;
            if (this.parent.scheduleTouchModule) {
                this.parent.scheduleTouchModule.resetValues();
            }
        }
    };
    return VerticalView;
}(ViewBase));
export { VerticalView };
