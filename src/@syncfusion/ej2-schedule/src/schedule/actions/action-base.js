import { addClass, createElement, extend, isNullOrUndefined, closest, setStyleAttribute } from '@syncfusion/ej2-base';
import { formatUnit, remove, removeClass, isBlazor } from '@syncfusion/ej2-base';
import * as cls from '../base/css-constant';
import * as util from '../base/util';
/**
 * Base class for the common drag and resize related actions
 */
var ActionBase = /** @class */ (function () {
    function ActionBase(parent) {
        this.daysVariation = 0;
        this.parent = parent;
        this.actionObj = {
            X: 0, Y: 0, groupIndex: 0, cellWidth: 0, cellHeight: 0, slotInterval: 0, interval: 0, actionIndex: 0,
            cloneElement: [], originalElement: [], action: null, isAllDay: null, excludeSelectors: null,
            index: 0, navigationInterval: null, scrollInterval: null
        };
        this.scrollArgs = { element: null, width: 0, height: 0 };
        this.resizeEdges = { left: false, right: false, top: false, bottom: false };
        this.scrollEdges = { left: false, right: false, top: false, bottom: false };
    }
    ActionBase.prototype.getChangedData = function () {
        var eventObj = extend({}, this.actionObj.event, null, true);
        eventObj[this.parent.eventFields.startTime] = this.actionObj.start;
        eventObj[this.parent.eventFields.endTime] = this.actionObj.end;
        if (!isNullOrUndefined(this.actionObj.isAllDay)) {
            eventObj[this.parent.eventFields.isAllDay] = this.actionObj.isAllDay;
        }
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            var originalElement = this.getOriginalElement(this.actionObj.element);
            var indexCol = originalElement.map(function (element) { return parseInt(element.getAttribute('data-group-index'), 10); });
            if (indexCol.indexOf(this.actionObj.groupIndex) === -1) {
                var cloneIndex_1 = parseInt(this.actionObj.clone.getAttribute('data-group-index'), 10);
                indexCol = indexCol.filter(function (index) { return index !== cloneIndex_1; });
                indexCol.push(this.actionObj.groupIndex);
                this.parent.resourceBase.getResourceData(eventObj, this.actionObj.groupIndex, indexCol);
            }
        }
        return eventObj;
    };
    ActionBase.prototype.saveChangedData = function (eventArgs) {
        this.parent.activeEventData.event = this.actionObj.event;
        this.parent.currentAction = 'Save';
        if (isBlazor()) {
            eventArgs.data[this.parent.eventFields.startTime] = this.parent.getDateTime(eventArgs.data[this.parent.eventFields.startTime]);
            eventArgs.data[this.parent.eventFields.endTime] = this.parent.getDateTime(eventArgs.data[this.parent.eventFields.endTime]);
        }
        var eventObj = eventArgs.data;
        var isSameResource = (this.parent.activeViewOptions.group.resources.length > 0) ?
            parseInt(this.actionObj.element.getAttribute('data-group-index'), 10) === this.actionObj.groupIndex : true;
        if (+eventObj[this.parent.eventFields.startTime] === +this.actionObj.event[this.parent.eventFields.startTime] &&
            +eventObj[this.parent.eventFields.endTime] === +this.actionObj.event[this.parent.eventFields.endTime] && isSameResource) {
            return;
        }
        var currentAction;
        if (eventObj[this.parent.eventFields.recurrenceRule]) {
            var eveId = eventObj[this.parent.eventFields.recurrenceID] || eventObj[this.parent.eventFields.id];
            if (eventObj[this.parent.eventFields.id] === eventObj[this.parent.eventFields.recurrenceID]) {
                eventObj[this.parent.eventFields.id] = this.parent.eventBase.getEventMaxID();
                currentAction = 'EditOccurrence';
            }
            if (this.parent.enableRecurrenceValidation
                && this.parent.eventWindow.editOccurrenceValidation(eveId, eventObj, this.actionObj.event)) {
                this.parent.quickPopup.openRecurrenceValidationAlert('sameDayAlert');
                return;
            }
        }
        if (eventObj[this.parent.eventFields.startTimezone] || eventObj[this.parent.eventFields.endTimezone]) {
            this.parent.eventBase.timezoneConvert(eventObj);
        }
        this.parent.crudModule.saveEvent(eventObj, currentAction);
    };
    ActionBase.prototype.calculateIntervalTime = function (date) {
        var intervalTime = new Date(+date);
        intervalTime.setMinutes(Math.floor(intervalTime.getMinutes() / this.actionObj.interval) * this.actionObj.interval);
        return intervalTime;
    };
    ActionBase.prototype.getContentAreaDimension = function () {
        var viewElement = this.parent.element.querySelector('.' + cls.CONTENT_WRAP_CLASS);
        var trElement = [].slice.call(viewElement.querySelector('tr').children);
        if (!this.parent.activeView.isTimelineView() && this.parent.activeViewOptions.group.resources.length > 0 &&
            !this.parent.isAdaptive) {
            trElement = this.getResourceElements(trElement);
        }
        var leftOffset = trElement[0].getBoundingClientRect();
        var rightOffset = trElement.slice(-1)[0].getBoundingClientRect();
        var viewDimension = {
            bottom: viewElement.scrollHeight - 5,
            left: this.parent.enableRtl ? rightOffset.left : leftOffset.left,
            right: this.parent.enableRtl ? leftOffset.right : rightOffset.right,
            top: 0
        };
        return viewDimension;
    };
    ActionBase.prototype.getPageCoordinates = function (e) {
        var eventArgs = e.event;
        return eventArgs && eventArgs.changedTouches ? eventArgs.changedTouches[0] : e.changedTouches ? e.changedTouches[0] :
            eventArgs || e;
    };
    ActionBase.prototype.getIndex = function (index) {
        var contentElements = [].slice.call(this.parent.getContentTable().querySelector('tr').children);
        var indexes = { minIndex: 0, maxIndex: contentElements.length - 1 };
        if (this.actionObj.action === 'resize' && this.parent.activeViewOptions.group.resources.length > 0 &&
            !this.parent.uiStateValues.isGroupAdaptive && !this.parent.activeView.isTimelineView()) {
            var groupElements = this.getResourceElements(contentElements);
            indexes.minIndex = groupElements[0].cellIndex;
            indexes.maxIndex = groupElements.slice(-1)[0].cellIndex;
        }
        if (index < indexes.minIndex) {
            index = indexes.minIndex;
        }
        if (index > indexes.maxIndex) {
            index = indexes.maxIndex;
        }
        return index;
    };
    ActionBase.prototype.updateTimePosition = function (date) {
        for (var _i = 0, _a = this.actionObj.cloneElement; _i < _a.length; _i++) {
            var cloneElement = _a[_i];
            var timeElement = cloneElement.querySelector('.' + cls.APPOINTMENT_TIME);
            if (timeElement) {
                timeElement.innerHTML = this.parent.getTimeString(this.actionObj.start) + ' - ' +
                    this.parent.getTimeString(this.actionObj.end);
            }
        }
        if (!this.parent.activeViewOptions.timeScale.enable || !this.parent.isAdaptive || this.parent.currentView === 'Month' ||
            this.parent.currentView === 'TimelineMonth') {
            return;
        }
        var timeIndicator = this.parent.element.querySelector('.' + cls.CLONE_TIME_INDICATOR_CLASS);
        if (!timeIndicator) {
            timeIndicator = createElement('div', { className: cls.CLONE_TIME_INDICATOR_CLASS });
            var wrapperClass = this.parent.activeView.isTimelineView() ? cls.DATE_HEADER_WRAP_CLASS : cls.TIME_CELLS_WRAP_CLASS;
            this.parent.element.querySelector('.' + wrapperClass).appendChild(timeIndicator);
        }
        timeIndicator.innerHTML = this.parent.getTimeString(date);
        var offsetValue = 0;
        if (this.parent.activeView.isTimelineView()) {
            if (this.parent.enableRtl) {
                var rightValue = parseInt(this.actionObj.clone.style.right, 10);
                offsetValue = this.actionObj.action === 'drag' || this.resizeEdges.left ?
                    rightValue + this.actionObj.clone.offsetWidth : rightValue;
                timeIndicator.style.right = formatUnit(offsetValue);
            }
            else {
                var leftValue = parseInt(this.actionObj.clone.style.left, 10);
                offsetValue = this.actionObj.action === 'drag' || this.resizeEdges.left ?
                    leftValue : leftValue + this.actionObj.clone.offsetWidth;
                timeIndicator.style.left = formatUnit(offsetValue);
            }
        }
        else {
            offsetValue = this.actionObj.action === 'drag' || this.resizeEdges.top ? this.actionObj.clone.offsetTop :
                this.actionObj.clone.offsetTop + this.actionObj.clone.offsetHeight;
            timeIndicator.style.top = formatUnit(offsetValue);
        }
    };
    ActionBase.prototype.getResourceElements = function (table) {
        var _this = this;
        return table.filter(function (element) {
            return parseInt(element.getAttribute('data-group-index'), 10) === _this.actionObj.groupIndex;
        });
    };
    ActionBase.prototype.getOriginalElement = function (element) {
        var originalElement;
        var guid = element.getAttribute('data-guid');
        var isMorePopup = element.offsetParent && element.offsetParent.classList.contains(cls.MORE_EVENT_POPUP_CLASS);
        if (isMorePopup || this.parent.activeView.isTimelineView()) {
            originalElement = [].slice.call(this.parent.element.querySelectorAll('[data-guid="' + guid + '"]'));
        }
        else {
            var tr = closest(element, 'tr');
            originalElement = [].slice.call(tr.querySelectorAll('[data-guid="' + guid + '"]'));
        }
        return originalElement;
    };
    ActionBase.prototype.createCloneElement = function (element) {
        var cloneWrapper = createElement('div', { innerHTML: element.outerHTML });
        var cloneElement = cloneWrapper.childNodes.item(0);
        var cloneClassLists = [cls.CLONE_ELEMENT_CLASS];
        cloneClassLists.push((this.actionObj.action === 'drag') ? cls.DRAG_CLONE_CLASS : cls.RESIZE_CLONE_CLASS);
        if (this.parent.currentView === 'Month' || this.parent.currentView === 'TimelineMonth') {
            cloneClassLists.push(cls.MONTH_CLONE_ELEMENT_CLASS);
        }
        addClass([cloneElement], cloneClassLists);
        addClass([element], cls.EVENT_ACTION_CLASS);
        if (!isNullOrUndefined(element.parentElement)) {
            element.parentElement.appendChild(cloneElement);
        }
        cloneElement.style.width = formatUnit(cloneElement.offsetWidth - 2);
        if (this.parent.eventDragArea && this.actionObj.action === 'drag') {
            document.querySelector(this.parent.eventDragArea).appendChild(cloneElement);
        }
        setStyleAttribute(cloneElement, { border: '0px' });
        return cloneElement;
    };
    ActionBase.prototype.removeCloneElementClasses = function () {
        var elements = this.actionObj.originalElement;
        if (this.parent.currentView === 'Month') {
            elements = [].slice.call(this.parent.element.querySelectorAll('.' + cls.EVENT_ACTION_CLASS));
        }
        elements.forEach(function (element) { return removeClass([element], cls.EVENT_ACTION_CLASS); });
    };
    ActionBase.prototype.removeCloneElement = function () {
        this.actionObj.originalElement = [];
        this.actionObj.cloneElement.forEach(function (element) {
            if (!isNullOrUndefined(element.parentNode)) {
                remove(element);
            }
        });
        this.actionObj.cloneElement = [];
        var timeIndicator = this.parent.element.querySelector('.' + cls.CLONE_TIME_INDICATOR_CLASS);
        if (timeIndicator) {
            remove(timeIndicator);
        }
    };
    ActionBase.prototype.getCursorElement = function (e) {
        var pages = this.getPageCoordinates(e);
        return document.elementFromPoint(pages.clientX, pages.clientY);
    };
    ActionBase.prototype.autoScroll = function () {
        var parent = this.parent.element.querySelector('.' + cls.CONTENT_WRAP_CLASS);
        var yIsScrollable = parent.offsetHeight <= parent.scrollHeight;
        var xIsScrollable = parent.offsetWidth <= parent.scrollWidth;
        var yInBounds = yIsScrollable && parent.scrollTop >= 0 && parent.scrollTop + parent.offsetHeight <= parent.scrollHeight;
        var xInBounds = xIsScrollable && parent.scrollLeft >= 0 && parent.scrollLeft + parent.offsetWidth <= parent.scrollWidth;
        if (yInBounds && (this.scrollEdges.top || this.scrollEdges.bottom)) {
            parent.scrollTop += this.scrollEdges.top ? -this.actionObj.scroll.scrollBy : this.actionObj.scroll.scrollBy;
            if (this.actionObj.action === 'resize') {
                if (parent.scrollHeight !== parent.offsetHeight + parent.scrollTop && parent.scrollTop > 0) {
                    this.actionObj.Y += this.scrollEdges.top ? this.actionObj.scroll.scrollBy : -this.actionObj.scroll.scrollBy;
                }
            }
        }
        if (xInBounds && (this.scrollEdges.left || this.scrollEdges.right)) {
            parent.scrollLeft += this.scrollEdges.left ? -this.actionObj.scroll.scrollBy : this.actionObj.scroll.scrollBy;
            if (this.actionObj.action === 'resize') {
                if (parent.scrollWidth !== parent.offsetWidth + parent.scrollLeft && parent.scrollLeft > 0) {
                    this.actionObj.X += this.scrollEdges.left ? this.actionObj.scroll.scrollBy : -this.actionObj.scroll.scrollBy;
                }
            }
        }
    };
    ActionBase.prototype.autoScrollValidation = function (e) {
        if (!this.actionObj.scroll.enable) {
            return false;
        }
        var res = this.parent.boundaryValidation(this.actionObj.pageY, this.actionObj.pageX);
        this.scrollEdges = res;
        return res.bottom || res.top || res.left || res.right;
    };
    ActionBase.prototype.actionClass = function (type) {
        if (type === 'addClass') {
            addClass([this.parent.element], cls.EVENT_ACTION_CLASS);
        }
        else {
            removeClass([this.parent.element], cls.EVENT_ACTION_CLASS);
        }
    };
    ActionBase.prototype.updateScrollPosition = function (e) {
        var _this = this;
        if (this.actionObj.scroll.enable && isNullOrUndefined(this.actionObj.scrollInterval)) {
            this.actionObj.scrollInterval = window.setInterval(function () {
                if (_this.autoScrollValidation(e) && !_this.actionObj.clone.classList.contains(cls.ALLDAY_APPOINTMENT_CLASS)) {
                    _this.autoScroll();
                    if (_this.actionObj.action === 'drag') {
                        _this.parent.dragAndDropModule.updateDraggingDateTime(e);
                    }
                    else {
                        _this.parent.resizeModule.updateResizingDirection(e);
                    }
                }
            }, this.actionObj.scroll.timeDelay);
        }
    };
    ActionBase.prototype.updateOriginalElement = function (cloneElement) {
        var query = '[data-id="' + cloneElement.getAttribute('data-id') + '"]';
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            query = query.concat('[data-group-index = "' + cloneElement.getAttribute('data-group-index') + '"]');
        }
        var elements = [].slice.call(this.parent.element.querySelectorAll(query));
        elements.forEach(function (element) { return addClass([element], cls.EVENT_ACTION_CLASS); });
        var appWrap = [].slice.call(this.parent.element.querySelectorAll('.e-schedule-event-clone'));
        appWrap.forEach(function (element) { return removeClass([element], cls.EVENT_ACTION_CLASS); });
    };
    ActionBase.prototype.getUpdatedEvent = function (startTime, endTime, eventObj) {
        var event = JSON.parse(JSON.stringify(eventObj));
        event[this.parent.eventFields.startTime] = startTime;
        event[this.parent.eventFields.endTime] = endTime;
        return event;
    };
    ActionBase.prototype.dynamicEventsRendering = function (event) {
        var _this = this;
        var dateRender = this.parent.activeView.renderDates;
        var workCells = [].slice.call(this.parent.element.querySelectorAll('.' + cls.WORK_CELLS_CLASS));
        var workDays = this.parent.activeViewOptions.workDays;
        var groupOrder;
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            var resources = this.parent.resourceBase.lastResourceLevel.
                filter(function (res) { return res.groupIndex === _this.actionObj.groupIndex; });
            dateRender = resources[0].renderDates;
            workCells = [].slice.call(this.parent.element.
                querySelectorAll('.' + cls.WORK_CELLS_CLASS + '[data-group-index="' + this.actionObj.groupIndex + '"]'));
            workDays = resources[0].workDays;
            groupOrder = resources[0].groupOrder;
        }
        this.monthEvent.dateRender = dateRender;
        this.monthEvent.getSlotDates(workDays);
        var appWrap = [].slice.call(this.parent.element.querySelectorAll('.e-schedule-event-clone'));
        if (appWrap.length > 0) {
            (appWrap).forEach(function (element) { return remove(element); });
        }
        var splittedEvents = this.monthEvent.splitEvent(event, dateRender);
        for (var _i = 0, splittedEvents_1 = splittedEvents; _i < splittedEvents_1.length; _i++) {
            var event_1 = splittedEvents_1[_i];
            var day = this.parent.getIndexOfDate(dateRender, util.resetTime(event_1[this.monthEvent.fields.startTime]));
            var diffInDays = event_1.data.count;
            var appWidth = (diffInDays * this.actionObj.cellWidth) - 7;
            var appointmentElement = this.monthEvent.createAppointmentElement(event_1, this.actionObj.groupIndex, true);
            appointmentElement.setAttribute('drag', 'true');
            addClass([appointmentElement], 'e-schedule-event-clone');
            this.monthEvent.applyResourceColor(appointmentElement, event_1, 'backgroundColor', groupOrder);
            setStyleAttribute(appointmentElement, { 'width': appWidth + 'px', 'border': '0px', 'pointer-events': 'none' });
            var cellTd = workCells[day];
            this.monthEvent.renderElement(cellTd, appointmentElement);
            this.actionObj.cloneElement.push(appointmentElement);
        }
    };
    /**
     * To destroy the action base module.
     * @return {void}
     * @private
     */
    ActionBase.prototype.destroy = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.actionObj = {};
        this.scrollArgs = {};
        this.resizeEdges = { left: false, right: false, top: false, bottom: false };
        this.scrollEdges = { left: false, right: false, top: false, bottom: false };
    };
    return ActionBase;
}());
export { ActionBase };
