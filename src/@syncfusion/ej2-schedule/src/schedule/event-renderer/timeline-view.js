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
import { isNullOrUndefined, setStyleAttribute, extend, EventHandler, createElement } from '@syncfusion/ej2-base';
import * as cls from '../base/css-constant';
import * as util from '../base/util';
import { MonthEvent } from './month';
var EVENT_GAP = 2;
var BLOCK_INDICATOR_WIDTH = 22;
var BLOCK_INDICATOR_HEIGHT = 18;
/**
 * Timeline view events render
 */
var TimelineEvent = /** @class */ (function (_super) {
    __extends(TimelineEvent, _super);
    /**
     * Constructor for timeline views
     */
    function TimelineEvent(parent, type) {
        var _this = _super.call(this, parent) || this;
        _this.startHour = _this.parent.activeView.getStartHour();
        _this.endHour = _this.parent.activeView.getEndHour();
        _this.slotCount = _this.parent.activeViewOptions.timeScale.slotCount;
        _this.interval = _this.parent.activeViewOptions.timeScale.interval;
        _this.day = 0;
        _this.rowIndex = 0;
        _this.renderType = type;
        _this.appContainers = [].slice.call(_this.element.querySelectorAll('.' + cls.APPOINTMENT_CONTAINER_CLASS));
        _this.dayLength = _this.element.querySelectorAll('.' + cls.CONTENT_TABLE_CLASS + ' tbody tr')[0].children.length;
        _this.content = _this.parent.element.querySelector('.' + cls.CONTENT_TABLE_CLASS);
        return _this;
    }
    TimelineEvent.prototype.getSlotDates = function () {
        this.slots = [];
        this.slots.push(this.parent.activeView.renderDates.map(function (date) { return +date; }));
        if (this.parent.headerRows.length > 0 &&
            this.parent.headerRows[this.parent.headerRows.length - 1].option !== 'Hour') {
            this.renderType = 'day';
            this.cellWidth = this.content.offsetWidth / this.dateRender.length;
            this.slotsPerDay = 1;
        }
        else {
            this.slotsPerDay = (this.dayLength / this.dateRender.length);
        }
    };
    TimelineEvent.prototype.getOverlapEvents = function (date, appointments) {
        var appointmentsList = [];
        if (this.renderType === 'day') {
            for (var _i = 0, appointments_1 = appointments; _i < appointments_1.length; _i++) {
                var app = appointments_1[_i];
                if ((util.resetTime(app[this.fields.startTime]).getTime() <= util.resetTime(new Date(date.getTime())).getTime()) &&
                    (util.resetTime(app[this.fields.endTime]).getTime() >= util.resetTime(new Date(date.getTime())).getTime())) {
                    appointmentsList.push(app);
                }
            }
        }
        else {
            for (var _a = 0, appointments_2 = appointments; _a < appointments_2.length; _a++) {
                var app = appointments_2[_a];
                var eventData = app.data;
                if (eventData.trimStartTime.getTime() <= date.getTime() &&
                    eventData.trimEndTime.getTime() > date.getTime()) {
                    appointmentsList.push(app);
                }
            }
        }
        return appointmentsList;
    };
    TimelineEvent.prototype.renderResourceEvents = function () {
        this.removeHeightProperty(cls.RESOURCE_COLUMN_TABLE_CLASS);
        var resources = this.parent.uiStateValues.isGroupAdaptive ?
            [this.parent.resourceBase.lastResourceLevel[this.parent.uiStateValues.groupIndex]] :
            this.parent.resourceBase.renderedResources;
        for (var i = 0; i < resources.length; i++) {
            this.rowIndex = i;
            this.renderEventsHandler(this.parent.activeView.renderDates, this.parent.activeViewOptions.workDays, resources[i]);
        }
    };
    TimelineEvent.prototype.renderEvents = function (event, resIndex, eventsList) {
        var eventData = event.data;
        var startTime = this.getStartTime(event, eventData);
        var endTime = this.getEndTime(event, eventData);
        this.day = this.parent.getIndexOfDate(this.dateRender, util.resetTime(new Date(startTime.getTime())));
        if (this.day < 0) {
            return;
        }
        var cellTd = this.getCellTd();
        var overlapCount = this.getIndex(startTime);
        event.Index = overlapCount;
        var appHeight = this.eventHeight;
        var diffInDays = eventData.count;
        if (startTime <= endTime) {
            var appWidth = this.getEventWidth(startTime, endTime, event[this.fields.isAllDay], diffInDays);
            appWidth = this.renderType === 'day' ? appWidth - 2 : appWidth;
            var appLeft = 0;
            var appRight = 0;
            var position = this.getPosition(startTime, endTime, event[this.fields.isAllDay], this.day);
            appWidth = (appWidth <= 0) ? this.cellWidth : appWidth; // appWidth 0 when start and end time as same
            this.renderedEvents.push(extend({}, event, null, true));
            var top_1 = this.getRowTop(resIndex);
            var appTop = (top_1 + EVENT_GAP) + (overlapCount * (appHeight + EVENT_GAP));
            appLeft = (this.parent.enableRtl) ? 0 : position;
            appRight = (this.parent.enableRtl) ? position : 0;
            var height = ((overlapCount + 1) * (appHeight + EVENT_GAP)) + this.moreIndicatorHeight;
            if ((this.cellHeight > height) || this.parent.rowAutoHeight) {
                var appointmentElement = this.createAppointmentElement(event, resIndex);
                this.applyResourceColor(appointmentElement, event, 'backgroundColor', this.groupOrder);
                setStyleAttribute(appointmentElement, {
                    'width': appWidth + 'px', 'left': appLeft + 'px', 'right': appRight + 'px', 'top': appTop + 'px'
                });
                this.wireAppointmentEvents(appointmentElement, event);
                this.renderEventElement(event, appointmentElement, cellTd);
                if (this.parent.rowAutoHeight) {
                    var firstChild = this.getFirstChild(resIndex);
                    this.updateCellHeight(firstChild, height);
                }
            }
            else {
                for (var i = 0; i < diffInDays; i++) {
                    var moreIndicator = cellTd.querySelector('.' + cls.MORE_INDICATOR_CLASS);
                    var appPos = (this.parent.enableRtl) ? appRight : appLeft;
                    appPos = (Math.floor(appPos / this.cellWidth) * this.cellWidth);
                    if ((cellTd && isNullOrUndefined(moreIndicator)) ||
                        (!this.isAlreadyAvail(appPos, cellTd))) {
                        var interval = this.interval / this.slotCount;
                        var startDate = new Date(this.dateRender[this.day + i].getTime());
                        var endDate = util.addDays(this.dateRender[this.day + i], 1);
                        var startDateTime = new Date(+startTime);
                        var slotStartTime = (new Date(startDateTime.setMinutes(Math.floor(startDateTime.getMinutes() / interval) * interval)));
                        var slotEndTime = new Date(slotStartTime.getTime() + (60000 * interval));
                        var groupIndex = void 0;
                        if (this.parent.activeViewOptions.group.resources.length > 0 && !isNullOrUndefined(resIndex)) {
                            groupIndex = resIndex.toString();
                        }
                        var filterEvents = this.getFilterEvents(startDate, endDate, slotStartTime, slotEndTime, groupIndex, eventsList);
                        var appArea = this.cellHeight - this.moreIndicatorHeight;
                        var renderedAppCount = Math.floor(appArea / (appHeight + EVENT_GAP));
                        var count = (filterEvents.length - renderedAppCount) <= 0 ? 1 : (filterEvents.length - renderedAppCount);
                        var moreIndicatorElement = void 0;
                        if (this.renderType === 'day') {
                            moreIndicatorElement = this.getMoreIndicatorElement(count, startDate, endDate);
                        }
                        else {
                            moreIndicatorElement = this.getMoreIndicatorElement(count, slotStartTime, slotEndTime);
                        }
                        if (!isNullOrUndefined(groupIndex)) {
                            moreIndicatorElement.setAttribute('data-group-index', groupIndex);
                        }
                        moreIndicatorElement.style.top = top_1 + appArea + 'px';
                        moreIndicatorElement.style.width = this.cellWidth + 'px';
                        moreIndicatorElement.style.left = (Math.floor(appLeft / this.cellWidth) * this.cellWidth) + 'px';
                        moreIndicatorElement.style.right = (Math.floor(appRight / this.cellWidth) * this.cellWidth) + 'px';
                        this.renderElement(cellTd, moreIndicatorElement);
                        EventHandler.add(moreIndicatorElement, 'click', this.moreIndicatorClick, this);
                    }
                }
            }
        }
    };
    TimelineEvent.prototype.updateCellHeight = function (cell, height) {
        if ((height > cell.offsetHeight)) {
            setStyleAttribute(cell, { 'height': height + 'px' });
            if (this.parent.activeViewOptions.group.resources.length > 0) {
                var resourceCell = this.parent.element.querySelector('.' + cls.RESOURCE_COLUMN_TABLE_CLASS + ' ' + 'tbody td[data-group-index="' +
                    cell.getAttribute('data-group-index') + '"]');
                setStyleAttribute(resourceCell, { 'height': height + 'px' });
            }
        }
    };
    TimelineEvent.prototype.getFirstChild = function (index) {
        var query = '.' + cls.CONTENT_TABLE_CLASS + ' tbody td';
        var groupIndex = '';
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            groupIndex = '[data-group-index="' + index.toString() + '"]';
        }
        var td = this.parent.element.querySelector(query + groupIndex);
        return td;
    };
    TimelineEvent.prototype.updateBlockElements = function () {
        var blockElement = [].slice.call(this.element.querySelectorAll('.' + cls.BLOCK_APPOINTMENT_CLASS));
        for (var _i = 0, blockElement_1 = blockElement; _i < blockElement_1.length; _i++) {
            var element = blockElement_1[_i];
            var resIndex = parseInt(element.getAttribute('data-group-index'), 10);
            var firstChild = this.getFirstChild(resIndex);
            element.style.height = firstChild.offsetHeight + 'px';
            var width = Math.round(element.offsetWidth / firstChild.offsetWidth);
            element.style.width = (firstChild.offsetWidth * width) + 'px';
        }
        var blockIndicator = [].slice.call(this.element.querySelectorAll('.' + cls.BLOCK_INDICATOR_CLASS));
        for (var _a = 0, blockIndicator_1 = blockIndicator; _a < blockIndicator_1.length; _a++) {
            var element = blockIndicator_1[_a];
            var resIndex = parseInt(element.getAttribute('data-group-index'), 10);
            element.style.top = this.getRowTop(resIndex) +
                this.getFirstChild(resIndex).offsetHeight - BLOCK_INDICATOR_HEIGHT + 'px';
        }
    };
    TimelineEvent.prototype.getStartTime = function (event, eventData) {
        var startTime = event[this.fields.startTime];
        var schedule = util.getStartEndHours(startTime, this.startHour, this.endHour);
        if (schedule.startHour.getTime() >= eventData[this.fields.startTime]) {
            startTime = schedule.startHour;
        }
        else if (schedule.endHour.getTime() <= eventData[this.fields.startTime]) {
            startTime = this.getNextDay(schedule.startHour, eventData);
        }
        else {
            startTime = eventData[this.fields.startTime];
        }
        // To overcome the overflow
        eventData.trimStartTime = (event[this.fields.isAllDay]) ? schedule.startHour : eventData[this.fields.startTime];
        return startTime;
    };
    TimelineEvent.prototype.getNextDay = function (startTime, eventData) {
        var startDate;
        for (var i = 1; i <= this.dateRender.length; i++) {
            startDate = util.addDays(startTime, i);
            if (this.parent.getIndexOfDate(this.dateRender, util.resetTime(new Date(startTime.getTime()))) !== -1) {
                eventData.count = eventData.count - 1;
                return startDate;
            }
        }
        return startDate;
    };
    TimelineEvent.prototype.getEndTime = function (event, eventData) {
        var endTime = event[this.fields.endTime];
        var schedule = util.getStartEndHours(endTime, this.startHour, this.endHour);
        if (schedule.endHour.getTime() <= eventData[this.fields.endTime]) {
            endTime = schedule.endHour;
        }
        else {
            endTime = eventData[this.fields.endTime];
        }
        // To overcome the overflow
        eventData.trimEndTime = (event[this.fields.isAllDay]) ? schedule.endHour : eventData[this.fields.endTime];
        return endTime;
    };
    TimelineEvent.prototype.getEventWidth = function (startDate, endDate, isAllDay, count) {
        if (this.renderType === 'day' || isAllDay) {
            return (count * this.slotsPerDay) * this.cellWidth;
        }
        if (this.isSameDay(startDate, endDate)) {
            return this.getSameDayEventsWidth(startDate, endDate);
        }
        else {
            return this.getSpannedEventsWidth(startDate, endDate, count);
        }
    };
    TimelineEvent.prototype.getSameDayEventsWidth = function (startDate, endDate) {
        return (((endDate.getTime() - startDate.getTime())) / (60 * 1000) * (this.cellWidth * this.slotCount) / this.interval);
    };
    TimelineEvent.prototype.getSpannedEventsWidth = function (startDate, endDate, diffInDays) {
        var width = (diffInDays * this.slotsPerDay) * this.cellWidth;
        var startWidth;
        var endWidth;
        var start = util.getStartEndHours(util.resetTime(new Date(startDate.getTime())), this.startHour, this.endHour);
        startWidth = this.getSameDayEventsWidth(start.startHour, startDate);
        if (this.parent.getIndexOfDate(this.dateRender, util.resetTime(new Date(endDate.getTime()))) === -1) {
            endWidth = 0;
        }
        else {
            var end = util.getStartEndHours(util.resetTime(new Date(endDate.getTime())), this.startHour, this.endHour);
            endWidth = this.getSameDayEventsWidth(endDate, end.endHour);
            endWidth = ((this.slotsPerDay * this.cellWidth) === endWidth) ? 0 : endWidth;
        }
        var spannedWidth = startWidth + endWidth;
        return (width > spannedWidth) ? width - spannedWidth : endWidth - startWidth;
    };
    TimelineEvent.prototype.isSameDay = function (startTime, endTime) {
        var startDay = this.parent.getIndexOfDate(this.dateRender, util.resetTime(new Date(startTime.getTime())));
        var endDay = this.parent.getIndexOfDate(this.dateRender, util.resetTime(new Date(endTime.getTime())));
        return (startDay === endDay);
    };
    TimelineEvent.prototype.getAppointmentLeft = function (schedule, startTime, day) {
        var slotTd = (this.isSameDay(startTime, schedule.startHour)) ?
            ((startTime.getTime() - schedule.startHour.getTime()) / ((60 * 1000) * this.interval)) * this.slotCount : 0;
        if (day === 0) {
            return slotTd;
        }
        else {
            var daySlot = (((schedule.endHour.getTime() - schedule.startHour.getTime()) / (60 * 1000)) / this.interval) * this.slotCount;
            return (daySlot * day) + slotTd;
        }
    };
    TimelineEvent.prototype.getPosition = function (startTime, endTime, isAllDay, day) {
        if (this.renderType === 'day' || isAllDay) {
            return (day * this.slotsPerDay) * this.cellWidth;
        }
        var currentDate = util.resetTime(new Date(this.dateRender[day].getTime()));
        var schedule = util.getStartEndHours(currentDate, this.startHour, this.endHour);
        var cellIndex;
        if (schedule.endHour.getTime() <= endTime.getTime() && schedule.startHour.getTime() >= startTime.getTime()) {
            cellIndex = this.getAppointmentLeft(schedule, schedule.startHour, day);
        }
        else if (schedule.endHour.getTime() <= endTime.getTime()) {
            cellIndex = this.getAppointmentLeft(schedule, startTime, day);
        }
        else if (schedule.startHour.getTime() >= startTime.getTime()) {
            cellIndex = this.getAppointmentLeft(schedule, schedule.startHour, day);
        }
        else {
            cellIndex = this.getAppointmentLeft(schedule, startTime, day);
        }
        return cellIndex * this.cellWidth;
    };
    //tslint:disable-next-line:max-line-length
    TimelineEvent.prototype.getFilterEvents = function (startDate, endDate, startTime, endTime, gIndex, eventsList) {
        if (this.renderType === 'day') {
            return this.getFilteredEvents(startDate, endDate, gIndex, eventsList);
        }
        else {
            return this.getFilteredEvents(startTime, endTime, gIndex, eventsList);
        }
    };
    TimelineEvent.prototype.isAlreadyAvail = function (appPos, cellTd) {
        var moreIndicator = [].slice.call(cellTd.querySelectorAll('.' + cls.MORE_INDICATOR_CLASS));
        for (var i = 0; i < moreIndicator.length; i++) {
            var indicatorPos = void 0;
            if (moreIndicator) {
                indicatorPos = (this.parent.enableRtl) ? moreIndicator[i].style.right : moreIndicator[i].style.left;
            }
            if (parseInt(indicatorPos, 10) === Math.floor(appPos)) {
                return true;
            }
        }
        return false;
    };
    TimelineEvent.prototype.getRowTop = function (resIndex) {
        if (this.parent.activeViewOptions.group.resources.length > 0 && !this.parent.uiStateValues.isGroupAdaptive) {
            var td = this.parent.element.querySelector('.' + cls.CONTENT_WRAP_CLASS + ' ' + 'tbody td[data-group-index="'
                + resIndex.toString() + '"]');
            return td.offsetTop;
        }
        return 0;
    };
    TimelineEvent.prototype.getCellTd = function () {
        var wrapIndex = this.parent.uiStateValues.isGroupAdaptive ? 0 : this.rowIndex;
        return this.appContainers[wrapIndex];
    };
    TimelineEvent.prototype.renderBlockIndicator = function (cellTd, position, resIndex) {
        // No need to render block icon for Year, Month and Week header rows
        if (this.parent.headerRows.length > 0 &&
            (this.parent.headerRows[this.parent.headerRows.length - 1].option !== 'Hour' ||
                this.parent.headerRows[this.parent.headerRows.length - 1].option !== 'Date')) {
            return;
        }
        position = (Math.floor(position / this.cellWidth) * this.cellWidth) + this.cellWidth - BLOCK_INDICATOR_WIDTH;
        if (!this.isAlreadyAvail(position, cellTd)) {
            var blockIndicator = createElement('div', { className: 'e-icons ' + cls.BLOCK_INDICATOR_CLASS });
            if (this.parent.activeViewOptions.group.resources.length > 0) {
                blockIndicator.setAttribute('data-group-index', resIndex.toString());
            }
            if (this.parent.enableRtl) {
                blockIndicator.style.right = position + 'px';
            }
            else {
                blockIndicator.style.left = position + 'px';
            }
            blockIndicator.style.top = this.getRowTop(resIndex) + this.cellHeight - BLOCK_INDICATOR_HEIGHT + 'px';
            this.renderElement(cellTd, blockIndicator);
        }
    };
    return TimelineEvent;
}(MonthEvent));
export { TimelineEvent };
