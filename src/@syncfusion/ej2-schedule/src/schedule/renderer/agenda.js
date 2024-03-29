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
import { formatUnit, isNullOrUndefined, closest, extend, append, prepend } from '@syncfusion/ej2-base';
import { createElement, remove, addClass, EventHandler } from '@syncfusion/ej2-base';
import { AgendaBase } from '../event-renderer/agenda-base';
import { ViewBase } from './view-base';
import * as util from '../base/util';
import * as event from '../base/constant';
import * as cls from '../base/css-constant';
/**
 * agenda view
 */
var Agenda = /** @class */ (function (_super) {
    __extends(Agenda, _super);
    /**
     * Constructor for agenda view
     */
    function Agenda(parent) {
        var _this = _super.call(this, parent) || this;
        _this.viewClass = 'e-agenda-view';
        _this.isInverseTableSelect = false;
        _this.agendaDates = {};
        _this.virtualScrollTop = 1;
        _this.minDate = new Date(1900, 0, 1);
        _this.maxDate = new Date(2099, 11, 31);
        _this.agendaBase = new AgendaBase(parent);
        return _this;
    }
    /**
     * Get module name.
     */
    Agenda.prototype.getModuleName = function () {
        return 'agenda';
    };
    Agenda.prototype.renderLayout = function () {
        this.agendaDates = {};
        this.element = createElement('div', { className: cls.TABLE_WRAP_CLASS });
        addClass([this.element], this.viewClass);
        this.element.appendChild(this.createTableLayout(cls.OUTER_TABLE_CLASS));
        this.parent.element.querySelector('.' + cls.TABLE_CONTAINER_CLASS).appendChild(this.element);
        var eTr = createElement('tr');
        this.element.querySelector('tbody').appendChild(eTr);
        var workTd = createElement('td');
        eTr.appendChild(workTd);
        var wrap = createElement('div', { className: cls.CONTENT_WRAP_CLASS });
        workTd.appendChild(wrap);
        var tbl = this.createTableLayout(cls.CONTENT_TABLE_CLASS);
        wrap.appendChild(tbl);
        var tBody = tbl.querySelector('tbody');
        var agendaDate = util.resetTime(this.parent.selectedDate);
        this.agendaBase.renderEmptyContent(tBody, agendaDate);
        this.wireEvents();
        if (this.parent.resourceBase) {
            this.parent.resourceBase.generateResourceLevels([{ renderDates: this.parent.activeView.renderDates }]);
        }
        if (this.parent.uiStateValues.isGroupAdaptive && !this.parent.element.querySelector('.' + cls.RESOURCE_TOOLBAR_CONTAINER)) {
            this.renderResourceMobileLayout();
        }
        this.parent.notify(event.contentReady, {});
    };
    Agenda.prototype.eventLoad = function (args) {
        this.dataSource = extend([], this.parent.eventsData, null, true);
        for (var _i = 0, _a = this.parent.eventsData; _i < _a.length; _i++) {
            var event_1 = _a[_i];
            delete event_1.generatedDates;
        }
        var eventCollection = args.processedData;
        if (this.parent.uiStateValues.isGroupAdaptive) {
            var resource = this.parent.resourceBase.lastResourceLevel[this.parent.uiStateValues.groupIndex];
            this.dataSource = this.parent.eventBase.filterEventsByResource(resource, this.dataSource);
            eventCollection = this.parent.eventBase.filterEventsByResource(resource, eventCollection);
        }
        this.parent.eventsProcessed = this.agendaBase.processAgendaEvents(eventCollection);
        var agendaDate = util.resetTime(this.parent.selectedDate);
        var tBody = this.parent.getContentTable();
        util.removeChildren(tBody);
        this.renderInitialContent(tBody, agendaDate);
        this.agendaBase.wireEventActions();
        var contentArea = closest(tBody, '.' + cls.CONTENT_WRAP_CLASS);
        contentArea.scrollTop = 1;
        this.parent.notify(event.eventsLoaded, {});
    };
    Agenda.prototype.refreshEvent = function (refreshDate) {
        var processedData = [];
        for (var _i = 0, _a = this.dataSource; _i < _a.length; _i++) {
            var eventData = _a[_i];
            var fields = this.parent.eventFields;
            var data = eventData;
            if (isNullOrUndefined(data[fields.recurrenceID]) && !isNullOrUndefined(data[fields.recurrenceRule]) &&
                !isNullOrUndefined(data.generatedDates) && refreshDate >= data.generatedDates.end) {
                processedData = processedData.concat(this.parent.eventBase.generateOccurrence(data, refreshDate));
            }
        }
        this.parent.eventsProcessed = this.parent.eventsProcessed.concat(this.agendaBase.processAgendaEvents(processedData));
    };
    Agenda.prototype.renderInitialContent = function (tBody, agendaDate) {
        var emptyTBody = createElement('tbody');
        var firstDate = new Date(agendaDate.getTime());
        var lastDate = (this.parent.activeViewOptions.allowVirtualScrolling && this.parent.hideEmptyAgendaDays) ?
            this.getEndDateFromStartDate(firstDate) : util.addDays(firstDate, this.parent.agendaDaysCount);
        this.renderContent(emptyTBody, firstDate, lastDate);
        append([].slice.call(emptyTBody.childNodes), tBody);
        // Initial rendering, to load previous date events upto scroll bar enable
        if (this.parent.activeViewOptions.allowVirtualScrolling && this.parent.hideEmptyAgendaDays && this.parent.eventsData.length > 0) {
            var contentArea = this.getContentAreaElement();
            while (contentArea.offsetWidth <= contentArea.clientWidth) {
                var emptyTBody_1 = createElement('tbody');
                lastDate = firstDate;
                firstDate = util.addDays(lastDate, -this.parent.agendaDaysCount);
                this.renderContent(emptyTBody_1, firstDate, lastDate);
                prepend([].slice.call(emptyTBody_1.childNodes), tBody);
                if (firstDate <= this.minDate) {
                    break;
                }
            }
        }
        if (tBody.childNodes.length <= 0) {
            this.agendaBase.renderEmptyContent(tBody, agendaDate);
        }
    };
    Agenda.prototype.renderContent = function (tBody, agendaDate, lastDate) {
        var fieldMapping = this.parent.eventFields;
        var firstDate = new Date(agendaDate.getTime());
        var isObject = this.appointmentFiltering(firstDate, lastDate);
        if (isObject.length > 0 && this.parent.activeViewOptions.allowVirtualScrolling && this.parent.hideEmptyAgendaDays) {
            var appoint = isObject;
            agendaDate = appoint[0][fieldMapping.startTime];
            agendaDate = new Date(new Date(agendaDate.getTime()).setHours(0, 0, 0, 0));
            this.updateHeaderText(appoint[0][fieldMapping.startTime]);
        }
        var endDate;
        if (!this.parent.hideEmptyAgendaDays || (this.parent.agendaDaysCount > 0 && isObject.length > 0)) {
            if (this.parent.activeViewOptions.group.resources.length > 0 && !this.parent.uiStateValues.isGroupAdaptive) {
                var date = agendaDate;
                if (!this.parent.activeViewOptions.group.byDate) {
                    this.parent.activeViewOptions.allowVirtualScrolling = false;
                    date = firstDate;
                    if (this.parent.headerModule) {
                        this.parent.headerModule.updateDateRange(this.parent.activeView.getDateRangeText());
                        this.parent.headerModule.updateHeaderItems('remove');
                    }
                }
                this.agendaBase.calculateResourceTableElement(tBody, this.parent.agendaDaysCount, date);
            }
            else {
                for (var day = 0; day < this.parent.agendaDaysCount; day++) {
                    var filterData = [];
                    filterData = this.appointmentFiltering(agendaDate);
                    var nTr = this.agendaBase.createTableRowElement(agendaDate, 'data');
                    if (this.element.querySelector('tr[aria-rowindex="' + parseInt(nTr.getAttribute('aria-rowindex'), 10)
                        + '"]')) {
                        continue;
                    }
                    // if (this.isMonthFirstDate(agendaDate)) {
                    //     tBody.appendChild(this.renderMonthHeader(this.createTableRowElement(agendaDate, 'monthHeader')));
                    // }
                    var dTd = nTr.children[0];
                    var aTd = nTr.children[1];
                    if (filterData.length > 0 || (!this.parent.hideEmptyAgendaDays && filterData.length === 0)) {
                        var elementType = (!this.parent.hideEmptyAgendaDays && filterData.length === 0) ? 'noEvents' : 'data';
                        dTd.appendChild(this.agendaBase.createDateHeaderElement(agendaDate));
                        nTr.appendChild(dTd);
                        var cTd = this.agendaBase.createAgendaContentElement(elementType, filterData, aTd);
                        nTr.appendChild(cTd);
                        if (cTd.querySelectorAll('li').length > 0) {
                            tBody.appendChild(nTr);
                        }
                    }
                    else if (this.parent.activeViewOptions.allowVirtualScrolling) {
                        day--;
                    }
                    if (this.isCurrentDate(new Date(agendaDate.getTime()))) {
                        addClass(dTd.childNodes, cls.AGENDA_CURRENT_DAY_CLASS);
                    }
                    agendaDate = util.addDays(agendaDate, 1);
                    if (agendaDate.getTime() > lastDate.getTime()) {
                        break;
                    }
                }
            }
            endDate = new Date(agendaDate.getTime() - util.MS_PER_DAY);
        }
        this.agendaDates = { start: firstDate, end: endDate };
    };
    // private renderMonthHeader(mTr: Element): Element {
    //     mTr.removeAttribute('aria-rowindex');
    //     for (let td of [].slice.call(mTr.childNodes)) {
    //         td.removeAttribute('aria-colindex');
    //     }
    //     let headerDate: Date = new Date(parseInt(mTr.children[0].getAttribute('data-date'), 10));
    //     let div: Element = createElement('div', {
    //         className: cls.DATE_HEADER_CLASS,
    //         innerHTML: headerDate.toLocaleString(this.parent.locale, { month: 'long' }) + '&nbsp' + headerDate.getFullYear()
    //     });
    //     mTr.lastElementChild.appendChild(div);
    //     return mTr;
    // }
    Agenda.prototype.agendaScrolling = function (event) {
        this.parent.quickPopup.quickPopupHide();
        if (this.parent.activeViewOptions.allowVirtualScrolling) {
            this.virtualScrolling(event);
        }
    };
    Agenda.prototype.virtualScrolling = function (event) {
        var target = event.target;
        var scrollTop = target.scrollTop;
        var scrollHeight = target.scrollHeight;
        var offsetHeight = target.clientHeight;
        var totalHeight = scrollTop + offsetHeight;
        var direction = (this.virtualScrollTop < scrollTop) ? 'next' : 'previous';
        var tBody = target.querySelector('tbody');
        var emptyTBody = createElement('tbody');
        var topElement = this.getElementFromScrollerPosition(event, direction);
        var scrollDate = new Date(parseInt(topElement.getAttribute('data-date'), 0));
        var filterDate;
        var filterData;
        if (scrollTop === 0) {
            filterDate = this.getPreviousNextDate(util.addDays(scrollDate, -1), direction);
            filterData = this.appointmentFiltering(filterDate.start, filterDate.end);
            if (filterData.length > 0 || !this.parent.hideEmptyAgendaDays) {
                this.renderContent(emptyTBody, filterDate.start, filterDate.end);
                prepend([].slice.call(emptyTBody.childNodes), tBody);
                this.agendaBase.wireEventActions();
                for (var s = 0, element = tBody.children; s < element.length; s++) {
                    if (element[s].getAttribute('aria-rowindex') === topElement.getAttribute('aria-colindex')) {
                        var scrollToValue = element[s].offsetTop -
                            this.element.querySelector('.e-agenda-item').offsetHeight;
                        target.scrollTop = scrollToValue;
                        break;
                    }
                }
                this.updateHeaderText(scrollDate);
            }
        }
        else if (totalHeight === scrollHeight) {
            filterDate = this.getPreviousNextDate(util.addDays(scrollDate, 1), direction);
            filterData = this.appointmentFiltering(filterDate.start, filterDate.end);
            if (filterData.length > 0 || !this.parent.hideEmptyAgendaDays) {
                this.renderContent(emptyTBody, filterDate.start, filterDate.end);
                append([].slice.call(emptyTBody.childNodes), tBody);
                this.agendaBase.wireEventActions();
                this.updateHeaderText(scrollDate);
            }
        }
        else {
            this.updateHeaderText(scrollDate);
        }
        this.virtualScrollTop = scrollTop;
        var selectedElements = this.parent.eventBase.getSelectedAppointments();
        if (selectedElements.length > 0) {
            selectedElements[selectedElements.length - 1].focus();
        }
    };
    Agenda.prototype.getElementFromScrollerPosition = function (event, direction) {
        var filterElement;
        var target = event.target;
        var scrollTop = target.scrollTop;
        var scrollHeight = target.scrollHeight;
        var offsetHeight = target.clientHeight;
        var totalHeight = scrollTop + offsetHeight;
        var liCollection = [].slice.call(target.querySelectorAll('.e-agenda-item'));
        var li;
        var liDetails;
        if (liCollection.length > 0) {
            if (scrollTop === 0) {
                li = liCollection[0];
                filterElement = closest(li, '.' + cls.AGENDA_CELLS_CLASS);
            }
            else if (totalHeight === scrollHeight) {
                li = liCollection[liCollection.length - 1];
                filterElement = closest(li, '.' + cls.AGENDA_CELLS_CLASS);
            }
            else {
                for (var a = 0, length_1 = liCollection.length; a < length_1; a++) {
                    li = liCollection[a];
                    liDetails = li.getBoundingClientRect();
                    if (liDetails.top >= 0) {
                        filterElement = closest(li, '.' + cls.AGENDA_CELLS_CLASS);
                        break;
                    }
                }
            }
        }
        return filterElement;
    };
    Agenda.prototype.updateHeaderText = function (date) {
        if (this.parent.showHeaderBar) {
            this.parent.headerModule.updateDateRange(this.getDateRangeText(date));
        }
    };
    Agenda.prototype.getPreviousNextDate = function (date, type) {
        var currentDate = new Date(date.getTime());
        var firstDate = this.getStartDateFromEndDate(date);
        var lastDate = this.getEndDateFromStartDate(date);
        var daysCount = 0;
        do {
            var filterData = this.appointmentFiltering(currentDate);
            if (filterData.length > 0 || !this.parent.hideEmptyAgendaDays) {
                daysCount++;
            }
            currentDate = util.addDays(currentDate, (type === 'next') ? 1 : -1);
            if (currentDate < firstDate || currentDate > lastDate) {
                break;
            }
        } while (daysCount !== this.parent.agendaDaysCount);
        var endDate = util.addDays(currentDate, (type === 'next') ? -1 : 1);
        return (type === 'next') ? { start: date, end: util.addDays(endDate, 1) } : { start: endDate, end: util.addDays(date, 1) };
    };
    Agenda.prototype.appointmentFiltering = function (startDate, endDate) {
        var dateStart;
        var dateEnd;
        if (!isNullOrUndefined(startDate) && isNullOrUndefined(endDate)) {
            dateStart = util.resetTime(new Date(startDate.getTime()));
            dateEnd = util.setTime(new Date(dateStart.getTime()), util.MS_PER_DAY);
        }
        else {
            dateStart = new Date(startDate.getTime());
            dateEnd = new Date(endDate.getTime());
        }
        var filterData = this.parent.eventBase.filterEvents(dateStart, dateEnd);
        if (filterData.length === 0) {
            this.refreshEvent(startDate);
            filterData = this.parent.eventBase.filterEvents(dateStart, dateEnd);
        }
        return filterData;
    };
    Agenda.prototype.getStartDateFromEndDate = function (endDate) {
        var filterDate;
        var fieldMapping = this.parent.eventFields;
        if (this.parent.eventsProcessed.length > 0) {
            var firstDate = Math.min.apply(Math, this.parent.eventsProcessed.map(function (a) {
                var date = a[fieldMapping.startTime];
                return date.getTime();
            }));
            filterDate = this.parent.hideEmptyAgendaDays ? new Date(firstDate) : this.minDate;
        }
        else {
            filterDate = this.parent.hideEmptyAgendaDays ? util.addMonths(endDate, -1) : this.minDate;
        }
        return util.resetTime(filterDate);
    };
    Agenda.prototype.getEndDateFromStartDate = function (startDate) {
        var filterDate;
        var fieldMapping = this.parent.eventFields;
        if (this.parent.eventsProcessed.length > 0) {
            var lastDate = Math.max.apply(Math, this.parent.eventsProcessed.map(function (a) {
                var date = a[fieldMapping.endTime];
                return date.getTime();
            }));
            filterDate = this.parent.hideEmptyAgendaDays ? new Date(lastDate) : this.maxDate;
        }
        else {
            filterDate = this.parent.hideEmptyAgendaDays ? util.addMonths(startDate, 1) : this.maxDate;
        }
        return util.resetTime(util.addDays(filterDate, 1));
    };
    Agenda.prototype.getNextPreviousDate = function (type) {
        var noOfDays = (type === 'next') ? 1 : -1;
        return util.addDays(this.parent.selectedDate, noOfDays);
    };
    Agenda.prototype.startDate = function () {
        return util.resetTime(this.parent.selectedDate);
    };
    Agenda.prototype.endDate = function () {
        if (this.parent.activeViewOptions.allowVirtualScrolling) {
            return this.getEndDateFromStartDate(this.startDate());
        }
        else {
            return util.addDays(this.startDate(), this.parent.agendaDaysCount);
        }
    };
    Agenda.prototype.getDateRangeText = function (date) {
        var formatDate = (this.parent.activeViewOptions.dateFormat) ? this.parent.activeViewOptions.dateFormat : 'MMMM y';
        if (this.parent.activeViewOptions.allowVirtualScrolling || this.parent.isAdaptive) {
            var currentDate = isNullOrUndefined(date) ? this.parent.selectedDate : date;
            return this.parent.globalize.formatDate(currentDate, { format: formatDate, calendar: this.parent.getCalendarMode() });
        }
        else {
            var startDate = this.parent.selectedDate;
            var endDate = util.addDays(startDate, this.parent.agendaDaysCount - 1);
            return this.formatDateRange(startDate, endDate);
        }
    };
    Agenda.prototype.dayNavigationClick = function (e) {
        var date = this.parent.getDateFromElement(closest(e.currentTarget, '.' + cls.AGENDA_CELLS_CLASS));
        if (!isNullOrUndefined(date) && !this.parent.isAdaptive) {
            this.parent.setProperties({ selectedDate: date }, true);
            this.parent.changeView('Day', e);
        }
    };
    // private isMonthFirstDate(date: Date): boolean {
    //     return date.getDate() === 1;
    // }
    Agenda.prototype.wireEvents = function () {
        EventHandler.add(this.element.querySelector('.' + cls.CONTENT_WRAP_CLASS), event.scroll, this.agendaScrolling, this);
    };
    Agenda.prototype.unWireEvents = function () {
        EventHandler.remove(this.element.querySelector('.' + cls.CONTENT_WRAP_CLASS), event.scroll, this.agendaScrolling);
        var dateHeaderElement = [].slice.call(this.element.querySelectorAll('.e-m-date'));
        for (var _i = 0, dateHeaderElement_1 = dateHeaderElement; _i < dateHeaderElement_1.length; _i++) {
            var element = dateHeaderElement_1[_i];
            EventHandler.remove(element, 'click', this.dayNavigationClick);
        }
    };
    Agenda.prototype.addEventListener = function () {
        this.parent.on(event.scrollUiUpdate, this.onAgendaScrollUiUpdate, this);
        this.parent.on(event.dataReady, this.eventLoad, this);
    };
    Agenda.prototype.removeEventListener = function () {
        this.parent.off(event.scrollUiUpdate, this.onAgendaScrollUiUpdate);
        this.parent.off(event.dataReady, this.eventLoad);
    };
    Agenda.prototype.onAgendaScrollUiUpdate = function () {
        var headerHeight = this.getHeaderBarHeight();
        if (this.parent.headerModule) {
            if (this.parent.activeViewOptions.allowVirtualScrolling) {
                this.parent.headerModule.updateHeaderItems('add');
            }
            else {
                this.parent.headerModule.updateHeaderItems('remove');
            }
        }
        var contentArea = this.element.querySelector('.' + cls.CONTENT_WRAP_CLASS);
        contentArea.style.height = formatUnit(this.parent.element.offsetHeight - headerHeight);
    };
    /**
     * To destroy the agenda.
     * @return {void}
     * @private
     */
    Agenda.prototype.destroy = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        if (this.element) {
            this.unWireEvents();
            if (this.parent.resourceBase) {
                this.parent.resourceBase.destroy();
            }
            remove(this.element);
            this.element = null;
            if (this.parent.headerModule && this.parent.activeViewOptions.allowVirtualScrolling) {
                this.parent.headerModule.updateHeaderItems('remove');
            }
        }
    };
    return Agenda;
}(ViewBase));
export { Agenda };
