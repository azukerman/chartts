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
import { EventHandler, formatUnit, isNullOrUndefined } from '@syncfusion/ej2-base';
import { createElement, remove, addClass, append, prepend } from '@syncfusion/ej2-base';
import { ViewBase } from './view-base';
import * as util from '../base/util';
import * as event from '../base/constant';
import * as cls from '../base/css-constant';
import { MonthEvent } from '../event-renderer/month';
/**
 * month view
 */
var Month = /** @class */ (function (_super) {
    __extends(Month, _super);
    /**
     * Constructor for month view
     */
    function Month(parent) {
        var _this = _super.call(this, parent) || this;
        _this.dayNameFormat = 'wide';
        _this.viewClass = 'e-month-view';
        _this.isInverseTableSelect = false;
        _this.monthDates = {};
        return _this;
    }
    Month.prototype.addEventListener = function () {
        this.parent.on(event.scrollUiUpdate, this.onScrollUIUpdate, this);
        this.parent.on(event.dataReady, this.onDataReady, this);
        this.parent.on(event.cellClick, this.onCellClick, this);
    };
    Month.prototype.removeEventListener = function () {
        this.parent.off(event.scrollUiUpdate, this.onScrollUIUpdate);
        this.parent.off(event.dataReady, this.onDataReady);
        this.parent.off(event.cellClick, this.onCellClick);
    };
    Month.prototype.onDataReady = function (args) {
        var monthEvent = new MonthEvent(this.parent);
        monthEvent.renderAppointments();
        this.parent.notify(event.eventsLoaded, {});
    };
    Month.prototype.onCellClick = function (event) {
        // Here cell click
    };
    Month.prototype.onContentScroll = function (e) {
        this.parent.removeNewEventElement();
        this.parent.notify(event.virtualScroll, e);
        this.scrollTopPanel(e.target);
        this.scrollLeftPanel(e.target);
    };
    Month.prototype.scrollLeftPanel = function (target) {
        var leftPanel = this.getLeftPanelElement();
        if (leftPanel) {
            leftPanel.scrollTop = target.scrollTop;
        }
    };
    Month.prototype.getLeftPanelElement = function () {
        return this.element.querySelector('.' + cls.WEEK_NUMBER_WRAPPER_CLASS);
    };
    Month.prototype.onScrollUIUpdate = function (args) {
        var headerHeight = this.getHeaderBarHeight();
        var header = this.getDatesHeaderElement();
        var content = this.getContentAreaElement();
        var height = this.parent.element.offsetHeight - headerHeight - header.offsetHeight;
        var leftPanel = this.getLeftPanelElement();
        this.setContentHeight(content, leftPanel, height);
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
        this.setColWidth(content);
        if (args.scrollPosition) {
            content.scrollTop = args.scrollPosition.top;
            content.scrollLeft = args.scrollPosition.left;
        }
        else {
            var headerCell = document.querySelector('.' + cls.HEADER_CELLS_CLASS + '[data-date="'
                + this.parent.selectedDate.getTime() + '"]');
            content.scrollLeft = headerCell !== null ? headerCell.offsetLeft : 0;
        }
    };
    Month.prototype.setContentHeight = function (content, leftPanelElement, height) {
        content.style.height = 'auto';
        if (this.parent.currentView === 'Month') {
            content.style.height = formatUnit(height);
        }
        if (leftPanelElement) {
            if (this.parent.currentView === 'MonthAgenda') {
                height = this.element.querySelector('.' + cls.CONTENT_TABLE_CLASS).offsetHeight;
            }
            leftPanelElement.style.height = 'auto';
            leftPanelElement.style.height = formatUnit(height - this.getScrollXIndent(content));
        }
    };
    Month.prototype.generateColumnLevels = function () {
        var colLevels = [];
        var level = this.getDateSlots(this.renderDates, this.parent.activeViewOptions.workDays);
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            colLevels = this.parent.resourceBase.generateResourceLevels(level);
            if (this.parent.currentView === 'MonthAgenda') {
                colLevels = [level];
            }
            if (this.parent.uiStateValues.isGroupAdaptive && this.parent.resourceBase.lastResourceLevel.length > 0) {
                var resourceLevel = this.parent.resourceBase.lastResourceLevel[this.parent.uiStateValues.groupIndex];
                colLevels = [this.getDateSlots(resourceLevel.renderDates, resourceLevel.workDays)];
            }
        }
        else {
            colLevels.push(level);
        }
        this.colLevels = colLevels;
        return colLevels;
    };
    Month.prototype.getDateSlots = function (renderDates, workDays) {
        var count = this.parent.activeViewOptions.showWeekend ? util.WEEK_LENGTH : workDays.length;
        var dateSlots = [];
        for (var col = 0; col < count; col++) {
            var classList = [cls.HEADER_CELLS_CLASS];
            var currentDateIndex = renderDates.slice(0, count).map(function (date) { return date.getDay(); });
            if (this.isCurrentMonth(this.parent.selectedDate) && currentDateIndex.indexOf(this.parent.getCurrentTime().getDay()) === col) {
                classList.push(cls.CURRENT_DAY_CLASS);
            }
            dateSlots.push({ date: renderDates[col], type: 'monthDay', className: classList, colSpan: 1, workDays: workDays });
        }
        return dateSlots;
    };
    Month.prototype.getDayNameFormat = function () {
        if (this.parent.isAdaptive || this.parent.activeViewOptions.group.resources.length > 0) {
            return 'abbreviated';
        }
        return 'wide';
    };
    Month.prototype.renderLayout = function (type) {
        this.dayNameFormat = this.getDayNameFormat();
        this.setPanel(createElement('div', { className: cls.TABLE_WRAP_CLASS }));
        var clsList = [this.viewClass];
        clsList.push(type);
        if (this.parent.activeViewOptions.group.byDate) {
            clsList.push('e-by-date');
        }
        if (this.parent.activeViewOptions.allowVirtualScrolling) {
            clsList.push(cls.VIRTUAL_SCROLL_CLASS);
        }
        addClass([this.element], clsList);
        this.renderPanel(type);
        this.element.appendChild(this.createTableLayout(cls.OUTER_TABLE_CLASS));
        this.colLevels = this.generateColumnLevels();
        this.renderHeader();
        this.renderContent();
        var target = (this.parent.currentView === 'MonthAgenda') ? this.parent.activeView.getPanel() : this.parent.element;
        if (this.parent.uiStateValues.isGroupAdaptive && !target.querySelector('.' + cls.RESOURCE_TOOLBAR_CONTAINER)) {
            this.renderResourceMobileLayout();
        }
        this.parent.notify(event.contentReady, {});
        this.parent.updateLayoutTemplates();
    };
    Month.prototype.wireCellEvents = function (element) {
        EventHandler.add(element, 'mousedown', this.parent.workCellAction.cellMouseDown, this.parent.workCellAction);
        EventHandler.add(element, 'click', this.parent.workCellAction.cellClick, this.parent.workCellAction);
        if (!this.parent.isAdaptive) {
            EventHandler.add(element, 'dblclick', this.parent.workCellAction.cellDblClick, this.parent.workCellAction);
        }
    };
    Month.prototype.renderHeader = function () {
        var tr = createElement('tr');
        this.renderLeftIndent(tr);
        var dateTd = createElement('td');
        dateTd.appendChild(this.renderDatesHeader());
        tr.appendChild(dateTd);
        prepend([tr], this.element.querySelector('tbody'));
    };
    Month.prototype.renderLeftIndent = function (tr) {
        if (this.parent.activeViewOptions.showWeekNumber) {
            tr.appendChild(createElement('td', { className: 'e-left-indent' }));
        }
    };
    Month.prototype.renderContent = function () {
        var tr = createElement('tr');
        if (this.parent.activeViewOptions.showWeekNumber) {
            tr.appendChild(this.renderWeekNumberContent());
        }
        var workTd = createElement('td');
        var wrap = createElement('div', { className: cls.CONTENT_WRAP_CLASS });
        var contentArea = this.renderContentArea();
        if (this.parent.currentView === 'Month') {
            wrap.appendChild(contentArea);
        }
        else {
            var monthAgendaWrapper = createElement('div', { className: cls.TABLE_CONTAINER_CLASS });
            monthAgendaWrapper.appendChild(contentArea);
            wrap.appendChild(monthAgendaWrapper);
        }
        EventHandler.add(wrap, 'scroll', this.onContentScroll, this);
        workTd.appendChild(wrap);
        tr.appendChild(workTd);
        this.element.querySelector('tbody').appendChild(tr);
        this.renderAppointmentContainer();
    };
    Month.prototype.renderWeekNumberContent = function () {
        var dateCol = this.renderDates.map(function (date) { return new Date(+date); });
        var td = createElement('td');
        var contentWrapper = createElement('div', { className: cls.WEEK_NUMBER_WRAPPER_CLASS });
        td.appendChild(contentWrapper);
        var contentWrapTable = this.createTableLayout();
        contentWrapper.appendChild(contentWrapTable);
        var noOfDays = this.parent.activeViewOptions.showWeekend ? util.WEEK_LENGTH :
            this.parent.activeViewOptions.workDays.length;
        for (var i = 0, length_1 = (this.renderDates.length / noOfDays); i < length_1; i++) {
            var dates = dateCol.splice(0, noOfDays);
            var weekNumber = util.getWeekNumber(dates.slice(-1)[0]).toString();
            contentWrapTable.querySelector('tbody').appendChild(this.createWeekNumberElement(weekNumber));
        }
        return td;
    };
    Month.prototype.renderAppointmentContainer = function () {
        //Here needs to render mobile view appointment details on selected date
    };
    Month.prototype.renderDatesHeader = function () {
        var container = createElement('div', { className: cls.DATE_HEADER_CONTAINER_CLASS });
        var wrap = createElement('div', { className: cls.DATE_HEADER_WRAP_CLASS });
        container.appendChild(wrap);
        var table = this.createTableLayout();
        this.createColGroup(table, this.colLevels[this.colLevels.length - 1]);
        var trEle = createElement('tr');
        for (var i = 0; i < this.colLevels.length; i++) {
            var level = this.colLevels[i];
            var ntr = trEle.cloneNode();
            for (var j = 0; j < level.length; j++) {
                var td = level[j];
                ntr.appendChild(this.createHeaderCell(td));
            }
            table.querySelector('tbody').appendChild(ntr);
        }
        wrap.appendChild(table);
        return container;
    };
    Month.prototype.createHeaderCell = function (td) {
        var tdEle = createElement('td');
        this.addAttributes(td, tdEle);
        if (td.type === 'monthDay') {
            var ele = createElement('span', { innerHTML: this.parent.getDayNames(this.dayNameFormat)[td.date.getDay()] });
            tdEle.appendChild(ele);
        }
        if (td.type === 'resourceHeader') {
            this.setResourceHeaderContent(tdEle, td);
        }
        if (td.type === 'dateHeader') {
            addClass([tdEle], cls.DATE_HEADER_CLASS);
            tdEle.setAttribute('data-date', td.date.getTime().toString());
            if (this.parent.activeViewOptions.dateHeaderTemplate) {
                var dateValue = util.addLocalOffset(td.date);
                var cellArgs = { date: dateValue, type: td.type };
                var elementId = this.parent.element.id + '_';
                var viewName = this.parent.activeViewOptions.dateHeaderTemplateName;
                var templateId = elementId + viewName + 'dateHeaderTemplate';
                var dateTemplate = this.parent.getDateHeaderTemplate()(cellArgs, this.parent, 'dateHeaderTemplate', templateId, false);
                if (dateTemplate && dateTemplate.length) {
                    append([].slice.call(dateTemplate), tdEle);
                }
            }
            else {
                var ele = createElement('span', { className: cls.NAVIGATE_CLASS });
                var title = this.parent.globalize.formatDate(td.date, { skeleton: 'full', calendar: this.parent.getCalendarMode() });
                ele.setAttribute('title', title);
                ele.innerHTML =
                    (this.parent.calendarUtil.isMonthStart(td.date) && !this.isCurrentDate(td.date) && !this.parent.isAdaptive) ?
                        this.parent.globalize.formatDate(td.date, { format: 'MMM d', calendar: this.parent.getCalendarMode() }) :
                        this.parent.globalize.formatDate(td.date, { skeleton: 'd', calendar: this.parent.getCalendarMode() });
                tdEle.appendChild(ele);
            }
            this.wireCellEvents(tdEle);
        }
        var args = { elementType: td.type, element: tdEle, date: td.date, groupIndex: td.groupIndex };
        this.parent.trigger(event.renderCell, args);
        return tdEle;
    };
    Month.prototype.getContentSlots = function () {
        if (!(this.colLevels[this.colLevels.length - 1] && this.colLevels[this.colLevels.length - 1][0])) {
            return [];
        }
        var slotDatas = [];
        var prepareSlots = function (rowIndex, renderDate, resData, classList) {
            var data = {
                date: new Date(+renderDate), groupIndex: resData.groupIndex, workDays: resData.workDays,
                type: 'monthCells', className: classList || [cls.WORK_CELLS_CLASS]
            };
            if (!slotDatas[rowIndex]) {
                slotDatas[rowIndex] = [];
            }
            slotDatas[rowIndex].push(data);
        };
        var includeResource = this.parent.currentView !== 'MonthAgenda' &&
            this.parent.activeViewOptions.group.resources.length > 0;
        if (includeResource && !this.parent.uiStateValues.isGroupAdaptive && !this.parent.activeViewOptions.group.byDate) {
            for (var _i = 0, _a = this.colLevels[this.colLevels.length - 2]; _i < _a.length; _i++) {
                var res = _a[_i];
                var dates = res.renderDates.map(function (date) { return new Date(+date); });
                var count = this.parent.activeViewOptions.showWeekend ? util.WEEK_LENGTH : res.workDays.length;
                for (var i = 0; i < (res.renderDates.length / count); i++) {
                    var colDates = dates.splice(0, count);
                    for (var _b = 0, colDates_1 = colDates; _b < colDates_1.length; _b++) {
                        var colDate = colDates_1[_b];
                        prepareSlots(i, colDate, res);
                    }
                }
            }
        }
        else {
            var dates = this.renderDates.map(function (date) { return new Date(+date); });
            var count = this.parent.activeViewOptions.showWeekend ? util.WEEK_LENGTH :
                this.parent.activeViewOptions.workDays.length;
            for (var i = 0; i < (this.renderDates.length / count); i++) {
                var colDates = dates.splice(0, count);
                for (var _c = 0, colDates_2 = colDates; _c < colDates_2.length; _c++) {
                    var colDate = colDates_2[_c];
                    if (includeResource) {
                        var lastRow = this.colLevels[(this.colLevels.length - 1)];
                        var resourcesTd = lastRow.slice(0, lastRow.length / count);
                        for (var resIndex = 0; resIndex < resourcesTd.length; resIndex++) {
                            var clsList = void 0;
                            if (resIndex !== 0) {
                                clsList = [cls.WORK_CELLS_CLASS, cls.DISABLE_DATE];
                            }
                            prepareSlots(i, colDate, resourcesTd[resIndex], clsList);
                        }
                    }
                    else {
                        prepareSlots(i, colDate, this.colLevels[this.colLevels.length - 1][0]);
                    }
                }
            }
        }
        return slotDatas;
    };
    Month.prototype.updateClassList = function (data) {
        if (this.isOtherMonth(data.date)) {
            data.className.push(cls.OTHERMONTH_CLASS);
        }
        if (this.parent.currentView === 'MonthAgenda' && this.parent.isSelectedDate(data.date)) {
            data.className.push(cls.SELECTED_CELL_CLASS);
        }
    };
    Month.prototype.isOtherMonth = function (date) {
        return date.getTime() < this.monthDates.start.getTime() || date.getTime() > this.monthDates.end.getTime();
    };
    Month.prototype.renderContentArea = function () {
        var tbl = this.createTableLayout(cls.CONTENT_TABLE_CLASS);
        this.addAutoHeightClass(tbl);
        if (this.parent.currentView === 'TimelineMonth') {
            this.createColGroup(tbl, this.colLevels[this.colLevels.length - 1]);
        }
        var monthDate = new Date(this.parent.selectedDate.getTime());
        this.monthDates = {
            start: this.parent.calendarUtil.firstDateOfMonth(monthDate),
            end: this.parent.calendarUtil.lastDateOfMonth(util.addMonths(monthDate, this.parent.activeViewOptions.interval - 1))
        };
        var tBody = tbl.querySelector('tbody');
        append(this.getContentRows(), tBody);
        this.wireCellEvents(tBody);
        return tbl;
    };
    Month.prototype.getContentRows = function () {
        var trows = [];
        var tr = createElement('tr', { attrs: { role: 'row' } });
        var td = createElement('td', { attrs: { role: 'gridcell', 'aria-selected': 'false' } });
        var slotDatas = this.getContentSlots();
        for (var row = 0; row < slotDatas.length; row++) {
            var ntr = tr.cloneNode();
            for (var col = 0; col < slotDatas[row].length; col++) {
                var ntd = this.createContentTd(slotDatas[row][col], td);
                ntr.appendChild(ntd);
            }
            trows.push(ntr);
        }
        return trows;
    };
    Month.prototype.createContentTd = function (data, td) {
        var ntd = td.cloneNode();
        if (data.colSpan) {
            ntd.setAttribute('colspan', data.colSpan.toString());
        }
        this.updateClassList(data);
        var type = data.type;
        if (data.className.indexOf(cls.RESOURCE_PARENT_CLASS) !== -1) {
            data.className.push(cls.RESOURCE_GROUP_CELLS_CLASS);
            type = 'resourceGroupCells';
        }
        if (this.parent.workHours.highlight && this.isWorkDay(data.date, data.workDays)) {
            data.className.push(cls.WORKDAY_CLASS);
        }
        if (this.isCurrentDate(data.date)) {
            data.className.push(cls.CURRENTDATE_CLASS);
        }
        addClass([ntd], data.className);
        ntd.setAttribute('data-date', data.date.getTime().toString());
        if (!isNullOrUndefined(data.groupIndex) || this.parent.uiStateValues.isGroupAdaptive) {
            var groupIndex = this.parent.uiStateValues.isGroupAdaptive ? this.parent.uiStateValues.groupIndex :
                data.groupIndex;
            ntd.setAttribute('data-group-index', '' + groupIndex);
        }
        this.renderDateHeaderElement(data, ntd);
        if (this.parent.activeViewOptions.cellTemplate) {
            var dateValue = util.addLocalOffset(data.date);
            var args_1 = { date: dateValue, type: type, groupIndex: data.groupIndex };
            var scheduleId = this.parent.element.id + '_';
            var viewName = this.parent.activeViewOptions.cellTemplateName;
            var templateId = scheduleId + viewName + 'cellTemplate';
            var cellTemplate = this.parent.getCellTemplate()(args_1, this.parent, 'cellTemplate', templateId, false);
            append([].slice.call(cellTemplate), ntd);
        }
        var args = { elementType: type, element: ntd, date: data.date, groupIndex: data.groupIndex };
        this.parent.trigger(event.renderCell, args);
        return ntd;
    };
    Month.prototype.renderDateHeaderElement = function (data, ntd) {
        if (this.parent.currentView === 'TimelineMonth') {
            return;
        }
        var dateHeader = createElement('div', { className: cls.DATE_HEADER_CLASS });
        if (this.parent.activeViewOptions.cellHeaderTemplate) {
            var dateValue = util.addLocalOffset(data.date);
            var args = { date: dateValue, type: data.type, groupIndex: data.groupIndex };
            var scheduleId = this.parent.element.id + '_';
            var viewName = this.parent.activeViewOptions.cellHeaderTemplateName;
            var templateId = scheduleId + viewName + 'cellHeaderTemplate';
            var cellheaderTemplate = this.parent.getCellHeaderTemplate()(args, this.parent, 'cellHeaderTemplate', templateId, false);
            append([].slice.call(cellheaderTemplate), dateHeader);
        }
        else {
            dateHeader.innerHTML =
                (this.parent.calendarUtil.isMonthStart(data.date) && !this.isCurrentDate(data.date) && !this.parent.isAdaptive) ?
                    this.parent.globalize.formatDate(data.date, { format: 'MMM d', calendar: this.parent.getCalendarMode() }) :
                    this.parent.globalize.formatDate(data.date, { skeleton: 'd', calendar: this.parent.getCalendarMode() });
        }
        ntd.appendChild(dateHeader);
        if (this.getModuleName() === 'month') {
            addClass([dateHeader], cls.NAVIGATE_CLASS);
        }
    };
    Month.prototype.getMonthStart = function (currentDate) {
        var monthStart = util.getWeekFirstDate(this.parent.calendarUtil.firstDateOfMonth(currentDate), this.parent.activeViewOptions.firstDayOfWeek);
        var start = new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate());
        return start;
    };
    Month.prototype.getMonthEnd = function (currentDate) {
        var endDate = util.addMonths(currentDate, this.parent.activeViewOptions.interval - 1);
        var lastWeekOfMonth = util.getWeekFirstDate(this.parent.calendarUtil.lastDateOfMonth(endDate), this.parent.activeViewOptions.firstDayOfWeek);
        var monthEnd = util.addDays(lastWeekOfMonth, util.WEEK_LENGTH - 1);
        return monthEnd;
    };
    Month.prototype.getRenderDates = function (workDays) {
        var renderDates = [];
        var currentDate = util.resetTime(this.parent.selectedDate);
        var start = this.getMonthStart(currentDate);
        var monthEnd = this.getMonthEnd(currentDate);
        do {
            if (this.parent.activeViewOptions.showWeekend) {
                renderDates.push(start);
            }
            else {
                if (this.isWorkDay(start, workDays)) {
                    renderDates.push(start);
                }
            }
            start = util.addDays(start, 1);
        } while (start.getTime() <= monthEnd.getTime());
        if (!workDays) {
            this.renderDates = renderDates;
        }
        return renderDates;
    };
    Month.prototype.getNextPreviousDate = function (type) {
        if (type === 'next') {
            return util.addMonths(this.parent.selectedDate, this.parent.activeViewOptions.interval);
        }
        else {
            return util.addMonths(this.parent.selectedDate, -(this.parent.activeViewOptions.interval));
        }
    };
    Month.prototype.getEndDateFromStartDate = function (start) {
        return util.addDays(new Date(start.getTime()), 1);
    };
    Month.prototype.getDateRangeText = function () {
        if (this.parent.isAdaptive || isNullOrUndefined(this.parent.activeViewOptions.dateFormat)) {
            if (this.parent.activeViewOptions.interval > 1) {
                var endDate = util.addMonths(util.lastDateOfMonth(this.parent.selectedDate), this.parent.activeViewOptions.interval - 1);
                if (this.parent.selectedDate.getFullYear() === endDate.getFullYear()) {
                    var monthNames = (this.parent.globalize.formatDate(this.parent.selectedDate, { format: 'MMMM', calendar: this.parent.getCalendarMode() })) + ' - ' +
                        (this.parent.globalize.formatDate(endDate, { format: 'MMMM ', calendar: this.parent.getCalendarMode() })) +
                        endDate.getFullYear();
                    return monthNames;
                }
                return (this.parent.globalize.formatDate(this.parent.selectedDate, { format: 'MMMM', calendar: this.parent.getCalendarMode() })) + ' ' +
                    this.parent.selectedDate.getFullYear() + ' - ' + (this.parent.globalize.formatDate(endDate, { format: 'MMMM ', calendar: this.parent.getCalendarMode() })) +
                    endDate.getFullYear();
            }
            return this.parent.globalize.
                formatDate(this.parent.selectedDate, { format: 'MMMM y', calendar: this.parent.getCalendarMode() });
        }
        return this.formatDateRange(this.parent.selectedDate);
    };
    Month.prototype.getLabelText = function (view) {
        return this.parent.localeObj.getConstant(view) + ' of ' +
            this.parent.globalize.formatDate(this.parent.selectedDate, { format: 'MMMM y', calendar: this.parent.getCalendarMode() });
    };
    Month.prototype.createWeekNumberElement = function (text) {
        var tr = createElement('tr');
        var td = createElement('td', {
            className: cls.WEEK_NUMBER_CLASS,
            attrs: { 'title': (text ? this.parent.localeObj.getConstant('week') + ' ' + text : '') },
            innerHTML: (text || '')
        });
        tr.appendChild(td);
        var args = { elementType: 'weekNumberCell', element: td };
        this.parent.trigger(event.renderCell, args);
        return tr;
    };
    Month.prototype.unwireEvents = function () {
        // No scroller events for month view
    };
    /**
     * Get module name.
     */
    Month.prototype.getModuleName = function () {
        return 'month';
    };
    /**
     * To destroy the month.
     * @return {void}
     * @private
     */
    Month.prototype.destroy = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        if (this.element) {
            this.unwireEvents();
            if (this.parent.resourceBase) {
                this.parent.resourceBase.destroy();
            }
            remove(this.element);
            this.element = null;
            if (this.parent.scheduleTouchModule) {
                this.parent.scheduleTouchModule.resetValues();
            }
        }
    };
    return Month;
}(ViewBase));
export { Month };
