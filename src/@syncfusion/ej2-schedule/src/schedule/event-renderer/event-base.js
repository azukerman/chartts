import { isNullOrUndefined, closest, Browser, extend, EventHandler, isBlazor } from '@syncfusion/ej2-base';
import { createElement, prepend, append, addClass, removeClass, getElement } from '@syncfusion/ej2-base';
import { DataManager, Query, Predicate } from '@syncfusion/ej2-data';
import { generate, getDateFromRecurrenceDateString } from '../../recurrence-editor/date-generator';
import * as util from '../base/util';
import * as cls from '../base/css-constant';
import * as event from '../base/constant';
/**
 * EventBase for appointment rendering
 */
var EventBase = /** @class */ (function () {
    /**
     * Constructor for EventBase
     */
    function EventBase(parent) {
        this.slots = [];
        this.isDoubleTapped = false;
        this.parent = parent;
    }
    EventBase.prototype.processData = function (events, timeZonePropChanged, oldTimezone) {
        var _this = this;
        var start = this.parent.activeView.startDate();
        var end = this.parent.activeView.endDate();
        var fields = this.parent.eventFields;
        this.parent.eventsProcessed = [];
        var processed = [];
        var temp = 1;
        var generateID = false;
        if (events.length > 0 && isNullOrUndefined(events[0][fields.id])) {
            generateID = true;
        }
        for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
            var event_1 = events_1[_i];
            if (generateID) {
                event_1[fields.id] = temp++;
            }
            if (typeof event_1[fields.startTime] === 'string') {
                event_1[fields.startTime] = util.getDateFromString(event_1[fields.startTime]);
            }
            if (typeof event_1[fields.endTime] === 'string') {
                event_1[fields.endTime] = util.getDateFromString(event_1[fields.endTime]);
            }
            if (timeZonePropChanged) {
                this.processTimezoneChange(event_1, oldTimezone);
            }
            else {
                event_1 = this.processTimezone(event_1);
            }
            if (!isNullOrUndefined(event_1[fields.recurrenceRule]) && event_1[fields.recurrenceRule] === '') {
                event_1[fields.recurrenceRule] = null;
            }
            if (!isNullOrUndefined(event_1[fields.recurrenceRule]) && isNullOrUndefined(event_1[fields.recurrenceID])) {
                processed = processed.concat(this.generateOccurrence(event_1, null, oldTimezone, true));
            }
            else {
                event_1.Guid = this.generateGuid();
                processed.push(event_1);
            }
        }
        var eventData = processed.filter(function (data) { return !data[_this.parent.eventFields.isBlock]; });
        this.parent.eventsProcessed = this.filterEvents(start, end, eventData);
        var blockData = processed.filter(function (data) { return data[_this.parent.eventFields.isBlock]; });
        blockData.forEach(function (eventObj) {
            if (eventObj[fields.isAllDay]) {
                eventObj[fields.startTime] = util.resetTime(eventObj[fields.startTime]);
                eventObj[fields.endTime] = util.addDays(util.resetTime(eventObj[fields.endTime]), 1);
            }
        });
        this.parent.blockProcessed = blockData;
        return eventData;
    };
    EventBase.prototype.getProcessedEvents = function (eventCollection) {
        if (eventCollection === void 0) { eventCollection = this.parent.eventsData; }
        var processed = [];
        for (var _i = 0, _a = eventCollection; _i < _a.length; _i++) {
            var event_2 = _a[_i];
            if (!isNullOrUndefined(event_2[this.parent.eventFields.recurrenceRule]) &&
                isNullOrUndefined(event_2[this.parent.eventFields.recurrenceID])) {
                processed = processed.concat(this.generateOccurrence(event_2));
            }
            else {
                processed.push(event_2);
            }
        }
        return processed;
    };
    EventBase.prototype.timezonePropertyChange = function (oldTimezone) {
        var processed = this.processData(this.parent.eventsData, true, oldTimezone);
        this.parent.notify(event.dataReady, { processedData: processed });
    };
    /** @private */
    EventBase.prototype.timezoneConvert = function (eventData) {
        var fields = this.parent.eventFields;
        eventData[fields.startTimezone] = eventData[fields.startTimezone] || eventData[fields.endTimezone];
        eventData[fields.endTimezone] = eventData[fields.endTimezone] || eventData[fields.startTimezone];
        if (this.parent.timezone) {
            var startTz = eventData[fields.startTimezone];
            var endTz = eventData[fields.endTimezone];
            eventData[fields.startTime] =
                this.parent.tzModule.convert(eventData[fields.startTime], this.parent.timezone, startTz);
            eventData[fields.endTime] =
                this.parent.tzModule.convert(eventData[fields.endTime], this.parent.timezone, endTz);
        }
    };
    EventBase.prototype.processTimezoneChange = function (event, oldTimezone) {
        var fields = this.parent.eventFields;
        if (event[fields.isAllDay]) {
            return;
        }
        if (oldTimezone && this.parent.timezone) {
            event[fields.startTime] = this.parent.tzModule.convert(event[fields.startTime], oldTimezone, this.parent.timezone);
            event[fields.endTime] = this.parent.tzModule.convert(event[fields.endTime], oldTimezone, this.parent.timezone);
        }
        else if (!oldTimezone && this.parent.timezone) {
            event[fields.startTime] = this.parent.tzModule.add(event[fields.startTime], this.parent.timezone);
            event[fields.endTime] = this.parent.tzModule.add(event[fields.endTime], this.parent.timezone);
        }
        else if (oldTimezone && !this.parent.timezone) {
            event[fields.startTime] = this.parent.tzModule.remove(event[fields.startTime], oldTimezone);
            event[fields.endTime] = this.parent.tzModule.remove(event[fields.endTime], oldTimezone);
        }
    };
    EventBase.prototype.processTimezone = function (event, isReverse) {
        if (isReverse === void 0) { isReverse = false; }
        var fields = this.parent.eventFields;
        if (event[fields.startTimezone] || event[fields.endTimezone]) {
            var startTimezone = event[fields.startTimezone] || event[fields.endTimezone];
            var endTimezone = event[fields.endTimezone] || event[fields.startTimezone];
            var zone = this.parent.timezone;
            if (isReverse) {
                if (this.parent.timezone) {
                    event[fields.startTime] =
                        this.parent.tzModule.convert(event[fields.startTime], startTimezone, zone);
                    event[fields.endTime] = this.parent.tzModule.convert(event[fields.endTime], endTimezone, zone);
                    event[fields.startTime] = this.parent.tzModule.remove(event[fields.startTime], zone);
                    event[fields.endTime] = this.parent.tzModule.remove(event[fields.endTime], zone);
                }
                else {
                    event[fields.startTime] = this.parent.tzModule.remove(event[fields.startTime], startTimezone);
                    event[fields.endTime] = this.parent.tzModule.remove(event[fields.endTime], endTimezone);
                }
            }
            else {
                event[fields.startTime] = this.parent.tzModule.add(event[fields.startTime], startTimezone);
                event[fields.endTime] = this.parent.tzModule.add(event[fields.endTime], endTimezone);
                if (this.parent.timezone) {
                    event[fields.startTime] =
                        this.parent.tzModule.convert(event[fields.startTime], startTimezone, zone);
                    event[fields.endTime] = this.parent.tzModule.convert(event[fields.endTime], endTimezone, zone);
                }
            }
        }
        else if (this.parent.timezone) {
            if (isReverse) {
                event[fields.startTime] = this.parent.tzModule.remove(event[fields.startTime], this.parent.timezone);
                event[fields.endTime] = this.parent.tzModule.remove(event[fields.endTime], this.parent.timezone);
            }
            else {
                event[fields.startTime] = this.parent.tzModule.add(event[fields.startTime], this.parent.timezone);
                event[fields.endTime] = this.parent.tzModule.add(event[fields.endTime], this.parent.timezone);
            }
        }
        return event;
    };
    EventBase.prototype.filterBlockEvents = function (eventObj) {
        var eStart = eventObj[this.parent.eventFields.startTime];
        var eEnd = eventObj[this.parent.eventFields.endTime];
        var resourceData;
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            var data = this.getGroupIndexFromEvent(eventObj);
            resourceData = this.parent.resourceBase.lastResourceLevel[data];
        }
        return this.filterEvents(eStart, eEnd, this.parent.blockProcessed, resourceData);
    };
    EventBase.prototype.filterEvents = function (startDate, endDate, appointments, resourceTdData) {
        if (appointments === void 0) { appointments = this.parent.eventsProcessed; }
        var fieldMapping = this.parent.eventFields;
        var predicate = new Predicate(fieldMapping.startTime, 'greaterthanorequal', startDate).
            and(new Predicate(fieldMapping.endTime, 'greaterthanorequal', startDate)).
            and(new Predicate(fieldMapping.startTime, 'lessthan', endDate)).
            or(new Predicate(fieldMapping.startTime, 'lessthanorequal', startDate).
            and(new Predicate(fieldMapping.endTime, 'greaterthan', startDate)));
        var filter = new DataManager({ json: appointments }).executeLocal(new Query().where(predicate));
        if (resourceTdData) {
            filter = this.filterEventsByResource(resourceTdData, filter);
        }
        return this.sortByTime(filter);
    };
    EventBase.prototype.filterEventsByRange = function (eventCollection, startDate, endDate) {
        var filteredEvents = [];
        if (startDate && endDate) {
            filteredEvents = this.filterEvents(startDate, endDate, eventCollection);
        }
        else if (startDate && !endDate) {
            var predicate = new Predicate(this.parent.eventFields.startTime, 'greaterthanorequal', startDate);
            filteredEvents = new DataManager({ json: eventCollection }).executeLocal(new Query().where(predicate));
        }
        else if (!startDate && endDate) {
            var predicate = new Predicate(this.parent.eventFields.endTime, 'lessthanorequal', endDate);
            filteredEvents = new DataManager({ json: eventCollection }).executeLocal(new Query().where(predicate));
        }
        else {
            filteredEvents = eventCollection;
        }
        return this.sortByTime(filteredEvents);
    };
    EventBase.prototype.filterEventsByResource = function (resourceTdData, appointments) {
        if (appointments === void 0) { appointments = this.parent.eventsProcessed; }
        var predicate = {};
        var resourceCollection = this.parent.resourceBase.resourceCollection;
        for (var level = 0; level < resourceCollection.length; level++) {
            predicate[resourceCollection[level].field] = resourceTdData.groupOrder[level];
        }
        var keys = Object.keys(predicate);
        var filteredCollection = appointments.filter(function (eventObj) { return keys.every(function (key) {
            if (eventObj[key] instanceof Array) {
                return eventObj[key].indexOf(predicate[key]) > -1;
            }
            else {
                return eventObj[key] === predicate[key];
            }
        }); });
        return filteredCollection;
    };
    EventBase.prototype.sortByTime = function (appointments) {
        var fieldMapping = this.parent.eventFields;
        appointments.sort(function (a, b) {
            var d1 = a[fieldMapping.startTime];
            var d2 = b[fieldMapping.startTime];
            return d1.getTime() - d2.getTime();
        });
        return appointments;
    };
    EventBase.prototype.sortByDateTime = function (appointments) {
        var fieldMapping = this.parent.eventFields;
        appointments.sort(function (object1, object2) {
            var d3 = object1[fieldMapping.startTime];
            var d4 = object2[fieldMapping.startTime];
            var d5 = object1[fieldMapping.endTime];
            var d6 = object2[fieldMapping.endTime];
            var d1 = d5.getTime() - d3.getTime();
            var d2 = d6.getTime() - d4.getTime();
            return (d3.getTime() - d4.getTime() || d2 - d1);
        });
        return appointments;
    };
    EventBase.prototype.getSmallestMissingNumber = function (array) {
        var large = Math.max.apply(Math, array);
        for (var i = 0; i < large; i++) {
            if (array.indexOf(i) === -1) {
                return i;
            }
        }
        return large + 1;
    };
    EventBase.prototype.splitEventByDay = function (event) {
        var eventFields = this.parent.eventFields;
        var data = [];
        var eventStartTime = event[eventFields.startTime];
        var eventEndTime = event[eventFields.endTime];
        var isDifferentDate = util.resetTime(new Date(eventStartTime.getTime())) <
            util.resetTime(new Date(eventEndTime.getTime()));
        if (isDifferentDate) {
            var start = new Date(eventStartTime.getTime());
            var end = util.addDays(util.resetTime(new Date(eventStartTime.getTime())), 1);
            var endDate = (eventEndTime.getHours() === 0 && eventEndTime.getMinutes() === 0) ?
                eventEndTime : util.addDays(eventEndTime, 1);
            var index = 1;
            var eventLength = util.getDaysCount(eventStartTime.getTime(), endDate.getTime());
            while (end <= eventEndTime) {
                var app = extend({}, event);
                app[eventFields.startTime] = start;
                app[eventFields.endTime] = end;
                app.data = { index: index, count: eventLength };
                app.Guid = this.generateGuid();
                app.isSpanned = true;
                data.push(app);
                start = end;
                if ((util.resetTime(new Date(start.getTime())).getTime() === util.resetTime(new Date(eventEndTime.getTime())).getTime())
                    && !(end.getTime() === eventEndTime.getTime())) {
                    end = new Date(start.getTime());
                    end = new Date(end.setHours(eventEndTime.getHours(), eventEndTime.getMinutes(), eventEndTime.getSeconds()));
                }
                else {
                    end = util.addDays(util.resetTime(new Date(start.getTime())), 1);
                }
                index++;
            }
        }
        else {
            data.push(event);
        }
        return data;
    };
    EventBase.prototype.splitEvent = function (event, dateRender) {
        var fields = this.parent.eventFields;
        var start = util.resetTime(new Date(event[fields.startTime] + '')).getTime();
        var end = util.resetTime(new Date(event[fields.endTime] + '')).getTime();
        if (util.getDateInMs(event[fields.endTime]) <= 0) {
            var temp = util.addDays(util.resetTime(new Date(event[fields.endTime] + '')), -1).getTime();
            end = start > temp ? start : temp;
        }
        var orgStart = start;
        var orgEnd = end;
        var ranges = [];
        if (start !== end) {
            if (start < dateRender[0].getTime()) {
                start = dateRender[0].getTime();
            }
            if (end > dateRender[dateRender.length - 1].getTime()) {
                end = dateRender[dateRender.length - 1].getTime();
            }
            var cStart = start;
            for (var level = 0; level < this.slots.length; level++) {
                var slot = this.slots[level];
                var firstSlot = slot[0];
                cStart = (cStart <= firstSlot && end >= firstSlot) ? firstSlot : cStart;
                if (cStart > end || firstSlot > end) {
                    break;
                }
                if (!this.parent.activeViewOptions.group.byDate && this.parent.activeViewOptions.showWeekend &&
                    this.parent.currentView !== 'WorkWeek' && this.parent.currentView !== 'TimelineWorkWeek') {
                    var startIndex = slot.indexOf(cStart);
                    if (startIndex !== -1) {
                        var endIndex = slot.indexOf(end);
                        var hasBreak = endIndex !== -1;
                        endIndex = hasBreak ? endIndex : slot.length - 1;
                        var count = ((endIndex - startIndex) + 1);
                        var isLeft = (slot[startIndex] !== orgStart);
                        var isRight = (slot[endIndex] !== orgEnd);
                        ranges.push(this.cloneEventObject(event, slot[startIndex], slot[endIndex], count, isLeft, isRight));
                        if (hasBreak) {
                            break;
                        }
                    }
                }
                else {
                    if (this.dateInRange(cStart, slot[0], slot[slot.length - 1])) {
                        var availSlot = [];
                        for (var i = 0; i < slot.length; i++) {
                            if (this.dateInRange(slot[i], orgStart, orgEnd)) {
                                availSlot.push(slot[i]);
                            }
                        }
                        if (availSlot.length > 0) {
                            if (!this.parent.activeViewOptions.group.byDate) {
                                var isLeft = (availSlot[0] !== orgStart);
                                var isRight = (availSlot[availSlot.length - 1] !== orgEnd);
                                ranges.push(this.cloneEventObject(event, availSlot[0], availSlot[availSlot.length - 1], availSlot.length, isLeft, isRight));
                            }
                            else {
                                for (var _i = 0, availSlot_1 = availSlot; _i < availSlot_1.length; _i++) {
                                    var slot_1 = availSlot_1[_i];
                                    ranges.push(this.cloneEventObject(event, slot_1, slot_1, 1, (slot_1 !== orgStart), (slot_1 !== orgEnd)));
                                }
                            }
                        }
                    }
                }
            }
        }
        else {
            ranges.push(this.cloneEventObject(event, start, end, 1, false, false));
        }
        return ranges;
    };
    EventBase.prototype.cloneEventObject = function (event, start, end, count, isLeft, isRight) {
        var fields = this.parent.eventFields;
        var e = extend({}, event, null, true);
        var data = { count: count, isLeft: isLeft, isRight: isRight };
        data[fields.startTime] = event[fields.startTime];
        data[fields.endTime] = event[fields.endTime];
        e.data = data;
        e[fields.startTime] = new Date(start);
        e[fields.endTime] = new Date(end);
        return e;
    };
    EventBase.prototype.dateInRange = function (date, start, end) {
        return start <= date && date <= end;
    };
    EventBase.prototype.getSelectedEventElements = function (target) {
        this.removeSelectedAppointmentClass();
        if (this.parent.selectedElements.length <= 0) {
            this.parent.selectedElements.push(target);
        }
        else {
            var isAlreadySelected = this.parent.selectedElements.filter(function (element) {
                return element.getAttribute('data-guid') === target.getAttribute('data-guid');
            });
            if (isAlreadySelected.length <= 0) {
                var focusElements = [].slice.call(this.parent.element.
                    querySelectorAll('div[data-guid="' + target.getAttribute('data-guid') + '"]'));
                for (var _i = 0, focusElements_1 = focusElements; _i < focusElements_1.length; _i++) {
                    var element = focusElements_1[_i];
                    this.parent.selectedElements.push(element);
                }
            }
            else {
                var selectedElements = this.parent.selectedElements.filter(function (element) {
                    return element.getAttribute('data-guid') !== target.getAttribute('data-guid');
                });
                this.parent.selectedElements = selectedElements;
            }
        }
        if (target && this.parent.selectedElements.length > 0) {
            this.addSelectedAppointments(this.parent.selectedElements);
        }
        return this.parent.selectedElements;
    };
    EventBase.prototype.getSelectedEvents = function () {
        var _this = this;
        var eventSelect = [];
        var elementSelect = [];
        var selectAppointments = [].slice.call(this.parent.element.querySelectorAll('.' + cls.APPOINTMENT_BORDER));
        selectAppointments.filter(function (element) {
            eventSelect.push(_this.getEventByGuid(element.getAttribute('data-guid')));
            elementSelect.push(element);
        });
        return {
            event: eventSelect.length > 1 ? eventSelect : eventSelect[0],
            element: elementSelect.length > 1 ? elementSelect : elementSelect[0]
        };
    };
    EventBase.prototype.removeSelectedAppointmentClass = function () {
        var selectedAppointments = this.getSelectedAppointments();
        for (var _i = 0, selectedAppointments_1 = selectedAppointments; _i < selectedAppointments_1.length; _i++) {
            var appointment = selectedAppointments_1[_i];
            appointment.setAttribute('aria-selected', 'false');
        }
        removeClass(selectedAppointments, cls.APPOINTMENT_BORDER);
        if (this.parent.currentView === 'Agenda' || this.parent.currentView === 'MonthAgenda') {
            removeClass(selectedAppointments, cls.AGENDA_SELECTED_CELL);
        }
    };
    EventBase.prototype.addSelectedAppointments = function (cells) {
        for (var _i = 0, cells_1 = cells; _i < cells_1.length; _i++) {
            var cell = cells_1[_i];
            cell.setAttribute('aria-selected', 'true');
        }
        this.parent.removeSelectedClass();
        addClass(cells, cls.APPOINTMENT_BORDER);
    };
    EventBase.prototype.getSelectedAppointments = function () {
        return [].slice.call(this.parent.element.querySelectorAll('.' + cls.APPOINTMENT_BORDER + ',.' + cls.APPOINTMENT_CLASS + ':focus'));
    };
    EventBase.prototype.focusElement = function () {
        var selectedCell = this.parent.getSelectedElements();
        if (selectedCell.length > 0) {
            if (this.parent.keyboardInteractionModule) {
                var target = ((!isNullOrUndefined(this.parent.activeCellsData) &&
                    this.parent.activeCellsData.element) || selectedCell[selectedCell.length - 1]);
                this.parent.keyboardInteractionModule.selectCells(target instanceof Array, target);
            }
            return;
        }
        var selectedAppointments = this.getSelectedAppointments();
        if (selectedAppointments.length > 0) {
            selectedAppointments[selectedAppointments.length - 1].focus();
            return;
        }
    };
    EventBase.prototype.selectWorkCellByTime = function (eventsData) {
        var target;
        if (this.parent.currentView === 'Agenda' || this.parent.currentView === 'MonthAgenda') {
            return target;
        }
        if (eventsData.length > 0) {
            var selectedObject = eventsData[eventsData.length - 1];
            var eventStartTime = selectedObject[this.parent.eventFields.startTime];
            var nearestTime = new Date(+eventStartTime).setMinutes(0, 0, 0);
            var isAllDay = this.isAllDayAppointment(selectedObject);
            if (this.parent.currentView === 'Month' || isAllDay) {
                nearestTime = new Date(+eventStartTime).setHours(0, 0, 0, 0);
            }
            var targetArea = void 0;
            if (isAllDay && ['Day', 'Week', 'WorkWeek'].indexOf(this.parent.currentView) !== -1) {
                targetArea = this.parent.getAllDayRow();
            }
            else {
                targetArea = this.parent.getContentTable();
            }
            var queryString = '[data-date="' + nearestTime + '"]';
            if (this.parent.activeViewOptions.group.resources.length > 0) {
                queryString += '[data-group-index="' + this.getGroupIndexFromEvent(selectedObject) + '"]';
            }
            target = targetArea.querySelector(queryString);
            if (target) {
                this.parent.activeCellsData = this.parent.getCellDetails(target);
                if (this.parent.keyboardInteractionModule) {
                    this.parent.keyboardInteractionModule.selectCells(false, target);
                }
                return target;
            }
        }
        return target;
    };
    EventBase.prototype.getGroupIndexFromEvent = function (eventData) {
        var groupOrder = [];
        var groupIndex = 0;
        for (var _i = 0, _a = this.parent.resourceBase.resourceCollection; _i < _a.length; _i++) {
            var resourceData = _a[_i];
            groupOrder.push(eventData[resourceData.field]);
        }
        this.parent.resourceBase.lastResourceLevel.forEach(function (resource) {
            var count;
            var order = resource.groupOrder;
            order.forEach(function (resIndex, index) {
                var resValue = (groupOrder[index] instanceof Array) ? groupOrder[index][index] : groupOrder[index];
                if (resValue === resIndex) {
                    count = count ? count + 1 : 1;
                }
            });
            if (order.length === count) {
                groupIndex = resource.groupIndex;
            }
        });
        return groupIndex;
    };
    EventBase.prototype.isAllDayAppointment = function (event) {
        var fieldMapping = this.parent.eventFields;
        var isAllDay = event[fieldMapping.isAllDay];
        var isFullDay = ((event[fieldMapping.endTime].getTime() - event[fieldMapping.startTime].getTime())
            / util.MS_PER_DAY) >= 1;
        return (isAllDay || isFullDay) ? true : false;
    };
    EventBase.prototype.addEventListener = function () {
        this.parent.on(event.documentClick, this.appointmentBorderRemove, this);
    };
    EventBase.prototype.appointmentBorderRemove = function (event) {
        var element = event.event.target;
        if (closest(element, '.' + cls.APPOINTMENT_CLASS)) {
            this.parent.removeSelectedClass();
        }
        else if (!closest(element, '.' + cls.POPUP_OPEN)) {
            this.removeSelectedAppointmentClass();
        }
    };
    EventBase.prototype.wireAppointmentEvents = function (element, event, isPreventCrud) {
        if (isPreventCrud === void 0) { isPreventCrud = false; }
        var isReadOnly = (!isNullOrUndefined(event)) ? event[this.parent.eventFields.isReadonly] : false;
        if (Browser.isTouch && !this.parent.isAdaptive) {
            EventHandler.add(element, 'touchstart', this.eventTouch, this);
        }
        else {
            EventHandler.add(element, 'click', this.eventClick, this);
        }
        if (!this.parent.isAdaptive && !this.parent.activeViewOptions.readonly && !isReadOnly) {
            EventHandler.add(element, 'dblclick', this.eventDoubleClick, this);
        }
        if (!this.parent.activeViewOptions.readonly && !isReadOnly && !isPreventCrud) {
            if (this.parent.resizeModule) {
                this.parent.resizeModule.wireResizeEvent(element);
            }
            if (this.parent.dragAndDropModule) {
                this.parent.dragAndDropModule.wireDragEvent(element);
            }
        }
    };
    EventBase.prototype.eventTouch = function (eventData) {
        var _this = this;
        setTimeout(function () { return _this.isDoubleTapped = false; }, 250);
        if (this.isDoubleTapped) {
            eventData.preventDefault();
            this.eventDoubleClick(eventData);
        }
        else {
            this.isDoubleTapped = true;
            this.eventClick(eventData);
        }
    };
    EventBase.prototype.renderResizeHandler = function (element, spanEvent, isReadOnly) {
        if (!this.parent.resizeModule || !this.parent.allowResizing || this.parent.activeViewOptions.readonly || isReadOnly) {
            return;
        }
        for (var _i = 0, _a = Object.keys(spanEvent); _i < _a.length; _i++) {
            var resizeEdge = _a[_i];
            var resizeHandler = createElement('div', { className: cls.EVENT_RESIZE_CLASS });
            switch (resizeEdge) {
                case 'isLeft':
                    if (!spanEvent.isLeft) {
                        resizeHandler.appendChild(createElement('div', { className: 'e-left-right-resize' }));
                        addClass([resizeHandler], this.parent.enableRtl ? cls.RIGHT_RESIZE_HANDLER : cls.LEFT_RESIZE_HANDLER);
                        prepend([resizeHandler], element);
                    }
                    break;
                case 'isRight':
                    if (!spanEvent.isRight) {
                        resizeHandler.appendChild(createElement('div', { className: 'e-left-right-resize' }));
                        addClass([resizeHandler], this.parent.enableRtl ? cls.LEFT_RESIZE_HANDLER : cls.RIGHT_RESIZE_HANDLER);
                        append([resizeHandler], element);
                    }
                    break;
                case 'isTop':
                    if (!spanEvent.isTop) {
                        resizeHandler.appendChild(createElement('div', { className: 'e-top-bottom-resize' }));
                        addClass([resizeHandler], cls.TOP_RESIZE_HANDLER);
                        prepend([resizeHandler], element);
                    }
                    break;
                case 'isBottom':
                    if (!spanEvent.isBottom) {
                        resizeHandler.appendChild(createElement('div', { className: 'e-top-bottom-resize' }));
                        addClass([resizeHandler], cls.BOTTOM_RESIZE_HANDLER);
                        append([resizeHandler], element);
                    }
                    break;
            }
        }
    };
    EventBase.prototype.eventClick = function (eventData) {
        var _this = this;
        var target = eventData.target;
        if (target.classList.contains(cls.DRAG_CLONE_CLASS) || target.classList.contains(cls.RESIZE_CLONE_CLASS)) {
            return;
        }
        if (eventData.ctrlKey && eventData.which === 1 && this.parent.keyboardInteractionModule) {
            this.parent.quickPopup.quickPopup.hide();
            this.parent.selectedElements = [].slice.call(this.parent.element.querySelectorAll('.' + cls.APPOINTMENT_BORDER));
            var target_1 = closest(eventData.target, '.' + cls.APPOINTMENT_CLASS);
            this.getSelectedEventElements(target_1);
            this.activeEventData(eventData, false);
            var selectArgs = {
                data: this.parent.activeEventData.event,
                element: this.parent.activeEventData.element,
                event: eventData, requestType: 'eventSelect'
            };
            this.parent.trigger(event.select, selectArgs);
            var args = extend(this.parent.activeEventData, { cancel: false, originalEvent: eventData });
            this.parent.trigger(event.eventClick, args);
        }
        else {
            this.removeSelectedAppointmentClass();
            this.activeEventData(eventData, true);
            var selectEventArgs = {
                data: this.parent.activeEventData.event,
                element: this.parent.activeEventData.element,
                event: eventData, requestType: 'eventSelect'
            };
            this.parent.trigger(event.select, selectEventArgs);
            var args = extend(this.parent.activeEventData, { cancel: false, originalEvent: eventData });
            this.parent.trigger(event.eventClick, args, function (eventClickArgs) {
                if (isBlazor()) {
                    var eventFields = _this.parent.eventFields;
                    var eventObj = eventClickArgs.event;
                    eventObj[eventFields.startTime] = _this.parent.getDateTime(eventObj[eventFields.startTime]);
                    eventObj[eventFields.endTime] = _this.parent.getDateTime(eventObj[eventFields.endTime]);
                    if (eventClickArgs.element) {
                        eventClickArgs.element = getElement(eventClickArgs.element);
                    }
                }
                if (eventClickArgs.cancel) {
                    _this.removeSelectedAppointmentClass();
                }
                else {
                    if (_this.parent.currentView === 'Agenda' || _this.parent.currentView === 'MonthAgenda') {
                        addClass([_this.parent.activeEventData.element], cls.AGENDA_SELECTED_CELL);
                    }
                    _this.parent.notify(event.eventClick, eventClickArgs);
                }
            });
        }
    };
    EventBase.prototype.eventDoubleClick = function (e) {
        this.parent.quickPopup.quickPopupHide(true);
        if (e.type === 'touchstart') {
            this.activeEventData(e, true);
        }
        this.removeSelectedAppointmentClass();
        if (!isNullOrUndefined(this.parent.activeEventData.event) &&
            isNullOrUndefined(this.parent.activeEventData.event[this.parent.eventFields.recurrenceID])) {
            this.parent.eventWindow.openEditor(this.parent.activeEventData.event, 'Save');
        }
        else {
            this.parent.currentAction = 'EditOccurrence';
            this.parent.quickPopup.openRecurrenceAlert();
        }
    };
    EventBase.prototype.getEventByGuid = function (guid) {
        return new DataManager({ json: this.parent.eventsProcessed }).executeLocal(new Query().where('Guid', 'equal', guid))[0];
    };
    EventBase.prototype.getEventById = function (id) {
        var eventFields = this.parent.eventFields;
        return new DataManager({ json: this.parent.eventsData }).executeLocal(new Query()
            .where(eventFields.id, 'equal', id))[0];
    };
    EventBase.prototype.generateGuid = function () {
        return 'xyxxxxyx-xxxy-yxxx-xyxx-xxyxxxxyyxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0;
            var v = (c === 'x') ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    EventBase.prototype.getEventIDType = function () {
        if (this.parent.eventsData.length !== 0) {
            return typeof (this.parent.eventsData[0][this.parent.eventFields.id]);
        }
        if (this.parent.blockData.length !== 0) {
            return typeof (this.parent.blockData[0][this.parent.eventFields.id]);
        }
        return 'string';
    };
    EventBase.prototype.getEventMaxID = function (resourceId) {
        var _this = this;
        if (this.parent.eventsData.length < 1 && this.parent.blockData.length < 1) {
            return 1;
        }
        var eventId;
        var idType = this.getEventIDType();
        if (idType === 'string') {
            eventId = this.generateGuid();
        }
        if (idType === 'number') {
            var datas = this.parent.eventsData.concat(this.parent.blockData);
            var maxId = Math.max.apply(Math, datas.map(function (event) { return event[_this.parent.eventFields.id]; }));
            maxId = isNullOrUndefined(resourceId) ? maxId : maxId + resourceId;
            eventId = maxId + 1;
        }
        return eventId;
    };
    EventBase.prototype.activeEventData = function (eventData, isMultiple) {
        var _this = this;
        var target = closest(eventData.target, '.' + cls.APPOINTMENT_CLASS);
        var guid = target.getAttribute('data-guid');
        if (isMultiple) {
            this.addSelectedAppointments([].slice.call(this.parent.element.querySelectorAll('div[data-guid="' + guid + '"]')));
            target.focus();
        }
        var eventObject = this.getEventByGuid(guid);
        if (eventObject && eventObject.isSpanned) {
            eventObject = this.parent.eventsData.filter(function (obj) {
                return obj[_this.parent.eventFields.id] === eventObject[_this.parent.eventFields.id];
            })[0];
        }
        this.parent.activeEventData = { event: eventObject, element: target };
    };
    EventBase.prototype.generateOccurrence = function (event, viewDate, oldTimezone, isMaxCount) {
        var startDate = event[this.parent.eventFields.startTime];
        var endDate = event[this.parent.eventFields.endTime];
        var eventRule = event[this.parent.eventFields.recurrenceRule];
        var duration = endDate.getTime() - startDate.getTime();
        viewDate = new Date((viewDate || this.parent.activeView.startDate()).getTime() - duration);
        var exception = event[this.parent.eventFields.recurrenceException];
        var maxCount;
        if (this.parent.currentView !== 'Agenda' && isMaxCount) {
            maxCount = util.getDateCount(this.parent.activeView.startDate(), this.parent.activeView.endDate()) + 1;
        }
        var newTimezone = this.parent.timezone || this.parent.tzModule.getLocalTimezoneName();
        var firstDay = this.parent.activeViewOptions.firstDayOfWeek;
        var calendarMode = this.parent.calendarMode;
        var dates = generate(startDate, eventRule, exception, firstDay, maxCount, viewDate, calendarMode, oldTimezone, newTimezone);
        if (this.parent.currentView === 'Agenda' && eventRule.indexOf('COUNT') === -1 && eventRule.indexOf('UNTIL') === -1) {
            if (isNullOrUndefined(event.generatedDates)) {
                event.generatedDates = { start: new Date(dates[0]), end: new Date(dates[dates.length - 1]) };
            }
            else {
                if (dates[0] < event.generatedDates.start.getTime()) {
                    event.generatedDates.start = new Date(dates[0]);
                }
                if (dates[dates.length - 1] > event.generatedDates.end.getTime()) {
                    event.generatedDates.end = new Date(dates[dates.length - 1]);
                }
            }
        }
        var occurrenceCollection = [];
        for (var _i = 0, dates_1 = dates; _i < dates_1.length; _i++) {
            var date = dates_1[_i];
            var clonedObject = extend({}, event, null, true);
            clonedObject[this.parent.eventFields.startTime] = new Date(date);
            clonedObject[this.parent.eventFields.endTime] = new Date(new Date(date).setMilliseconds(duration));
            clonedObject[this.parent.eventFields.recurrenceID] = clonedObject[this.parent.eventFields.id];
            delete clonedObject[this.parent.eventFields.recurrenceException];
            delete clonedObject[this.parent.eventFields.followingID];
            clonedObject.Guid = this.generateGuid();
            occurrenceCollection.push(clonedObject);
        }
        return occurrenceCollection;
    };
    EventBase.prototype.getRecurrenceEvent = function (eventData) {
        var eventFields = this.parent.eventFields;
        var parentApp = new DataManager(this.parent.eventsData).
            executeLocal(new Query().where(eventFields.id, 'equal', eventData[eventFields.recurrenceID]));
        return parentApp[0];
    };
    EventBase.prototype.getParentEvent = function (eventObj, isParent) {
        if (isParent === void 0) { isParent = false; }
        var parentEvent;
        do {
            eventObj = this.getFollowingEvent(eventObj);
            if (eventObj) {
                parentEvent = extend({}, eventObj, null, true);
            }
        } while (eventObj && isParent);
        if (isParent && parentEvent) {
            var collection = this.getEventCollections(parentEvent);
            var followObj = collection.follow.slice(-1)[0];
            if (collection.occurrence.length > 0 && !parentEvent[this.parent.eventFields.recurrenceException]) {
                followObj = collection.occurrence.slice(-1)[0];
            }
            if (followObj) {
                parentEvent[this.parent.eventFields.recurrenceRule] = followObj[this.parent.eventFields.recurrenceRule];
            }
        }
        return parentEvent;
    };
    EventBase.prototype.getEventCollections = function (parentObj, childObj) {
        var followingCollection = [];
        var occurrenceCollection = [];
        var followingEvent = parentObj;
        do {
            followingEvent = this.getFollowingEvent(followingEvent, true);
            if (followingEvent) {
                followingCollection.push(followingEvent);
            }
            occurrenceCollection = occurrenceCollection.concat(this.getOccurrenceEvent(followingEvent || parentObj));
        } while (followingEvent);
        var collections = {};
        if (childObj) {
            var fields_1 = this.parent.eventFields;
            collections = {
                follow: followingCollection.filter(function (eventData) {
                    return eventData[fields_1.startTime] >= childObj[fields_1.startTime];
                }),
                occurrence: occurrenceCollection.filter(function (eventData) {
                    return eventData[fields_1.startTime] >= childObj[fields_1.startTime];
                })
            };
        }
        else {
            collections = { follow: followingCollection, occurrence: occurrenceCollection };
        }
        return collections;
    };
    EventBase.prototype.getFollowingEvent = function (parentObj, isReverse) {
        var fields = this.parent.eventFields;
        var fieldValue;
        if (isReverse) {
            fieldValue = parentObj[fields.id];
        }
        else {
            fieldValue = (parentObj[fields.recurrenceID] || parentObj[fields.followingID]);
        }
        var filterQuery = new Query().where(isReverse ? fields.followingID : fields.id, 'equal', fieldValue);
        var parentApp = new DataManager(this.parent.eventsData).executeLocal(filterQuery);
        return parentApp.shift();
    };
    EventBase.prototype.isFollowingEvent = function (parentObj, childObj) {
        var parentStart = parentObj[this.parent.eventFields.startTime];
        var childStart = childObj[this.parent.eventFields.startTime];
        return parentStart.getHours() === childStart.getHours() && parentStart.getMinutes() === childStart.getMinutes() &&
            parentStart.getSeconds() === childStart.getSeconds();
    };
    EventBase.prototype.getOccurrenceEvent = function (eventObj, isGuid, isFollowing) {
        if (isGuid === void 0) { isGuid = false; }
        if (isFollowing === void 0) { isFollowing = false; }
        var idField = isGuid ? 'Guid' : (isFollowing) ? this.parent.eventFields.followingID : this.parent.eventFields.recurrenceID;
        var fieldKey = isGuid ? 'Guid' : this.parent.eventFields.id;
        var filterQuery = new Query().where(idField, 'equal', eventObj[fieldKey]);
        var dataSource = isGuid ? this.parent.eventsProcessed : this.parent.eventsData;
        return new DataManager(dataSource).executeLocal(filterQuery);
    };
    EventBase.prototype.getOccurrencesByID = function (id) {
        var fields = this.parent.eventFields;
        var occurrenceCollection = [];
        var parentObject = this.parent.eventsData.filter(function (obj) { return obj[fields.id] === id; });
        for (var _i = 0, _a = parentObject; _i < _a.length; _i++) {
            var event_3 = _a[_i];
            if (!isNullOrUndefined(event_3[fields.recurrenceRule])) {
                occurrenceCollection = occurrenceCollection.concat(this.generateOccurrence(event_3));
            }
        }
        return occurrenceCollection;
    };
    EventBase.prototype.getOccurrencesByRange = function (startTime, endTime) {
        var fields = this.parent.eventFields;
        var occurrenceCollection = [];
        for (var _i = 0, _a = this.parent.eventsData; _i < _a.length; _i++) {
            var event_4 = _a[_i];
            if (!isNullOrUndefined(event_4[fields.recurrenceRule])) {
                occurrenceCollection = occurrenceCollection.concat(this.generateOccurrence(event_4));
            }
        }
        var filter = occurrenceCollection.filter(function (obj) {
            return obj[fields.startTime] >= startTime && obj[fields.endTime] <= endTime && !isNullOrUndefined(obj[fields.recurrenceID]);
        });
        return filter;
    };
    EventBase.prototype.getDeletedOccurrences = function (recurrenceData) {
        var _this = this;
        var fields = this.parent.eventFields;
        var parentObject;
        var deletedOccurrences = [];
        if (typeof recurrenceData === 'string' || typeof recurrenceData === 'number') {
            parentObject = this.parent.eventsData.filter(function (obj) {
                return obj[fields.id] === recurrenceData;
            })[0];
        }
        else {
            parentObject = extend({}, recurrenceData, null, true);
        }
        if (parentObject[fields.recurrenceException]) {
            var exDateString = parentObject[fields.recurrenceException].split(',');
            exDateString.forEach(function (date) {
                var edited = _this.parent.eventsData.filter(function (eventObj) {
                    return eventObj[fields.recurrenceID] === parentObject[fields.id] && eventObj[fields.recurrenceException] === date;
                });
                if (edited.length === 0) {
                    var exDate = getDateFromRecurrenceDateString(date);
                    var childObject = extend({}, recurrenceData, null, true);
                    childObject[fields.recurrenceID] = parentObject[fields.id];
                    delete childObject[fields.followingID];
                    childObject[fields.recurrenceException] = date;
                    var startDate = new Date(exDate.getTime());
                    var time = parentObject[fields.endTime].getTime() - parentObject[fields.startTime].getTime();
                    var endDate = new Date(startDate.getTime());
                    endDate.setMilliseconds(time);
                    childObject[fields.startTime] = new Date(startDate.getTime());
                    childObject[fields.endTime] = new Date(endDate.getTime());
                    deletedOccurrences.push(childObject);
                }
            });
        }
        return deletedOccurrences;
    };
    EventBase.prototype.applyResourceColor = function (element, data, type, index, alpha) {
        if (!this.parent.resourceBase) {
            return;
        }
        var alphaColor = function (color, alpha) {
            color = color.replace('#', '');
            var r = parseInt(color.substring(0, color.length / 3), 16);
            var g = parseInt(color.substring(color.length / 3, 2 * color.length / 3), 16);
            var b = parseInt(color.substring(2 * color.length / 3, 3 * color.length / 3), 16);
            return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
        };
        // index refers groupOrder
        var color = this.parent.resourceBase.getResourceColor(data, index);
        if (color) {
            // tslint:disable-next-line:no-any
            element.style[type] = !isNullOrUndefined(alpha) ? alphaColor(color, alpha) : color;
        }
    };
    EventBase.prototype.createBlockAppointmentElement = function (record, resIndex) {
        var eventSubject = (record[this.parent.eventFields.subject] || this.parent.eventSettings.fields.subject.default);
        var appointmentWrapper = createElement('div', {
            className: cls.BLOCK_APPOINTMENT_CLASS,
            attrs: {
                'data-id': 'Appointment_' + record[this.parent.eventFields.id],
                'aria-readonly': 'true', 'aria-selected': 'false', 'aria-label': eventSubject
            }
        });
        var templateElement;
        if (!isNullOrUndefined(this.parent.activeViewOptions.eventTemplate)) {
            var scheduleId = this.parent.element.id + '_';
            var viewName = this.parent.activeViewOptions.eventTemplateName;
            var templateId = scheduleId + viewName + 'eventTemplate';
            var templateArgs = util.addLocalOffsetToEvent(record, this.parent.eventFields);
            templateElement = this.parent.getAppointmentTemplate()(templateArgs, this.parent, 'eventTemplate', templateId, false);
        }
        else {
            var appointmentSubject = createElement('div', {
                className: cls.SUBJECT_CLASS, innerHTML: eventSubject
            });
            templateElement = [appointmentSubject];
        }
        append(templateElement, appointmentWrapper);
        this.setWrapperAttributes(appointmentWrapper, resIndex);
        return appointmentWrapper;
    };
    EventBase.prototype.setWrapperAttributes = function (appointmentWrapper, resIndex) {
        if (!isNullOrUndefined(this.cssClass)) {
            addClass([appointmentWrapper], this.cssClass);
        }
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            appointmentWrapper.setAttribute('data-group-index', resIndex.toString());
        }
    };
    EventBase.prototype.getReadonlyAttribute = function (event) {
        return (event[this.parent.eventFields.isReadonly]) ?
            event[this.parent.eventFields.isReadonly] : 'false';
    };
    EventBase.prototype.isBlockRange = function (eventData) {
        var _this = this;
        var eventCollection = (eventData instanceof Array) ? eventData : [eventData];
        var isBlockAlert = false;
        var fields = this.parent.eventFields;
        eventCollection.forEach(function (event) {
            var dataCol = [];
            if (!isNullOrUndefined(event[fields.recurrenceRule]) &&
                (isNullOrUndefined(event[fields.recurrenceID]) || event[fields.id] === event[fields.recurrenceID])) {
                dataCol = _this.generateOccurrence(event);
            }
            else {
                dataCol.push(event);
            }
            for (var _i = 0, dataCol_1 = dataCol; _i < dataCol_1.length; _i++) {
                var data = dataCol_1[_i];
                var filterBlockEvents = _this.filterBlockEvents(data);
                if (filterBlockEvents.length > 0) {
                    isBlockAlert = true;
                    break;
                }
            }
        });
        this.parent.uiStateValues.isBlock = isBlockAlert;
        return isBlockAlert;
    };
    EventBase.prototype.getFilterEventsList = function (dataSource, query) {
        return new DataManager(dataSource).executeLocal(new Query().where(query));
    };
    EventBase.prototype.getSeriesEvents = function (parentEvent, startTime) {
        var fields = this.parent.eventFields;
        startTime = isNullOrUndefined(startTime) ? parentEvent[fields.startTime] : startTime;
        var deleteFutureEditEvents;
        var futureEvents;
        var deleteFutureEditEventList = [];
        var delId = parentEvent[fields.id];
        var followingId = parentEvent[fields.followingID];
        var deleteFutureEvent;
        var startTimeQuery = this.parent.currentAction === 'EditSeries' ? 'greaterthan' : 'greaterthanorequal';
        do {
            deleteFutureEvent = ((new Predicate(fields.followingID, 'equal', delId))).
                and(new Predicate(fields.startTime, startTimeQuery, startTime));
            futureEvents = this.getFilterEventsList(this.parent.eventsData, deleteFutureEvent);
            deleteFutureEditEvents = futureEvents.slice(-1)[0];
            if (!isNullOrUndefined(deleteFutureEditEvents) && deleteFutureEditEvents[fields.id] !== followingId) {
                deleteFutureEditEventList.push(deleteFutureEditEvents);
                delId = deleteFutureEditEvents[fields.id];
                followingId = deleteFutureEditEvents[fields.followingID];
            }
            else {
                followingId = null;
            }
        } while (futureEvents.length === 1 && !isNullOrUndefined(deleteFutureEditEvents[fields.followingID]));
        return deleteFutureEditEventList;
    };
    EventBase.prototype.getEditedOccurrences = function (deleteFutureEditEventList, startTime) {
        var fields = this.parent.eventFields;
        var deleteRecurrenceEventList = [];
        var delEditedEvents;
        for (var _i = 0, deleteFutureEditEventList_1 = deleteFutureEditEventList; _i < deleteFutureEditEventList_1.length; _i++) {
            var event_5 = deleteFutureEditEventList_1[_i];
            var delEventQuery = new Predicate(fields.recurrenceID, 'equal', event_5[fields.id]).
                or(new Predicate(fields.recurrenceID, 'equal', event_5[fields.followingID]).
                and(new Predicate(fields.recurrenceID, 'notequal', undefined)));
            if (this.parent.currentAction === 'EditFollowingEvents' || this.parent.currentAction === 'DeleteFollowingEvents') {
                delEventQuery = delEventQuery.and(new Predicate(fields.startTime, 'greaterthanorequal', startTime));
            }
            delEditedEvents = this.getFilterEventsList(this.parent.eventsData, delEventQuery);
            deleteRecurrenceEventList = deleteRecurrenceEventList.concat(delEditedEvents);
        }
        return deleteRecurrenceEventList;
    };
    return EventBase;
}());
export { EventBase };
