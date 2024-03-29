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
import { append, prepend, createElement, extend, EventHandler, closest, addClass, isBlazor, getElement } from '@syncfusion/ej2-base';
import { isNullOrUndefined, setStyleAttribute, remove } from '@syncfusion/ej2-base';
import { EventBase } from './event-base';
import * as cls from '../base/css-constant';
import * as events from '../base/constant';
import * as util from '../base/util';
var EVENT_GAP = 0;
/**
 * Month view events render
 */
var MonthEvent = /** @class */ (function (_super) {
    __extends(MonthEvent, _super);
    /**
     * Constructor for month events
     */
    function MonthEvent(parent) {
        var _this = _super.call(this, parent) || this;
        _this.renderedEvents = [];
        _this.monthHeaderHeight = 0;
        _this.moreIndicatorHeight = 19;
        _this.renderType = 'day';
        _this.element = _this.parent.activeView.getPanel();
        _this.fields = _this.parent.eventFields;
        _this.addEventListener();
        return _this;
    }
    MonthEvent.prototype.renderAppointments = function () {
        var conWrap = this.parent.element.querySelector('.' + cls.CONTENT_WRAP_CLASS);
        if (this.parent.rowAutoHeight) {
            this.parent.uiStateValues.top = conWrap.scrollTop;
            this.parent.uiStateValues.left = conWrap.scrollLeft;
        }
        var appointmentWrapper = [].slice.call(this.element.querySelectorAll('.' + cls.APPOINTMENT_WRAPPER_CLASS));
        for (var _i = 0, appointmentWrapper_1 = appointmentWrapper; _i < appointmentWrapper_1.length; _i++) {
            var wrap = appointmentWrapper_1[_i];
            remove(wrap);
        }
        this.removeHeightProperty(cls.CONTENT_TABLE_CLASS);
        if (!this.element.querySelector('.' + cls.WORK_CELLS_CLASS)) {
            return;
        }
        this.eventHeight = util.getElementHeightFromClass(this.element, cls.APPOINTMENT_CLASS);
        var scrollTop = conWrap.scrollTop;
        if (this.parent.rowAutoHeight && this.parent.virtualScrollModule && !isNullOrUndefined(this.parent.currentAction)) {
            conWrap.scrollTop = conWrap.scrollTop - 1;
        }
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            this.renderResourceEvents();
        }
        else {
            this.renderEventsHandler(this.parent.activeView.renderDates, this.parent.activeViewOptions.workDays);
        }
        if (this.parent.rowAutoHeight) {
            this.updateBlockElements();
            var data = {
                cssProperties: this.parent.getCssProperties(),
                module: this.parent.getModuleName(),
                isPreventScrollUpdate: true,
                scrollPosition: { left: this.parent.uiStateValues.left, top: this.parent.uiStateValues.top }
            };
            if (this.parent.virtualScrollModule) {
                if (this.parent.currentAction) {
                    conWrap.scrollTop = scrollTop;
                    this.parent.currentAction = null;
                }
                else {
                    this.parent.virtualScrollModule.updateVirtualScrollHeight();
                }
            }
            this.parent.notify(events.scrollUiUpdate, data);
        }
    };
    MonthEvent.prototype.renderEventsHandler = function (dateRender, workDays, resData) {
        this.renderedEvents = [];
        var eventsList;
        var blockList;
        var resIndex = 0;
        if (resData) {
            resIndex = resData.groupIndex;
            this.cssClass = resData.cssClass;
            this.groupOrder = resData.groupOrder;
            eventsList = this.parent.eventBase.filterEventsByResource(resData, this.parent.eventsProcessed);
            blockList = this.parent.eventBase.filterEventsByResource(resData, this.parent.blockProcessed);
            this.workCells = [].slice.call(this.element.querySelectorAll('.' + cls.WORK_CELLS_CLASS + '[data-group-index="' + resIndex + '"]'));
        }
        else {
            eventsList = this.parent.eventsProcessed;
            blockList = this.parent.blockProcessed;
            this.workCells = [].slice.call(this.element.querySelectorAll('.' + cls.WORK_CELLS_CLASS));
        }
        this.sortByDateTime(eventsList);
        this.sortByDateTime(blockList);
        this.cellWidth = this.workCells.slice(-1)[0].offsetWidth;
        this.cellHeight = this.workCells.slice(-1)[0].offsetHeight;
        this.dateRender = dateRender;
        this.getSlotDates(workDays);
        this.processBlockEvents(blockList, resIndex, resData);
        for (var _i = 0, eventsList_1 = eventsList; _i < eventsList_1.length; _i++) {
            var event_1 = eventsList_1[_i];
            if (this.parent.resourceBase && !resData) {
                this.cssClass = this.parent.resourceBase.getCssClass(event_1);
            }
            var splittedEvents = this.splitEvent(event_1, this.dateRender);
            for (var _a = 0, splittedEvents_1 = splittedEvents; _a < splittedEvents_1.length; _a++) {
                var event_2 = splittedEvents_1[_a];
                this.updateIndicatorIcon(event_2);
                this.renderEvents(event_2, resIndex, eventsList);
            }
        }
        this.cssClass = null;
        this.groupOrder = null;
    };
    MonthEvent.prototype.processBlockEvents = function (blockEvents, resIndex, resData) {
        for (var _i = 0, blockEvents_1 = blockEvents; _i < blockEvents_1.length; _i++) {
            var event_3 = blockEvents_1[_i];
            if (this.parent.resourceBase && !resData) {
                this.cssClass = this.parent.resourceBase.getCssClass(event_3);
            }
            var blockSpannedList = [];
            if (this.renderType === 'day' && !event_3[this.fields.isAllDay]) {
                var temp = extend({}, event_3, null, true);
                var isSameDate = this.isSameDate(temp[this.fields.startTime], temp[this.fields.endTime]);
                temp.isBlockIcon = isSameDate;
                if (!isSameDate && util.getDateInMs(temp[this.fields.startTime]) > 0) {
                    var e = extend({}, event_3, null, true);
                    e[this.fields.endTime] = util.addDays(util.resetTime(new Date(event_3[this.fields.startTime] + '')), 1);
                    e.isBlockIcon = true;
                    temp[this.fields.startTime] = e[this.fields.endTime];
                    blockSpannedList.push(e);
                }
                isSameDate = this.isSameDate(temp[this.fields.startTime], temp[this.fields.endTime]);
                if (!isSameDate && util.getDateInMs(temp[this.fields.endTime]) > 0) {
                    var e = extend({}, event_3, null, true);
                    e[this.fields.startTime] = util.resetTime(new Date(event_3[this.fields.endTime] + ''));
                    e.isBlockIcon = true;
                    blockSpannedList.push(e);
                    temp[this.fields.endTime] = e[this.fields.startTime];
                }
                blockSpannedList.push(temp);
            }
            else {
                blockSpannedList.push(event_3);
            }
            for (var _a = 0, blockSpannedList_1 = blockSpannedList; _a < blockSpannedList_1.length; _a++) {
                var blockEvent = blockSpannedList_1[_a];
                var splittedEvents = this.splitEvent(blockEvent, this.dateRender);
                for (var _b = 0, splittedEvents_2 = splittedEvents; _b < splittedEvents_2.length; _b++) {
                    var event_4 = splittedEvents_2[_b];
                    this.renderBlockEvents(event_4, resIndex, !!blockEvent.isBlockIcon);
                }
            }
        }
    };
    MonthEvent.prototype.isSameDate = function (start, end) {
        return new Date(+start).setHours(0, 0, 0, 0) === new Date(+end).setHours(0, 0, 0, 0);
    };
    MonthEvent.prototype.renderBlockEvents = function (event, resIndex, isIcon) {
        var eventData = event.data;
        var startTime = this.getStartTime(event, eventData);
        var endTime = this.getEndTime(event, eventData);
        var day = this.parent.getIndexOfDate(this.dateRender, util.resetTime(new Date(startTime.getTime())));
        if (day < 0 || startTime > endTime) {
            return;
        }
        var cellTd = this.getCellTd(day);
        var position = this.getPosition(startTime, endTime, event[this.fields.isAllDay], day);
        if (!isIcon) {
            var diffInDays = eventData.count;
            var appWidth = this.getEventWidth(startTime, endTime, event[this.fields.isAllDay], diffInDays);
            appWidth = (appWidth <= 0) ? this.cellWidth : appWidth;
            var appLeft = (this.parent.enableRtl) ? 0 : position;
            var appRight = (this.parent.enableRtl) ? position : 0;
            this.renderWrapperElement(cellTd);
            var appHeight = this.cellHeight - this.monthHeaderHeight;
            var appTop = this.getRowTop(resIndex);
            var blockElement = this.createBlockAppointmentElement(event, resIndex);
            setStyleAttribute(blockElement, {
                'width': appWidth + 'px', 'height': appHeight + 1 + 'px', 'left': appLeft + 'px',
                'right': appRight + 'px', 'top': appTop + 'px'
            });
            this.renderEventElement(event, blockElement, cellTd);
        }
        else {
            this.renderBlockIndicator(cellTd, position, resIndex);
        }
    };
    MonthEvent.prototype.renderBlockIndicator = function (cellTd, position, resIndex) {
        var blockIndicator = createElement('div', { className: 'e-icons ' + cls.BLOCK_INDICATOR_CLASS });
        if (isNullOrUndefined(cellTd.querySelector('.' + cls.BLOCK_INDICATOR_CLASS))) {
            cellTd.appendChild(blockIndicator);
        }
    };
    MonthEvent.prototype.getStartTime = function (event, eventData) {
        return event[this.fields.startTime];
    };
    MonthEvent.prototype.getEndTime = function (event, eventData) {
        return event[this.fields.endTime];
    };
    MonthEvent.prototype.getCellTd = function (day) {
        return this.workCells[day];
    };
    MonthEvent.prototype.getEventWidth = function (startDate, endDate, isAllDay, count) {
        return count * this.cellWidth - 1;
    };
    MonthEvent.prototype.getPosition = function (startTime, endTime, isAllDay, day) {
        return 0;
    };
    MonthEvent.prototype.getRowTop = function (resIndex) {
        return 0;
    };
    MonthEvent.prototype.updateIndicatorIcon = function (event) {
        if (this.parent.currentView.indexOf('Timeline') === -1 || this.parent.currentView === 'TimelineMonth'
            || event[this.fields.isAllDay]) {
            return;
        }
        var cloneData = event.data;
        var startHour = util.getStartEndHours(event[this.fields.startTime], this.parent.activeView.getStartHour(), this.parent.activeView.getEndHour());
        var endHour = util.getStartEndHours(event[this.fields.endTime], this.parent.activeView.getStartHour(), this.parent.activeView.getEndHour());
        cloneData.isLeft = cloneData.isLeft || cloneData[this.fields.startTime].getTime() < startHour.startHour.getTime();
        cloneData.isRight = cloneData.isRight || cloneData[this.fields.endTime].getTime() > endHour.endHour.getTime();
    };
    MonthEvent.prototype.renderResourceEvents = function () {
        var resources = this.parent.uiStateValues.isGroupAdaptive ?
            [this.parent.resourceBase.lastResourceLevel[this.parent.uiStateValues.groupIndex]] :
            this.parent.resourceBase.lastResourceLevel;
        for (var _i = 0, resources_1 = resources; _i < resources_1.length; _i++) {
            var slotData = resources_1[_i];
            this.renderEventsHandler(slotData.renderDates, slotData.workDays, slotData);
        }
    };
    MonthEvent.prototype.getSlotDates = function (workDays) {
        this.slots = [];
        var dates = this.dateRender.map(function (date) { return +date; });
        var noOfDays = this.parent.activeViewOptions.showWeekend ? util.WEEK_LENGTH : workDays.length;
        while (dates.length > 0) {
            this.slots.push(dates.splice(0, noOfDays));
        }
    };
    MonthEvent.prototype.createAppointmentElement = function (record, resIndex, isCloneElement) {
        if (isCloneElement === void 0) { isCloneElement = false; }
        var eventSubject = (record[this.fields.subject] || this.parent.eventSettings.fields.subject.default);
        var appointmentWrapper = createElement('div', {
            className: cls.APPOINTMENT_CLASS,
            attrs: {
                'data-id': 'Appointment_' + record[this.fields.id],
                'role': 'button', 'tabindex': '0',
                'aria-readonly': this.parent.eventBase.getReadonlyAttribute(record), 'aria-selected': 'false', 'aria-grabbed': 'true',
                'aria-label': eventSubject
            }
        });
        if (!isCloneElement) {
            appointmentWrapper.setAttribute('data-guid', record.Guid);
        }
        if (!isNullOrUndefined(this.cssClass)) {
            addClass([appointmentWrapper], this.cssClass);
        }
        if (record[this.fields.isReadonly]) {
            addClass([appointmentWrapper], 'e-read-only');
        }
        var appointmentDetails = createElement('div', { className: cls.APPOINTMENT_DETAILS });
        appointmentWrapper.appendChild(appointmentDetails);
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            appointmentWrapper.setAttribute('data-group-index', resIndex.toString());
        }
        var templateElement;
        var eventData = record.data;
        var eventObj = this.getEventData(record);
        if (!isNullOrUndefined(this.parent.activeViewOptions.eventTemplate)) {
            var scheduleId = this.parent.element.id + '_';
            var viewName = this.parent.activeViewOptions.eventTemplateName;
            var templateId = scheduleId + viewName + 'eventTemplate';
            var templateArgs = util.addLocalOffsetToEvent(eventObj, this.parent.eventFields);
            templateElement = this.parent.getAppointmentTemplate()(templateArgs, this.parent, 'eventTemplate', templateId, false);
        }
        else {
            var eventLocation = (record[this.fields.location] || this.parent.eventSettings.fields.location.default || '');
            var appointmentSubject = createElement('div', {
                className: cls.SUBJECT_CLASS,
                innerHTML: (eventSubject + (eventLocation ? ';&nbsp' + eventLocation : ''))
            });
            var appointmentStartTime = createElement('div', {
                className: cls.APPOINTMENT_TIME + (this.parent.isAdaptive ? ' ' + cls.DISABLE_CLASS : ''),
                innerHTML: this.parent.getTimeString(eventData[this.fields.startTime])
            });
            var appointmentEndTime = createElement('div', {
                className: cls.APPOINTMENT_TIME + (this.parent.isAdaptive ? ' ' + cls.DISABLE_CLASS : ''),
                innerHTML: this.parent.getTimeString(eventData[this.fields.endTime])
            });
            if (this.parent.currentView === 'Month') {
                if (record[this.fields.isAllDay]) {
                    templateElement = [appointmentSubject];
                    addClass([appointmentSubject], 'e-text-center');
                }
                else if (eventData.count <= 1 && !eventData.isLeft && !eventData.isRight) {
                    templateElement = [appointmentStartTime, appointmentSubject];
                }
                else {
                    templateElement = [];
                    addClass([appointmentSubject], 'e-text-center');
                    if (!eventData.isLeft) {
                        templateElement.push(appointmentStartTime);
                    }
                    templateElement.push(appointmentSubject);
                    if (!eventData.isRight) {
                        templateElement.push(appointmentEndTime);
                    }
                }
            }
            else {
                var innerElement = void 0;
                if (record[this.fields.isAllDay]) {
                    var allDayString = createElement('div', {
                        className: cls.APPOINTMENT_TIME, innerHTML: this.parent.localeObj.getConstant('allDay')
                    });
                    innerElement = [appointmentSubject, allDayString];
                }
                else {
                    var timeString = this.parent.getTimeString(eventData[this.fields.startTime])
                        + ' - ' + this.parent.getTimeString(eventData[this.fields.endTime]);
                    var appTime = createElement('div', {
                        className: cls.APPOINTMENT_TIME + (this.parent.isAdaptive ? ' ' + cls.DISABLE_CLASS : ''), innerHTML: timeString,
                    });
                    var appLocation = createElement('div', { className: cls.LOCATION_CLASS, innerHTML: eventLocation });
                    innerElement = [appointmentSubject, appTime, appLocation];
                }
                var wrap = createElement('div', { className: 'e-inner-wrap' });
                append(innerElement, wrap);
                templateElement = [wrap];
            }
        }
        append(templateElement, appointmentDetails);
        this.appendEventIcons(record, appointmentDetails);
        this.renderResizeHandler(appointmentWrapper, record.data, record[this.fields.isReadonly]);
        return appointmentWrapper;
    };
    MonthEvent.prototype.appendEventIcons = function (record, appointmentDetails) {
        var eventData = record.data;
        if (!isNullOrUndefined(record[this.fields.recurrenceRule]) || !isNullOrUndefined(record[this.fields.recurrenceID])) {
            var iconClass = (record[this.fields.id] === record[this.fields.recurrenceID]) ?
                cls.EVENT_RECURRENCE_ICON_CLASS : cls.EVENT_RECURRENCE_EDIT_ICON_CLASS;
            appointmentDetails.appendChild(createElement('div', {
                className: cls.ICON + ' ' + iconClass + (this.parent.isAdaptive ? ' ' + cls.DISABLE_CLASS : '')
            }));
        }
        if (eventData.isLeft) {
            var iconLeft = createElement('div', {
                className: cls.EVENT_INDICATOR_CLASS + ' ' + cls.ICON + ' ' + cls.EVENT_ICON_LEFT_CLASS
            });
            prepend([iconLeft], appointmentDetails);
        }
        if (eventData.isRight) {
            var iconRight = createElement('div', {
                className: cls.EVENT_INDICATOR_CLASS + ' ' + cls.ICON + ' ' + cls.EVENT_ICON_RIGHT_CLASS
            });
            append([iconRight], appointmentDetails);
        }
    };
    MonthEvent.prototype.renderEvents = function (event, resIndex, eventsList) {
        var startTime = event[this.fields.startTime];
        var endTime = event[this.fields.endTime];
        var day = this.parent.getIndexOfDate(this.dateRender, util.resetTime(startTime));
        if (day < 0) {
            return;
        }
        var overlapCount = this.getIndex(startTime);
        event.Index = overlapCount;
        var appHeight = this.eventHeight;
        this.renderedEvents.push(extend({}, event, null, true));
        var diffInDays = event.data.count;
        if (startTime.getTime() <= endTime.getTime()) {
            var appWidth = (diffInDays * this.cellWidth) - 5;
            var cellTd = this.workCells[day];
            var appTop = (overlapCount * (appHeight + EVENT_GAP));
            this.renderWrapperElement(cellTd);
            var height = this.monthHeaderHeight + ((overlapCount + 1) * (appHeight + EVENT_GAP)) + this.moreIndicatorHeight;
            if ((this.cellHeight > height) || this.parent.rowAutoHeight) {
                var appointmentElement = this.createAppointmentElement(event, resIndex);
                this.applyResourceColor(appointmentElement, event, 'backgroundColor', this.groupOrder);
                this.wireAppointmentEvents(appointmentElement, event);
                setStyleAttribute(appointmentElement, { 'width': appWidth + 'px', 'top': appTop + 'px' });
                this.renderEventElement(event, appointmentElement, cellTd);
                if (this.parent.rowAutoHeight) {
                    var firstChild = cellTd.parentElement.firstChild;
                    this.updateCellHeight(firstChild, height);
                }
            }
            else {
                for (var i = 0; i < diffInDays; i++) {
                    var cellTd_1 = this.workCells[day + i];
                    if (cellTd_1 && isNullOrUndefined(cellTd_1.querySelector('.' + cls.MORE_INDICATOR_CLASS))) {
                        var startDate = new Date(this.dateRender[day + i].getTime());
                        var endDate = util.addDays(this.dateRender[day + i], 1);
                        var groupIndex = cellTd_1.getAttribute('data-group-index');
                        var filterEvents = this.getFilteredEvents(startDate, endDate, groupIndex);
                        var appArea = this.cellHeight - this.monthHeaderHeight - this.moreIndicatorHeight;
                        var renderedAppCount = Math.floor(appArea / (appHeight + EVENT_GAP));
                        var count = (filterEvents.length - renderedAppCount) <= 0 ? 1 : (filterEvents.length - renderedAppCount);
                        var moreIndicatorElement = this.getMoreIndicatorElement(count, startDate, endDate);
                        if (!isNullOrUndefined(groupIndex)) {
                            moreIndicatorElement.setAttribute('data-group-index', groupIndex);
                        }
                        moreIndicatorElement.style.top = appArea + 'px';
                        moreIndicatorElement.style.width = cellTd_1.offsetWidth - 2 + 'px';
                        this.renderElement(cellTd_1, moreIndicatorElement);
                        EventHandler.add(moreIndicatorElement, 'click', this.moreIndicatorClick, this);
                    }
                }
            }
        }
    };
    MonthEvent.prototype.updateCellHeight = function (cell, height) {
        if ((height > cell.offsetHeight)) {
            setStyleAttribute(cell, { 'height': height + 'px' });
        }
    };
    MonthEvent.prototype.updateBlockElements = function () {
        var blockElement = [].slice.call(this.element.querySelectorAll('.' + cls.BLOCK_APPOINTMENT_CLASS));
        for (var _i = 0, blockElement_1 = blockElement; _i < blockElement_1.length; _i++) {
            var element = blockElement_1[_i];
            var target = closest(element, 'tr');
            this.monthHeaderHeight = element.offsetParent.offsetTop - target.offsetTop;
            element.style.height = ((target.offsetHeight - 1) - this.monthHeaderHeight) + 'px';
            var firstChild = target.firstChild;
            var width = Math.round(element.offsetWidth / firstChild.offsetWidth);
            element.style.width = (firstChild.offsetWidth * width) + 'px';
        }
    };
    MonthEvent.prototype.getFilteredEvents = function (startDate, endDate, groupIndex, eventsList) {
        var filteredEvents;
        if (isNullOrUndefined(groupIndex)) {
            filteredEvents = this.filterEvents(startDate, endDate);
        }
        else {
            var data = this.parent.resourceBase.lastResourceLevel[parseInt(groupIndex, 10)];
            filteredEvents = this.filterEvents(startDate, endDate, isNullOrUndefined(eventsList) ? undefined : eventsList, data);
        }
        return filteredEvents;
    };
    MonthEvent.prototype.getOverlapEvents = function (date, appointments) {
        var appointmentsList = [];
        for (var _i = 0, appointments_1 = appointments; _i < appointments_1.length; _i++) {
            var app = appointments_1[_i];
            if ((util.resetTime(app[this.fields.startTime]).getTime() <= util.resetTime(date).getTime()) &&
                (util.resetTime(app[this.fields.endTime]).getTime() >= util.resetTime(date).getTime())) {
                appointmentsList.push(app);
            }
        }
        return appointmentsList;
    };
    MonthEvent.prototype.getIndex = function (date) {
        var appIndex = -1;
        var appointments = this.renderedEvents;
        if (appointments.length > 0) {
            var appointmentsList = this.getOverlapEvents(date, appointments);
            var appLevel = appointmentsList.map(function (obj) { return obj.Index; });
            appIndex = (appLevel.length > 0) ? this.getSmallestMissingNumber(appLevel) : 0;
        }
        return (appIndex === -1) ? 0 : appIndex;
    };
    MonthEvent.prototype.moreIndicatorClick = function (event) {
        var _this = this;
        var target = closest(event.target, '.' + cls.MORE_INDICATOR_CLASS);
        var startDate = new Date(parseInt(target.getAttribute('data-start-date'), 10));
        var endDate = new Date(parseInt(target.getAttribute('data-end-date'), 10));
        var groupIndex = target.getAttribute('data-group-index');
        var moreArgs = {
            cancel: false, event: event, element: target, isPopupOpen: true,
            startTime: startDate, endTime: endDate, viewName: this.parent.getNavigateView()
        };
        if (groupIndex) {
            moreArgs.groupIndex = parseInt(groupIndex, 10);
        }
        this.parent.trigger(events.moreEventsClick, moreArgs, function (clickArgs) {
            if (isBlazor()) {
                clickArgs.startTime = new Date('' + clickArgs.startTime);
                clickArgs.endTime = new Date('' + clickArgs.endTime);
                clickArgs.element = getElement(clickArgs.element);
            }
            if (!clickArgs.cancel) {
                if (clickArgs.isPopupOpen) {
                    var filteredEvents = _this.getFilteredEvents(startDate, endDate, groupIndex);
                    var moreEventArgs = { date: startDate, event: filteredEvents, element: event.target };
                    _this.parent.quickPopup.moreEventClick(moreEventArgs, endDate, groupIndex);
                }
                else {
                    _this.parent.setProperties({ selectedDate: startDate }, true);
                    _this.parent.changeView(clickArgs.viewName, event);
                }
            }
        });
    };
    MonthEvent.prototype.renderEventElement = function (event, appointmentElement, cellTd) {
        var _this = this;
        var eventType = appointmentElement.classList.contains(cls.BLOCK_APPOINTMENT_CLASS) ? 'blockEvent' : 'event';
        var eventObj = this.getEventData(event);
        var args = { data: eventObj, element: appointmentElement, cancel: false, type: eventType };
        this.parent.trigger(events.eventRendered, args, function (eventArgs) {
            if (eventArgs.cancel) {
                _this.renderedEvents.pop();
            }
            else {
                _this.renderElement(cellTd, appointmentElement);
            }
        });
    };
    MonthEvent.prototype.getEventData = function (event) {
        var eventObj = extend({}, event, null, true);
        eventObj[this.fields.startTime] = event.data[this.fields.startTime];
        eventObj[this.fields.endTime] = event.data[this.fields.endTime];
        return eventObj;
    };
    MonthEvent.prototype.renderElement = function (cellTd, element) {
        if (cellTd.querySelector('.' + cls.APPOINTMENT_WRAPPER_CLASS)) {
            cellTd.querySelector('.' + cls.APPOINTMENT_WRAPPER_CLASS).appendChild(element);
        }
        else {
            var wrapper = createElement('div', { className: cls.APPOINTMENT_WRAPPER_CLASS });
            wrapper.appendChild(element);
            cellTd.appendChild(wrapper);
        }
    };
    MonthEvent.prototype.renderWrapperElement = function (cellTd) {
        var element = cellTd.querySelector('.' + cls.APPOINTMENT_WRAPPER_CLASS);
        if (!isNullOrUndefined(element)) {
            this.monthHeaderHeight = element.offsetTop - cellTd.offsetTop;
        }
        else {
            var wrapper = createElement('div', { className: cls.APPOINTMENT_WRAPPER_CLASS });
            cellTd.appendChild(wrapper);
            this.monthHeaderHeight = wrapper.offsetTop - cellTd.offsetTop;
        }
    };
    MonthEvent.prototype.getMoreIndicatorElement = function (count, startDate, endDate) {
        var moreIndicatorElement = createElement('div', {
            className: cls.MORE_INDICATOR_CLASS,
            innerHTML: '+' + count + '&nbsp;' + (this.parent.isAdaptive ? '' : this.parent.localeObj.getConstant('more')),
            attrs: {
                'tabindex': '0',
                'data-start-date': startDate.getTime().toString(),
                'data-end-date': endDate.getTime().toString()
            }
        });
        return moreIndicatorElement;
    };
    MonthEvent.prototype.removeHeightProperty = function (selector) {
        var rows = [].slice.call(this.element.querySelectorAll('.' + selector + ' tbody tr'));
        for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
            var row = rows_1[_i];
            row.firstChild.style.height = '';
        }
    };
    return MonthEvent;
}(EventBase));
export { MonthEvent };
