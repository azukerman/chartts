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
import { append, createElement, extend, EventHandler, prepend, Animation, formatUnit } from '@syncfusion/ej2-base';
import { isNullOrUndefined, setStyleAttribute, remove, removeClass, addClass } from '@syncfusion/ej2-base';
import { DataManager, Query, Predicate } from '@syncfusion/ej2-data';
import { EventBase } from './event-base';
import * as util from '../base/util';
import * as events from '../base/constant';
import * as cls from '../base/css-constant';
/**
 * Vertical view appointment rendering
 */
var VerticalEvent = /** @class */ (function (_super) {
    __extends(VerticalEvent, _super);
    /**
     * Constructor for vertical view
     */
    function VerticalEvent(parent) {
        var _this = _super.call(this, parent) || this;
        _this.dateRender = [];
        _this.renderedEvents = [];
        _this.renderedAllDayEvents = [];
        _this.overlapEvents = [];
        _this.moreEvents = [];
        _this.overlapList = [];
        _this.allDayEvents = [];
        _this.slotCount = _this.parent.activeViewOptions.timeScale.slotCount;
        _this.interval = _this.parent.activeViewOptions.timeScale.interval;
        _this.allDayLevel = 0;
        _this.startHour = _this.parent.activeView.getStartHour();
        _this.endHour = _this.parent.activeView.getEndHour();
        _this.element = _this.parent.activeView.getPanel();
        _this.fields = _this.parent.eventFields;
        _this.animation = new Animation({ progress: _this.animationUiUpdate.bind(_this) });
        _this.addEventListener();
        return _this;
    }
    VerticalEvent.prototype.renderAppointments = function () {
        var wrapperElements = [].slice.call(this.parent.element.querySelectorAll('.' + cls.BLOCK_APPOINTMENT_CLASS +
            ',.' + cls.APPOINTMENT_CLASS + ',.' + cls.ROW_COUNT_WRAPPER_CLASS));
        wrapperElements.forEach(function (element) { return remove(element); });
        if (!this.element.querySelector('.' + cls.WORK_CELLS_CLASS)) {
            return;
        }
        this.allDayElement = [].slice.call(this.element.querySelectorAll('.' + cls.ALLDAY_CELLS_CLASS));
        this.setAllDayRowHeight(0);
        if (this.parent.eventsProcessed.length === 0 && this.parent.blockProcessed.length === 0) {
            return;
        }
        var expandCollapse = this.element.querySelector('.' + cls.ALLDAY_APPOINTMENT_SECTION_CLASS);
        EventHandler.remove(expandCollapse, 'click', this.rowExpandCollapse);
        EventHandler.add(expandCollapse, 'click', this.rowExpandCollapse, this);
        this.renderedEvents = [];
        this.renderedAllDayEvents = [];
        this.initializeValues();
        this.processBlockEvents();
        this.renderEvents('normalEvents');
        if (this.allDayEvents.length > 0) {
            this.allDayEvents = this.allDayEvents.filter(function (item, index, arr) {
                return index === arr.map(function (item) { return item.Guid; }).indexOf(item.Guid);
            });
            removeClass(this.allDayElement, cls.ALLDAY_ROW_ANIMATE_CLASS);
            this.slots.push(this.parent.activeView.renderDates.map(function (date) { return +date; }));
            this.renderEvents('allDayEvents');
        }
        this.parent.notify(events.contentReady, {});
        addClass(this.allDayElement, cls.ALLDAY_ROW_ANIMATE_CLASS);
    };
    VerticalEvent.prototype.initializeValues = function () {
        var _this = this;
        this.resources = (this.parent.activeViewOptions.group.resources.length > 0) ? this.parent.uiStateValues.isGroupAdaptive ?
            [this.parent.resourceBase.lastResourceLevel[this.parent.uiStateValues.groupIndex]] :
            this.parent.resourceBase.lastResourceLevel : [];
        this.cellHeight = parseFloat(this.element.querySelector('.e-content-wrap tbody tr').getBoundingClientRect().height.toFixed(2));
        this.dateRender[0] = this.parent.activeView.renderDates;
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            this.resources.forEach(function (resource, index) { return _this.dateRender[index] = resource.renderDates; });
        }
    };
    VerticalEvent.prototype.isValidEvent = function (eventObj, start, end, schedule) {
        var isHourRange = end.getTime() > schedule.startHour.getTime() && start.getTime() < schedule.endHour.getTime();
        var isSameRange = schedule.startHour.getTime() <= start.getTime() &&
            eventObj[this.fields.startTime].getTime() >= schedule.startHour.getTime() &&
            eventObj[this.fields.endTime].getTime() < schedule.endHour.getTime() && start.getTime() === end.getTime();
        return isHourRange || isSameRange;
    };
    VerticalEvent.prototype.getHeight = function (start, end) {
        var appHeight = (end.getTime() - start.getTime()) / (60 * 1000) * (this.cellHeight * this.slotCount) / this.interval;
        appHeight = (appHeight <= 0) ? this.cellHeight : appHeight;
        return appHeight;
    };
    VerticalEvent.prototype.appendEvent = function (eventObj, appointmentElement, index, appLeft) {
        var appointmentWrap = [].slice.call(this.element.querySelectorAll('.' + cls.APPOINTMENT_WRAPPER_CLASS));
        if (this.parent.enableRtl) {
            setStyleAttribute(appointmentElement, { 'right': appLeft });
        }
        else {
            setStyleAttribute(appointmentElement, { 'left': appLeft });
        }
        var eventType = appointmentElement.classList.contains(cls.BLOCK_APPOINTMENT_CLASS) ? 'blockEvent' : 'event';
        var args = { data: eventObj, element: appointmentElement, cancel: false, type: eventType };
        this.parent.trigger(events.eventRendered, args, function (eventArgs) {
            if (!eventArgs.cancel) {
                appointmentWrap[index].appendChild(appointmentElement);
            }
        });
    };
    VerticalEvent.prototype.processBlockEvents = function () {
        var resources = this.getResourceList();
        var dateCount = 0;
        for (var _i = 0, resources_1 = resources; _i < resources_1.length; _i++) {
            var resource = resources_1[_i];
            var renderDates = this.dateRender[resource];
            for (var day = 0, length_1 = renderDates.length; day < length_1; day++) {
                var startDate = new Date(renderDates[day].getTime());
                var endDate = util.addDays(renderDates[day], 1);
                var filterEvents = this.filterEvents(startDate, endDate, this.parent.blockProcessed, this.resources[resource]);
                for (var _a = 0, filterEvents_1 = filterEvents; _a < filterEvents_1.length; _a++) {
                    var event_1 = filterEvents_1[_a];
                    if (this.parent.resourceBase) {
                        this.setValues(event_1, resource);
                    }
                    this.renderBlockEvents(event_1, day, resource, dateCount);
                    this.cssClass = null;
                    this.groupOrder = null;
                }
                dateCount += 1;
            }
        }
    };
    VerticalEvent.prototype.renderBlockEvents = function (eventObj, dayIndex, resource, dayCount) {
        var spannedData = this.isSpannedEvent(eventObj, dayIndex, resource);
        var eStart = spannedData[this.fields.startTime];
        var eEnd = spannedData[this.fields.endTime];
        var currentDate = util.resetTime(new Date(this.dateRender[resource][dayIndex].getTime()));
        var schedule = util.getStartEndHours(currentDate, this.startHour, this.endHour);
        if (eStart <= eEnd && this.isValidEvent(eventObj, eStart, eEnd, schedule)) {
            var blockTop = void 0;
            var blockHeight = void 0;
            if (spannedData[this.fields.isAllDay]) {
                var contentWrap = this.parent.element.querySelector('.' + cls.CONTENT_WRAP_CLASS + ' table');
                blockHeight = formatUnit(contentWrap.offsetHeight);
                blockTop = formatUnit(0);
            }
            else {
                blockHeight = formatUnit(this.getHeight(eStart, eEnd));
                blockTop = formatUnit(this.getTopValue(eStart, dayIndex, resource));
            }
            var appointmentElement = this.createBlockAppointmentElement(eventObj, resource);
            setStyleAttribute(appointmentElement, { 'width': '100%', 'height': blockHeight, 'top': blockTop });
            var index = this.parent.activeViewOptions.group.byDate ? (this.resources.length * dayIndex) + resource : dayCount;
            this.appendEvent(eventObj, appointmentElement, index, '0px');
        }
    };
    VerticalEvent.prototype.renderEvents = function (eventType) {
        removeClass(this.allDayElement, cls.ALLDAY_ROW_ANIMATE_CLASS);
        var eventCollection = (eventType === 'allDayEvents') ? this.sortByDateTime(this.allDayEvents) : undefined;
        var resources = this.getResourceList();
        var dateCount = 0;
        for (var _i = 0, resources_2 = resources; _i < resources_2.length; _i++) {
            var resource = resources_2[_i];
            this.slots = [];
            var renderDates = this.dateRender[resource];
            this.slots.push(renderDates.map(function (date) { return +date; }));
            for (var day = 0, length_2 = renderDates.length; day < length_2; day++) {
                this.renderedEvents = [];
                var startDate = new Date(renderDates[day].getTime());
                var endDate = util.addDays(renderDates[day], 1);
                var filterEvents = this.filterEvents(startDate, endDate, eventCollection, this.resources[resource]);
                for (var _a = 0, filterEvents_2 = filterEvents; _a < filterEvents_2.length; _a++) {
                    var event_2 = filterEvents_2[_a];
                    if (this.parent.resourceBase) {
                        this.setValues(event_2, resource);
                    }
                    if (eventType === 'allDayEvents') {
                        this.renderAllDayEvents(event_2, day, resource, dateCount);
                    }
                    else {
                        if (this.isAllDayAppointment(event_2)) {
                            this.allDayEvents.push(extend({}, event_2, null, true));
                        }
                        else {
                            this.renderNormalEvents(event_2, day, resource, dateCount);
                        }
                    }
                    this.cssClass = null;
                    this.groupOrder = null;
                }
                dateCount += 1;
            }
        }
    };
    VerticalEvent.prototype.setValues = function (event, resourceIndex) {
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            this.cssClass = this.resources[resourceIndex].cssClass;
            this.groupOrder = this.resources[resourceIndex].groupOrder;
        }
        else {
            this.cssClass = this.parent.resourceBase.getCssClass(event);
        }
    };
    VerticalEvent.prototype.getResourceList = function () {
        var resources = Array.apply(null, {
            length: (this.parent.activeViewOptions.group.resources.length > 0 && !this.parent.uiStateValues.isGroupAdaptive) ?
                this.resources.length : 1
        }).map(function (value, index) { return index; });
        return resources;
    };
    VerticalEvent.prototype.createAppointmentElement = function (record, isAllDay, data, resource) {
        var fieldMapping = this.parent.eventFields;
        var recordSubject = (record[fieldMapping.subject] || this.parent.eventSettings.fields.subject.default);
        var appointmentWrapper = createElement('div', {
            className: cls.APPOINTMENT_CLASS,
            attrs: {
                'data-id': 'Appointment_' + record[fieldMapping.id],
                'data-guid': record.Guid,
                'role': 'button',
                'tabindex': '0',
                'aria-readonly': this.parent.eventBase.getReadonlyAttribute(record),
                'aria-selected': 'false',
                'aria-grabbed': 'true',
                'aria-label': recordSubject
            }
        });
        if (record[this.fields.isReadonly]) {
            addClass([appointmentWrapper], 'e-read-only');
        }
        var appointmentDetails = createElement('div', { className: cls.APPOINTMENT_DETAILS });
        appointmentWrapper.appendChild(appointmentDetails);
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            var resourceIndex = this.parent.uiStateValues.isGroupAdaptive ? this.parent.uiStateValues.groupIndex : resource;
            appointmentWrapper.setAttribute('data-group-index', resourceIndex.toString());
        }
        var templateElement;
        var eventData = data;
        if (!isNullOrUndefined(this.parent.activeViewOptions.eventTemplate)) {
            var elementId = this.parent.element.id + '_';
            var viewName = this.parent.activeViewOptions.eventTemplateName;
            var templateId = elementId + viewName + 'eventTemplate';
            var templateArgs = util.addLocalOffsetToEvent(record, this.parent.eventFields);
            templateElement = this.parent.getAppointmentTemplate()(templateArgs, this.parent, 'eventTemplate', templateId, false);
        }
        else {
            var appointmentSubject = createElement('div', { className: cls.SUBJECT_CLASS, innerHTML: recordSubject });
            if (isAllDay) {
                if (record[fieldMapping.isAllDay]) {
                    templateElement = [appointmentSubject];
                }
                else {
                    templateElement = [];
                    var appointmentStartTime = createElement('div', {
                        className: cls.APPOINTMENT_TIME + (this.parent.isAdaptive ? ' ' + cls.DISABLE_CLASS : ''),
                        innerHTML: this.parent.getTimeString(record[fieldMapping.startTime])
                    });
                    var appointmentEndTime = createElement('div', {
                        className: cls.APPOINTMENT_TIME + (this.parent.isAdaptive ? ' ' + cls.DISABLE_CLASS : ''),
                        innerHTML: this.parent.getTimeString(record[fieldMapping.endTime]),
                    });
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
                var timeStr = this.parent.getTimeString(record[fieldMapping.startTime]) + ' - ' +
                    this.parent.getTimeString(record[fieldMapping.endTime]);
                var appointmentTime = createElement('div', {
                    className: cls.APPOINTMENT_TIME + (this.parent.isAdaptive ? ' ' + cls.DISABLE_CLASS : ''),
                    innerHTML: timeStr,
                });
                var appointmentLocation = createElement('div', {
                    className: cls.LOCATION_CLASS,
                    innerHTML: (record[fieldMapping.location] || this.parent.eventSettings.fields.location.default || '')
                });
                templateElement = [appointmentSubject, appointmentTime, appointmentLocation];
            }
        }
        append(templateElement, appointmentDetails);
        if (!this.parent.isAdaptive &&
            (!isNullOrUndefined(record[fieldMapping.recurrenceRule]) || !isNullOrUndefined(record[fieldMapping.recurrenceID]))) {
            var iconClass = (record[fieldMapping.id] === record[fieldMapping.recurrenceID]) ?
                cls.EVENT_RECURRENCE_ICON_CLASS : cls.EVENT_RECURRENCE_EDIT_ICON_CLASS;
            var recurrenceIcon = createElement('div', { className: cls.ICON + ' ' + iconClass });
            isAllDay ? appointmentDetails.appendChild(recurrenceIcon) : appointmentWrapper.appendChild(recurrenceIcon);
        }
        this.renderSpannedIcon(isAllDay ? appointmentDetails : appointmentWrapper, eventData);
        if (!isNullOrUndefined(this.cssClass)) {
            addClass([appointmentWrapper], this.cssClass);
        }
        this.applyResourceColor(appointmentWrapper, record, 'backgroundColor', this.groupOrder);
        this.renderResizeHandler(appointmentWrapper, eventData, record[this.fields.isReadonly]);
        return appointmentWrapper;
    };
    VerticalEvent.prototype.createMoreIndicator = function (allDayRow, count, currentDay) {
        var index = currentDay + count;
        var countWrapper = allDayRow[index];
        if (countWrapper.childElementCount <= 0) {
            var innerCountWrap = createElement('div', {
                className: cls.ROW_COUNT_WRAPPER_CLASS,
                id: cls.ROW_COUNT_WRAPPER_CLASS + '-' + index.toString()
            });
            var moreIndicatorElement = createElement('div', {
                className: cls.MORE_INDICATOR_CLASS,
                attrs: { 'tabindex': '0', 'data-index': index.toString(), 'data-count': '1' },
                innerHTML: '+1&nbsp;' + (this.parent.isAdaptive ? '' : this.parent.localeObj.getConstant('more'))
            });
            innerCountWrap.appendChild(moreIndicatorElement);
            countWrapper.appendChild(innerCountWrap);
            EventHandler.add(moreIndicatorElement, 'click', this.rowExpandCollapse, this);
        }
        else {
            var countCell = countWrapper.querySelector('.' + cls.MORE_INDICATOR_CLASS);
            var moreCount = parseInt(countCell.getAttribute('data-count'), 10) + 1;
            countCell.setAttribute('data-count', moreCount.toString());
            countCell.innerHTML = '+' + moreCount + '&nbsp;' + (this.parent.isAdaptive ? '' : this.parent.localeObj.getConstant('more'));
        }
    };
    VerticalEvent.prototype.renderSpannedIcon = function (element, spanEvent) {
        var iconElement = createElement('div', { className: cls.EVENT_INDICATOR_CLASS + ' ' + cls.ICON });
        if (spanEvent.isLeft) {
            var iconLeft = iconElement.cloneNode();
            addClass([iconLeft], cls.EVENT_ICON_LEFT_CLASS);
            prepend([iconLeft], element);
        }
        if (spanEvent.isRight) {
            var iconRight = iconElement.cloneNode();
            addClass([iconRight], cls.EVENT_ICON_RIGHT_CLASS);
            append([iconRight], element);
        }
        if (spanEvent.isTop) {
            var iconTop = iconElement.cloneNode();
            addClass([iconTop], cls.EVENT_ICON_UP_CLASS);
            prepend([iconTop], element);
        }
        if (spanEvent.isBottom) {
            var iconBottom = iconElement.cloneNode();
            addClass([iconBottom], cls.EVENT_ICON_DOWN_CLASS);
            append([iconBottom], element);
        }
    };
    VerticalEvent.prototype.isSpannedEvent = function (record, day, resource) {
        var currentDate = util.resetTime(this.dateRender[resource][day]);
        var fieldMapping = this.parent.eventFields;
        var startEndHours = util.getStartEndHours(currentDate, this.startHour, this.endHour);
        var event = extend({}, record, null, true);
        event.isSpanned = { isBottom: false, isTop: false };
        if (record[fieldMapping.startTime].getTime() < startEndHours.startHour.getTime()) {
            event[fieldMapping.startTime] = startEndHours.startHour;
            event.isSpanned.isTop = true;
        }
        if (record[fieldMapping.endTime].getTime() > startEndHours.endHour.getTime()) {
            event[fieldMapping.endTime] = startEndHours.endHour;
            event.isSpanned.isBottom = true;
        }
        return event;
    };
    VerticalEvent.prototype.renderAllDayEvents = function (eventObj, dayIndex, resource, dayCount) {
        var _this = this;
        var currentDates = this.dateRender[resource];
        if (this.parent.activeViewOptions.group.byDate) {
            this.slots[0] = [this.dateRender[resource][dayIndex].getTime()];
            currentDates = [this.dateRender[resource][dayIndex]];
        }
        var record = this.splitEvent(eventObj, currentDates)[0];
        var allDayRowCell = this.element.querySelector('.' + cls.ALLDAY_CELLS_CLASS + ':first-child');
        var cellTop = allDayRowCell.offsetTop;
        var eStart = new Date(record[this.parent.eventFields.startTime].getTime());
        var eEnd = new Date(record[this.parent.eventFields.endTime].getTime());
        var appWidth = 0;
        var appLeft = '0%';
        var topValue = 1;
        var appLevel = 0;
        var isDateRange = currentDates[0].getTime() <= eStart.getTime() &&
            util.addDays(currentDates.slice(-1)[0], 1).getTime() >= eStart.getTime();
        if (eStart <= eEnd && isDateRange) {
            var isAlreadyRendered = [];
            if (this.renderedAllDayEvents[resource]) {
                isAlreadyRendered = this.renderedAllDayEvents[resource].filter(function (event) {
                    return event.Guid === eventObj.Guid;
                });
                if (this.parent.activeViewOptions.group.byDate) {
                    isAlreadyRendered = isAlreadyRendered.filter(function (event) {
                        return event[_this.parent.eventFields.startTime] >= currentDates[dayIndex] &&
                            event[_this.parent.eventFields.endTime] <= util.addDays(new Date(+currentDates[dayIndex]), 1);
                    });
                }
            }
            if (isAlreadyRendered.length === 0) {
                var allDayDifference_1 = record.data.count;
                var allDayIndex_1 = this.getOverlapIndex(record, dayIndex, true, resource);
                record.Index = allDayIndex_1;
                this.allDayLevel = (this.allDayLevel < allDayIndex_1) ? allDayIndex_1 : this.allDayLevel;
                var widthAdjustment = record.data.isRight ? 0 :
                    this.parent.currentView === 'Day' ? 4 : 7;
                if (allDayDifference_1 >= 0) {
                    appWidth = (allDayDifference_1 * 100) - widthAdjustment;
                }
                if (isNullOrUndefined(this.renderedAllDayEvents[resource])) {
                    this.renderedAllDayEvents[resource] = [];
                }
                this.renderedAllDayEvents[resource].push(extend({}, record, null, true));
                var allDayRow_1 = [].slice.call(this.element.querySelector('.' + cls.ALLDAY_ROW_CLASS).children);
                var wIndex_1 = this.parent.activeViewOptions.group.byDate ? (this.resources.length * dayIndex) + resource : dayCount;
                var eventWrapper_1 = this.element.querySelector('.' + cls.ALLDAY_APPOINTMENT_WRAPPER_CLASS +
                    ':nth-child(' + (wIndex_1 + 1) + ')');
                var appointmentElement_1 = this.createAppointmentElement(eventObj, true, record.data, resource);
                addClass([appointmentElement_1], cls.ALLDAY_APPOINTMENT_CLASS);
                var args = { data: eventObj, element: appointmentElement_1, cancel: false };
                this.parent.trigger(events.eventRendered, args, function (eventArgs) {
                    if (!eventArgs.cancel) {
                        eventWrapper_1.appendChild(appointmentElement_1);
                        var appHeight = appointmentElement_1.offsetHeight;
                        topValue += (allDayIndex_1 === 0 ? cellTop : (cellTop + (allDayIndex_1 * appHeight))) + 1;
                        setStyleAttribute(appointmentElement_1, { 'width': appWidth + '%', 'top': formatUnit(topValue) });
                        if (allDayIndex_1 > 1) {
                            _this.moreEvents.push(appointmentElement_1);
                            for (var count = 0, length_3 = allDayDifference_1; count < length_3; count++) {
                                _this.createMoreIndicator(allDayRow_1, count, wIndex_1);
                            }
                        }
                        allDayRowCell.setAttribute('data-count', _this.allDayLevel.toString());
                        var allDayRowHeight = ((!_this.parent.uiStateValues.expand && _this.allDayLevel > 2) ?
                            (3 * appHeight) : ((_this.allDayLevel + 1) * appHeight)) + 4;
                        _this.setAllDayRowHeight(allDayRowHeight);
                        _this.addOrRemoveClass();
                        _this.wireAppointmentEvents(appointmentElement_1, eventObj);
                    }
                });
            }
        }
    };
    VerticalEvent.prototype.renderNormalEvents = function (eventObj, dayIndex, resource, dayCount) {
        var record = this.isSpannedEvent(eventObj, dayIndex, resource);
        var eStart = record[this.fields.startTime];
        var eEnd = record[this.fields.endTime];
        var appWidth = '0%';
        var appLeft = '0%';
        var topValue = 0;
        var currentDate = util.resetTime(new Date(this.dateRender[resource][dayIndex].getTime()));
        var schedule = util.getStartEndHours(currentDate, this.startHour, this.endHour);
        var isValidEvent = this.isValidEvent(eventObj, eStart, eEnd, schedule);
        if (eStart <= eEnd && isValidEvent) {
            var appHeight = this.getHeight(eStart, eEnd);
            if (eStart.getTime() > schedule.startHour.getTime()) {
                topValue = this.getTopValue(eStart, dayIndex, resource);
            }
            var appIndex = this.getOverlapIndex(record, dayIndex, false, resource);
            record.Index = appIndex;
            this.overlapList.push(record);
            if (this.overlapList.length > 1) {
                if (isNullOrUndefined(this.overlapEvents[appIndex])) {
                    this.overlapEvents[appIndex] = [];
                }
                this.overlapEvents[appIndex].push(record);
            }
            else {
                this.overlapEvents = [];
                this.overlapEvents.push([record]);
            }
            appWidth = this.getEventWidth();
            var argsData = {
                index: appIndex, left: appLeft, width: appWidth,
                day: dayIndex, dayIndex: dayCount, record: record, resource: resource
            };
            var tempData = this.adjustOverlapElements(argsData);
            appWidth = (tempData.appWidth);
            if (isNullOrUndefined(this.renderedEvents[resource])) {
                this.renderedEvents[resource] = [];
            }
            this.renderedEvents[resource].push(extend({}, record, null, true));
            var appointmentElement = this.createAppointmentElement(eventObj, false, record.isSpanned, resource);
            setStyleAttribute(appointmentElement, { 'width': tempData.appWidth, 'height': appHeight + 'px', 'top': topValue + 'px' });
            var iconHeight = appointmentElement.querySelectorAll('.' + cls.EVENT_INDICATOR_CLASS).length * 15;
            var maxHeight = appHeight - 40 - iconHeight;
            var subjectElement = appointmentElement.querySelector('.' + cls.SUBJECT_CLASS);
            if (!this.parent.isAdaptive && subjectElement) {
                subjectElement.style.maxHeight = formatUnit(maxHeight);
            }
            var index = this.parent.activeViewOptions.group.byDate ? (this.resources.length * dayIndex) + resource : dayCount;
            this.appendEvent(eventObj, appointmentElement, index, tempData.appLeft);
            this.wireAppointmentEvents(appointmentElement, eventObj);
        }
    };
    VerticalEvent.prototype.getEventWidth = function () {
        var width = this.parent.currentView === 'Day' ? 97 : 94;
        var tempWidth = ((width - this.overlapEvents.length) / this.overlapEvents.length);
        return (tempWidth < 0 ? 0 : tempWidth) + '%';
    };
    VerticalEvent.prototype.getEventLeft = function (appWidth, index) {
        var tempLeft = (parseFloat(appWidth) + 1) * index;
        return (tempLeft > 99 ? 99 : tempLeft) + '%';
    };
    VerticalEvent.prototype.getTopValue = function (date, day, resource) {
        var startEndHours = util.getStartEndHours(util.resetTime(this.dateRender[resource][day]), this.startHour, this.endHour);
        var startHour = startEndHours.startHour;
        var diffInMinutes = ((date.getHours() - startHour.getHours()) * 60) + (date.getMinutes() - startHour.getMinutes());
        return (diffInMinutes * this.cellHeight * this.slotCount) / this.interval;
    };
    VerticalEvent.prototype.getOverlapIndex = function (record, day, isAllDay, resource) {
        var _this = this;
        var fieldMapping = this.parent.eventFields;
        var predicate;
        var eventsList = [];
        var appIndex = -1;
        this.overlapEvents = [];
        if (isAllDay) {
            if (!isNullOrUndefined(this.renderedAllDayEvents[resource])) {
                var date_1 = util.resetTime(new Date(this.dateRender[resource][day].getTime()));
                eventsList = this.renderedAllDayEvents[resource].filter(function (app) {
                    return util.resetTime(app[fieldMapping.startTime]).getTime() <= date_1.getTime() &&
                        util.resetTime(app[fieldMapping.endTime]).getTime() >= date_1.getTime();
                });
                if (this.parent.activeViewOptions.group.resources.length > 0) {
                    eventsList = this.filterEventsByResource(this.resources[resource], eventsList);
                }
            }
        }
        else {
            var appointmentList_1 = !isNullOrUndefined(this.renderedEvents[resource]) ? this.renderedEvents[resource] : [];
            var appointment_1 = [];
            predicate = new Predicate(fieldMapping.endTime, 'greaterthan', record[fieldMapping.startTime]).
                and(new Predicate(fieldMapping.startTime, 'lessthan', record[fieldMapping.endTime])).
                or(new Predicate(fieldMapping.startTime, 'greaterthanorequal', record[fieldMapping.endTime]).
                and(new Predicate(fieldMapping.endTime, 'lessthanorequal', record[fieldMapping.startTime])));
            this.overlapList = new DataManager({ json: appointmentList_1 }).executeLocal(new Query().where(predicate));
            if (this.parent.activeViewOptions.group.resources.length > 0) {
                this.overlapList = this.filterEventsByResource(this.resources[resource], this.overlapList);
            }
            this.overlapList.forEach(function (obj) {
                predicate = new Predicate(fieldMapping.endTime, 'greaterthanorequal', obj[fieldMapping.startTime]).
                    and(new Predicate(fieldMapping.startTime, 'lessthanorequal', obj[fieldMapping.endTime]));
                var filterList = new DataManager({ json: appointmentList_1 }).executeLocal(new Query().where(predicate));
                if (_this.parent.activeViewOptions.group.resources.length > 0) {
                    filterList = _this.filterEventsByResource(_this.resources[resource], filterList);
                }
                var collection = _this.overlapList.filter(function (val) { return filterList.indexOf(val) === -1; });
                return appointment_1.concat(collection);
            });
            this.overlapList = this.overlapList.concat(appointment_1);
            eventsList = this.overlapList;
            for (var _i = 0, eventsList_1 = eventsList; _i < eventsList_1.length; _i++) {
                var event_3 = eventsList_1[_i];
                var record_1 = event_3;
                var index = record_1.Index;
                (isNullOrUndefined(this.overlapEvents[index])) ? this.overlapEvents[index] = [event_3] :
                    this.overlapEvents[index].push(event_3);
            }
        }
        if (eventsList.length > 0) {
            var appLevel = eventsList.map(function (obj) { return obj.Index; });
            appIndex = (appLevel.length > 0) ? this.getSmallestMissingNumber(appLevel) : 0;
        }
        return (appIndex === -1) ? 0 : appIndex;
    };
    VerticalEvent.prototype.adjustOverlapElements = function (args) {
        var data = { appWidth: args.width, appLeft: args.left };
        for (var i = 0, length1 = this.overlapEvents.length; i < length1; i++) {
            if (!isNullOrUndefined(this.overlapEvents[i])) {
                for (var j = 0, length2 = this.overlapEvents[i].length; j < length2; j++) {
                    var dayCount = this.parent.activeViewOptions.group.byDate ? (this.resources.length * args.day) + args.resource :
                        args.dayIndex;
                    var element = this.element.querySelector('#e-appointment-wrapper-' + dayCount);
                    if (element.childElementCount > 0) {
                        var eleGuid = this.overlapEvents[i][j].Guid;
                        if (element.querySelectorAll('div[data-guid="' + eleGuid + '"]').length > 0 && eleGuid !== args.record.Guid) {
                            var apps = element.querySelector('div[data-guid="' + eleGuid + '"]');
                            if (parseFloat(args.width) <= parseFloat(apps.style.width)) {
                                (this.parent.enableRtl) ? apps.style.right = this.getEventLeft(args.width, i) :
                                    apps.style.left = this.getEventLeft(args.width, i);
                                apps.style.width = ((parseFloat(args.width))) + '%';
                                data.appWidth = apps.style.width;
                            }
                        }
                        else {
                            var appWidth = args.width;
                            if (isNullOrUndefined(this.overlapEvents[i - 1])) {
                                appWidth = this.getEventWidth();
                            }
                            data.appWidth = appWidth;
                            data.appLeft = this.getEventLeft(appWidth, args.index);
                        }
                    }
                }
            }
        }
        return data;
    };
    VerticalEvent.prototype.setAllDayRowHeight = function (height) {
        for (var _i = 0, _a = this.allDayElement; _i < _a.length; _i++) {
            var element = _a[_i];
            element.style.height = (height / 12) + 'em';
        }
        this.animation.animate(this.allDayElement[0]);
    };
    VerticalEvent.prototype.addOrRemoveClass = function () {
        var _this = this;
        this.moreEvents.filter(function (element) {
            if (!_this.parent.uiStateValues.expand && _this.allDayLevel > 2) {
                addClass([element], cls.EVENT_COUNT_CLASS);
                element.setAttribute('tabindex', '-1');
            }
            else {
                removeClass([element], cls.EVENT_COUNT_CLASS);
                element.setAttribute('tabindex', '0');
            }
        });
        var moreEventCount = this.element.querySelector('.' + cls.ALLDAY_APPOINTMENT_SECTION_CLASS);
        if (this.parent.uiStateValues.expand) {
            removeClass([moreEventCount], cls.APPOINTMENT_ROW_EXPAND_CLASS);
            addClass([moreEventCount], cls.APPOINTMENT_ROW_COLLAPSE_CLASS);
        }
        else {
            removeClass([moreEventCount], cls.APPOINTMENT_ROW_COLLAPSE_CLASS);
            addClass([moreEventCount], cls.APPOINTMENT_ROW_EXPAND_CLASS);
        }
        (this.allDayLevel > 2) ? removeClass([moreEventCount], cls.DISABLE_CLASS) : addClass([moreEventCount], cls.DISABLE_CLASS);
        var countCell = [].slice.call(this.element.querySelectorAll('.' + cls.ROW_COUNT_WRAPPER_CLASS));
        countCell.filter(function (element) {
            (!_this.parent.uiStateValues.expand && _this.allDayLevel > 2) ? removeClass([element], cls.DISABLE_CLASS) :
                addClass([element], cls.DISABLE_CLASS);
        });
    };
    VerticalEvent.prototype.getEventHeight = function () {
        var eventElement = createElement('div', { className: cls.APPOINTMENT_CLASS, styles: 'visibility:hidden' });
        var eventWrapper = this.element.querySelector('.' + cls.ALLDAY_APPOINTMENT_WRAPPER_CLASS + ':first-child');
        eventWrapper.appendChild(eventElement);
        var height = eventElement.offsetHeight;
        remove(eventElement);
        return height;
    };
    VerticalEvent.prototype.rowExpandCollapse = function () {
        var target = this.element.querySelector('.' + cls.ALLDAY_APPOINTMENT_SECTION_CLASS);
        this.parent.uiStateValues.expand = target.classList.contains(cls.APPOINTMENT_ROW_EXPAND_CLASS);
        var rowHeight;
        if (this.parent.uiStateValues.expand) {
            target.setAttribute('title', 'Collapse-all-day-section');
            target.setAttribute('aria-label', 'Collapse section');
            rowHeight = ((this.allDayLevel + 1) * this.getEventHeight()) + 4;
        }
        else {
            target.setAttribute('title', 'Expand-all-day-section');
            target.setAttribute('aria-label', 'Expand section');
            rowHeight = (3 * this.getEventHeight()) + 4;
        }
        this.setAllDayRowHeight(rowHeight);
        this.addOrRemoveClass();
        this.animation.animate(target);
    };
    VerticalEvent.prototype.animationUiUpdate = function () {
        this.parent.notify(events.contentReady, {});
    };
    return VerticalEvent;
}(EventBase));
export { VerticalEvent };
