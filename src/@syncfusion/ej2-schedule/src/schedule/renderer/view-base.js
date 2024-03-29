import { createElement, append, prepend, isNullOrUndefined, getValue, getDefaultDateObject, cldrData, addClass, setStyleAttribute, formatUnit } from '@syncfusion/ej2-base';
import { getDateInMs, addDays, resetTime, WEEK_LENGTH, getWeekFirstDate, getOuterHeight, getScrollBarWidth } from '../base/util';
import * as cls from '../base/css-constant';
/**
 * view base
 */
export var ViewHelper;
(function (ViewHelper) {
    ViewHelper.getDayName = function (proxy, date) {
        return proxy.getDayNames('abbreviated')[date.getDay()];
    };
    ViewHelper.getDate = function (proxy, date) {
        return proxy.globalize.formatDate(date, { format: 'd', calendar: proxy.getCalendarMode() });
    };
    ViewHelper.getTime = function (proxy, date) {
        if (proxy.isAdaptive) {
            if (proxy.timeFormat === 'HH:mm') {
                return proxy.globalize.formatDate(date, { format: 'H', calendar: proxy.getCalendarMode() });
            }
            return proxy.globalize.formatDate(date, { skeleton: 'h', calendar: proxy.getCalendarMode() });
        }
        return proxy.getTimeString(date);
    };
    ViewHelper.getTimelineDate = function (proxy, date) {
        return proxy.globalize.formatDate(date, { skeleton: 'MMMd', calendar: proxy.getCalendarMode() }) + ', ' +
            proxy.getDayNames('wide')[date.getDay()];
    };
})(ViewHelper || (ViewHelper = {}));
var ViewBase = /** @class */ (function () {
    /**
     * Constructor
     */
    function ViewBase(parent) {
        this.parent = parent;
    }
    ViewBase.prototype.isTimelineView = function () {
        return this.parent.currentView.indexOf('Timeline') !== -1;
    };
    ViewBase.prototype.getContentRows = function () {
        return [];
    };
    ViewBase.prototype.createEventTable = function (trCount) {
        var eventTable = createElement('div', { className: cls.EVENT_TABLE_CLASS });
        append(this.getEventRows(trCount), eventTable);
        return eventTable;
    };
    ViewBase.prototype.getEventRows = function (trCount) {
        var eventRows = [];
        var eventContainer;
        for (var row = 0; row < trCount; row++) {
            eventContainer = createElement('div', { className: cls.APPOINTMENT_CONTAINER_CLASS });
            if (this.parent.resourceBase && !this.parent.uiStateValues.isGroupAdaptive && this.parent.resourceBase.renderedResources) {
                eventContainer.setAttribute('data-group-index', this.parent.resourceBase.renderedResources[row].groupIndex.toString());
            }
            eventRows.push(eventContainer);
        }
        return eventRows;
    };
    ViewBase.prototype.collapseRows = function (wrap) {
        if (!this.isTimelineView()) {
            return;
        }
        if (this.parent.activeViewOptions.group.resources.length > 0 && !this.parent.uiStateValues.isGroupAdaptive) {
            this.parent.resourceBase.hideResourceRows(wrap.querySelector('tbody'));
            this.parent.resourceBase.hideResourceRows(wrap.querySelector('.' + cls.EVENT_TABLE_CLASS));
        }
    };
    ViewBase.prototype.createTableLayout = function (className) {
        var clsName = className || '';
        var table = createElement('table', { className: cls.SCHEDULE_TABLE_CLASS + ' ' + clsName });
        var tbody = createElement('tbody');
        table.appendChild(tbody);
        return table;
    };
    ViewBase.prototype.createColGroup = function (table, lastRow) {
        var length = lastRow.length;
        if (lastRow[0] && lastRow[0].colSpan) {
            length = lastRow.map(function (value) { return value.colSpan; }).reduce(function (prev, next) { return prev + next; });
        }
        var colGroupEle = createElement('colgroup');
        for (var i = 0; i < length; i++) {
            colGroupEle.appendChild(createElement('col'));
        }
        prepend([colGroupEle], table);
    };
    ViewBase.prototype.getScrollXIndent = function (content) {
        return content.offsetHeight - content.clientHeight > 0 ? getScrollBarWidth() : 0;
    };
    ViewBase.prototype.scrollTopPanel = function (target) {
        this.getDatesHeaderElement().firstChild.scrollLeft = target.scrollLeft;
    };
    ViewBase.prototype.scrollHeaderLabels = function (target) {
        var _this = this;
        var headerTable = this.element.querySelector('.e-date-header-wrap table');
        var colWidth = headerTable.offsetWidth / headerTable.querySelectorAll('colgroup col').length;
        var applyLeft = function (headerCells, isRtl) {
            var currentCell;
            var tdLeft = 0;
            var colSpan = 0;
            var hiddenLeft = isRtl ? target.scrollWidth - target.offsetWidth - target.scrollLeft : target.scrollLeft;
            for (var i = 0; i < headerCells.length; i++) {
                colSpan += parseInt(headerCells[i].getAttribute('colSpan'), 10);
                if (colSpan > Math.floor(hiddenLeft / colWidth)) {
                    currentCell = headerCells[i];
                    break;
                }
                tdLeft += headerCells[i].offsetWidth;
            }
            currentCell.children[0].style[isRtl ? 'right' : 'left'] = (hiddenLeft - tdLeft) + 'px';
        };
        var className = ['.e-header-year-cell', '.e-header-month-cell', '.e-header-week-cell', '.e-header-cells'];
        for (var i = 0; i < className.length; i++) {
            var headerCells = [].slice.call(this.element.querySelectorAll(className[i]));
            if (headerCells.length > 0) {
                headerCells.forEach(function (element) {
                    element.children[0].style[_this.parent.enableRtl ? 'right' : 'left'] = '';
                });
                applyLeft(headerCells, this.parent.enableRtl);
            }
        }
    };
    ViewBase.prototype.addAttributes = function (td, element) {
        if (td.template) {
            append(td.template, element);
        }
        if (td.colSpan) {
            element.setAttribute('colspan', td.colSpan.toString());
        }
        if (td.className) {
            addClass([element], td.className);
        }
    };
    ViewBase.prototype.getHeaderBarHeight = function () {
        var headerBarHeight = 2;
        if (this.parent.headerModule) {
            headerBarHeight += getOuterHeight(this.parent.headerModule.getHeaderElement());
        }
        if (this.parent.uiStateValues.isGroupAdaptive) {
            var resHeader = this.parent.element.querySelector('.' + cls.RESOURCE_HEADER_TOOLBAR);
            if (resHeader) {
                headerBarHeight += resHeader.offsetHeight;
            }
        }
        return headerBarHeight;
    };
    ViewBase.prototype.renderPanel = function (type) {
        if (type === cls.PREVIOUS_PANEL_CLASS) {
            prepend([this.element], this.parent.element.querySelector('.' + cls.TABLE_CONTAINER_CLASS));
        }
        else {
            this.parent.element.querySelector('.' + cls.TABLE_CONTAINER_CLASS).appendChild(this.element);
        }
    };
    ViewBase.prototype.setPanel = function (panel) {
        this.element = panel;
    };
    ViewBase.prototype.getPanel = function () {
        return this.element;
    };
    ViewBase.prototype.getDatesHeaderElement = function () {
        return this.element.querySelector('.' + cls.DATE_HEADER_CONTAINER_CLASS);
    };
    ViewBase.prototype.getDateSlots = function (renderDates, workDays) {
        // Here getDateSlots only need in vertical and month views
        return [];
    };
    ViewBase.prototype.generateColumnLevels = function () {
        // Here generateColumnLevels only need in vertical and month views
        return [];
    };
    ViewBase.prototype.getColumnLevels = function () {
        return this.colLevels;
    };
    ViewBase.prototype.highlightCurrentTime = function () {
        // Here showTimeIndicator functionalities
    };
    ViewBase.prototype.startDate = function () {
        return this.renderDates[0];
    };
    ViewBase.prototype.endDate = function () {
        return addDays(this.renderDates[this.renderDates.length - 1], 1);
    };
    ViewBase.prototype.getStartHour = function () {
        var startHour = this.parent.getStartEndTime(this.parent.activeViewOptions.startHour);
        if (isNullOrUndefined(startHour)) {
            startHour = new Date(2000, 0, 0, 0);
        }
        return startHour;
    };
    ViewBase.prototype.getEndHour = function () {
        var endHour = this.parent.getStartEndTime(this.parent.activeViewOptions.endHour);
        if (isNullOrUndefined(endHour)) {
            endHour = new Date(2000, 0, 0, 0);
        }
        return endHour;
    };
    ViewBase.prototype.isCurrentDate = function (date) {
        return date.setHours(0, 0, 0, 0) === this.parent.getCurrentTime().setHours(0, 0, 0, 0);
    };
    ViewBase.prototype.isCurrentMonth = function (date) {
        return date.getFullYear() ===
            this.parent.getCurrentTime().getFullYear() && date.getMonth() === this.parent.getCurrentTime().getMonth();
    };
    ViewBase.prototype.isWorkDay = function (date, workDays) {
        if (workDays === void 0) { workDays = this.parent.activeViewOptions.workDays; }
        if (workDays.indexOf(date.getDay()) >= 0) {
            return true;
        }
        return false;
    };
    ViewBase.prototype.isWorkHour = function (date, startHour, endHour, workDays) {
        if (isNullOrUndefined(startHour) || isNullOrUndefined(endHour)) {
            return false;
        }
        startHour.setMilliseconds(0);
        endHour.setMilliseconds(0);
        if (getDateInMs(date) < getDateInMs(startHour) || getDateInMs(date) >= getDateInMs(endHour) || !this.isWorkDay(date, workDays)) {
            return false;
        }
        return true;
    };
    ViewBase.prototype.getRenderDates = function (workDays) {
        var renderDates = [];
        // Due to same code for vertical and time line, week & work week views, if condition has used
        if (this.parent.currentView === 'Week' || this.parent.currentView === 'TimelineWeek') {
            var selectedDate = resetTime(this.parent.selectedDate);
            var start = getWeekFirstDate(selectedDate, this.parent.activeViewOptions.firstDayOfWeek);
            for (var i = 0, length_1 = WEEK_LENGTH * this.parent.activeViewOptions.interval; i < length_1; i++) {
                if (this.parent.activeViewOptions.showWeekend) {
                    renderDates.push(start);
                }
                else {
                    if (this.isWorkDay(start, workDays)) {
                        renderDates.push(start);
                    }
                }
                start = addDays(start, 1);
            }
        }
        else if (this.parent.currentView === 'WorkWeek' || this.parent.currentView === 'TimelineWorkWeek') {
            var start = getWeekFirstDate(resetTime(this.parent.selectedDate), this.parent.activeViewOptions.firstDayOfWeek);
            for (var i = 0, length_2 = WEEK_LENGTH * this.parent.activeViewOptions.interval; i < length_2; i++) {
                if (this.isWorkDay(start, workDays)) {
                    renderDates.push(start);
                }
                start = addDays(start, 1);
            }
        }
        else {
            var start = resetTime(this.parent.selectedDate);
            do {
                if (this.parent.activeViewOptions.showWeekend) {
                    renderDates.push(start);
                }
                else {
                    if (this.isWorkDay(start, workDays)) {
                        renderDates.push(start);
                    }
                }
                start = addDays(start, 1);
            } while (this.parent.activeViewOptions.interval !== renderDates.length);
        }
        if (!workDays) {
            this.renderDates = renderDates;
        }
        return renderDates;
    };
    ViewBase.prototype.getNextPreviousDate = function (type) {
        if (this.parent.currentView === 'Day' || this.parent.currentView === 'TimelineDay') {
            if (this.parent.activeViewOptions.showWeekend) {
                var daysCount = this.parent.activeViewOptions.interval;
                return addDays(this.parent.selectedDate, type === 'next' ? daysCount : -daysCount);
            }
            else {
                var date = void 0;
                if (type === 'next') {
                    date = addDays(this.renderDates.slice(-1)[0], 1);
                    while (!this.isWorkDay(date)) {
                        date = addDays(date, 1);
                    }
                }
                else {
                    date = addDays(this.renderDates[0], -1);
                    var count = 0;
                    do {
                        if (this.isWorkDay(date)) {
                            count += 1;
                        }
                        if (this.parent.activeViewOptions.interval !== count) {
                            date = addDays(date, -1);
                        }
                    } while (this.parent.activeViewOptions.interval !== count);
                }
                return date;
            }
        }
        if (type === 'next') {
            return addDays(this.parent.selectedDate, WEEK_LENGTH * this.parent.activeViewOptions.interval);
        }
        else {
            return addDays(this.parent.selectedDate, -WEEK_LENGTH * this.parent.activeViewOptions.interval);
        }
    };
    ViewBase.prototype.getLabelText = function (view) {
        return this.parent.localeObj.getConstant(view) + ' of ' + this.parent.globalize.formatDate(this.parent.selectedDate, { skeleton: 'long', calendar: this.parent.getCalendarMode() });
    };
    ViewBase.prototype.getDateRangeText = function () {
        if (this.parent.isAdaptive) {
            return this.parent.globalize.
                formatDate(this.parent.selectedDate, { format: 'MMMM y', calendar: this.parent.getCalendarMode() });
        }
        return this.formatDateRange(this.renderDates[0], this.renderDates[this.renderDates.length - 1]);
    };
    ViewBase.prototype.formatDateRange = function (startDate, endDate) {
        var globalize = this.parent.globalize;
        if (startDate === endDate) {
            endDate = null;
        }
        if (!isNullOrUndefined(this.parent.activeViewOptions.dateFormat)) {
            if (!endDate) {
                return globalize.formatDate(startDate, { format: this.parent.activeViewOptions.dateFormat, calendar: this.parent.getCalendarMode() });
            }
            return globalize.formatDate(startDate, { format: this.parent.activeViewOptions.dateFormat, calendar: this.parent.getCalendarMode() }) + ' - ' +
                globalize.
                    formatDate(endDate, { format: this.parent.activeViewOptions.dateFormat, calendar: this.parent.getCalendarMode() });
        }
        var formattedStr;
        var longDateFormat;
        if (this.parent.locale === 'en' || this.parent.locale === 'en-US') {
            longDateFormat = getValue('dateFormats.long', getDefaultDateObject(this.parent.getCalendarMode()));
        }
        else {
            longDateFormat = getValue('main.' + '' + this.parent.locale + '.dates.calendars.' + this.parent.getCalendarMode() + '.dateFormats.long', cldrData);
        }
        if (!endDate) {
            return globalize.formatDate(startDate, { format: longDateFormat, calendar: this.parent.getCalendarMode() });
        }
        var dateFormat = longDateFormat.trim().toLocaleLowerCase();
        if (dateFormat.substr(0, 1) === 'd') {
            if (startDate.getFullYear() === endDate.getFullYear()) {
                if (startDate.getMonth() === endDate.getMonth()) {
                    formattedStr = globalize.formatDate(startDate, { format: 'dd', calendar: this.parent.getCalendarMode() }) + ' - ' +
                        globalize.formatDate(endDate, { format: 'dd MMMM yyyy', calendar: this.parent.getCalendarMode() });
                }
                else {
                    formattedStr = globalize.formatDate(startDate, { format: 'dd MMM', calendar: this.parent.getCalendarMode() }) + ' - ' +
                        globalize.formatDate(endDate, { format: 'dd MMM yyyy', calendar: this.parent.getCalendarMode() });
                }
            }
            else {
                formattedStr = globalize.formatDate(startDate, { format: 'dd MMM yyyy', calendar: this.parent.getCalendarMode() }) + ' - ' +
                    globalize.formatDate(endDate, { format: 'dd MMM yyyy', calendar: this.parent.getCalendarMode() });
            }
        }
        else if (dateFormat.substr(0, 1) === 'm') {
            if (startDate.getFullYear() === endDate.getFullYear()) {
                if (startDate.getMonth() === endDate.getMonth()) {
                    formattedStr = globalize.formatDate(startDate, { format: 'MMMM dd', calendar: this.parent.getCalendarMode() }) + ' - ' +
                        globalize.formatDate(endDate, { format: 'dd, yyyy', calendar: this.parent.getCalendarMode() });
                }
                else {
                    formattedStr = globalize.formatDate(startDate, { format: 'MMM dd', calendar: this.parent.getCalendarMode() }) + ' - ' +
                        globalize.formatDate(endDate, { format: 'MMM dd, yyyy', calendar: this.parent.getCalendarMode() });
                }
            }
            else {
                formattedStr = globalize.
                    formatDate(startDate, { format: 'MMM dd, yyyy', calendar: this.parent.getCalendarMode() }) + ' - ' +
                    globalize.formatDate(endDate, { format: 'MMM dd, yyyy', calendar: this.parent.getCalendarMode() });
            }
        }
        else {
            formattedStr = globalize.formatDate(startDate, { format: longDateFormat, calendar: this.parent.getCalendarMode() }) + ' - ' +
                globalize.formatDate(endDate, { format: longDateFormat, calendar: this.parent.getCalendarMode() });
        }
        return formattedStr;
    };
    ViewBase.prototype.getMobileDateElement = function (date, className) {
        var wrap = createElement('div', {
            className: className,
            innerHTML: '<div class="e-m-date">' + this.parent.globalize.formatDate(date, { format: 'd', calendar: this.parent.getCalendarMode() }) + '</div>' + '<div class="e-m-day">' +
                this.parent.globalize.formatDate(date, { format: 'E', calendar: this.parent.getCalendarMode() }) + '</div>'
        });
        return wrap;
    };
    ViewBase.prototype.setResourceHeaderContent = function (tdElement, tdData, className) {
        if (className === void 0) { className = 'e-text-ellipsis'; }
        if (this.parent.activeViewOptions.resourceHeaderTemplate) {
            var data = { resource: tdData.resource, resourceData: tdData.resourceData };
            var scheduleId = this.parent.element.id + '_';
            var viewName = this.parent.activeViewOptions.resourceHeaderTemplateName;
            var templateId = scheduleId + viewName + 'resourceHeaderTemplate';
            var quickTemplate = this.parent.getResourceHeaderTemplate()(data, this.parent, 'resourceHeaderTemplate', templateId, false);
            append(quickTemplate, tdElement);
        }
        else {
            tdElement.appendChild(createElement('div', {
                className: className, innerHTML: tdData.resourceData[tdData.resource.textField]
            }));
        }
    };
    ViewBase.prototype.renderResourceMobileLayout = function () {
        if (this.parent.resourceBase.lastResourceLevel && this.parent.resourceBase.lastResourceLevel.length <= 0) {
            return;
        }
        this.parent.resourceBase.renderResourceHeader();
        this.parent.resourceBase.renderResourceTree();
    };
    ViewBase.prototype.addAutoHeightClass = function (element) {
        if (!this.parent.uiStateValues.isGroupAdaptive && this.parent.rowAutoHeight && this.isTimelineView()
            && this.parent.activeViewOptions.group.resources.length > 0) {
            addClass([element], cls.AUTO_HEIGHT);
        }
    };
    ViewBase.prototype.getColElements = function () {
        return [].slice.call(this.parent.element.querySelectorAll('.' + cls.CONTENT_WRAP_CLASS
            + ' col, .' + cls.DATE_HEADER_WRAP_CLASS + ' col'));
    };
    ViewBase.prototype.setColWidth = function (content) {
        if (this.isTimelineView()) {
            var colElements = this.getColElements();
            var colWidth_1 = Math.ceil(this.parent.getContentTable().offsetWidth / (colElements.length / 2));
            colElements.forEach(function (col) { return setStyleAttribute(col, { 'width': formatUnit(colWidth_1) }); });
            if (content.offsetHeight !== content.clientHeight) {
                var resourceColumn = this.parent.element.querySelector('.' + cls.RESOURCE_COLUMN_WRAP_CLASS);
                if (!isNullOrUndefined(resourceColumn)) {
                    setStyleAttribute(resourceColumn, {
                        'height': formatUnit(content.clientHeight)
                    });
                }
            }
        }
    };
    ViewBase.prototype.resetColWidth = function () {
        var colElements = this.getColElements();
        colElements.forEach(function (col) { return col.style.width = ''; });
    };
    ViewBase.prototype.getContentAreaElement = function () {
        return this.element.querySelector('.' + cls.CONTENT_WRAP_CLASS);
    };
    return ViewBase;
}());
export { ViewBase };
