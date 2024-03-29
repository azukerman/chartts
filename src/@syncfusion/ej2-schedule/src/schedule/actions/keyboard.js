import { KeyboardEvents, closest, EventHandler, extend } from '@syncfusion/ej2-base';
import { isNullOrUndefined, addClass } from '@syncfusion/ej2-base';
import * as event from '../base/constant';
import * as util from '../base/util';
import * as cls from '../base/css-constant';
/**
 * Keyboard interaction
 */
var KeyboardInteraction = /** @class */ (function () {
    function KeyboardInteraction(parent) {
        this.selectedCells = [];
        this.keyConfigs = {
            downArrow: 'downarrow',
            upArrow: 'uparrow',
            rightArrow: 'rightarrow',
            leftArrow: 'leftarrow',
            shiftDownArrow: 'shift+downarrow',
            shiftUpArrow: 'shift+uparrow',
            shiftRightArrow: 'shift+rightarrow',
            shiftLeftArrow: 'shift+leftarrow',
            ctrlLeftArrow: 'ctrl+leftarrow',
            ctrlRightArrow: 'ctrl+rightarrow',
            altOne: 'alt+1',
            altTwo: 'alt+2',
            altThree: 'alt+3',
            altFour: 'alt+4',
            altFive: 'alt+5',
            altSix: 'alt+6',
            altSeven: 'alt+7',
            altEight: 'alt+8',
            altNine: 'alt+9',
            enter: 'enter',
            escape: 'escape',
            delete: 'delete',
            home: 'home',
            pageUp: 'pageup',
            pageDown: 'pagedown',
            tab: 'tab',
            shiftTab: 'shift+tab'
        };
        this.parent = parent;
        this.parent.element.tabIndex = this.parent.element.tabIndex === -1 ? 0 : this.parent.element.tabIndex;
        this.keyboardModule = new KeyboardEvents(this.parent.element, {
            keyAction: this.keyActionHandler.bind(this),
            keyConfigs: this.keyConfigs,
            eventName: 'keydown'
        });
        this.addEventListener();
    }
    KeyboardInteraction.prototype.keyActionHandler = function (e) {
        switch (e.action) {
            case 'downArrow':
            case 'shiftDownArrow':
                this.processDown(e, e.shiftKey);
                break;
            case 'upArrow':
            case 'shiftUpArrow':
                this.processUp(e, e.shiftKey);
                break;
            case 'leftArrow':
            case 'shiftLeftArrow':
                this.processLeft(e, e.shiftKey);
                break;
            case 'rightArrow':
            case 'shiftRightArrow':
                this.processRight(e, e.shiftKey);
                break;
            case 'ctrlLeftArrow':
                this.parent.changeDate(this.parent.activeView.getNextPreviousDate('previous'), e);
                if (this.parent.headerModule) {
                    this.parent.headerModule.element.querySelector('.e-prev button').focus();
                }
                break;
            case 'ctrlRightArrow':
                this.parent.changeDate(this.parent.activeView.getNextPreviousDate('next'), e);
                if (this.parent.headerModule) {
                    this.parent.headerModule.element.querySelector('.e-next button').focus();
                }
                break;
            case 'altOne':
            case 'altTwo':
            case 'altThree':
            case 'altFour':
            case 'altFive':
            case 'altSix':
            case 'altSeven':
            case 'altEight':
            case 'altNine':
                this.processViewNavigation(e);
                break;
            case 'enter':
                this.processEnter(e);
                break;
            case 'home':
                this.focusFirstCell();
                break;
            case 'tab':
            case 'shiftTab':
                this.processTab(e, e.shiftKey);
                break;
            case 'delete':
                this.processDelete(e);
                break;
            case 'escape':
                this.processEscape();
        }
    };
    KeyboardInteraction.prototype.addEventListener = function () {
        this.parent.on(event.cellMouseDown, this.onCellMouseDown, this);
    };
    KeyboardInteraction.prototype.removeEventListener = function () {
        this.parent.off(event.cellMouseDown, this.onCellMouseDown);
    };
    KeyboardInteraction.prototype.onCellMouseDown = function (e) {
        if (e.event.shiftKey) {
            return;
        }
        this.initialTarget = this.getClosestCell(e.event);
        if (this.parent.activeViewOptions.readonly || this.parent.currentView === 'MonthAgenda' || !this.initialTarget) {
            return;
        }
        if (e.event.target.classList.contains(cls.WORK_CELLS_CLASS) && e.event.which !== 3) {
            this.parent.removeSelectedClass();
            EventHandler.add(this.parent.getContentTable(), 'mousemove', this.onMouseSelection, this);
            EventHandler.add(this.parent.getContentTable(), 'mouseup', this.onMoveup, this);
        }
        if (e.event.target.classList.contains(cls.ALLDAY_CELLS_CLASS) && e.event.which !== 3) {
            this.parent.removeSelectedClass();
            var allDayRow = this.parent.getAllDayRow();
            EventHandler.add(allDayRow, 'mousemove', this.onMouseSelection, this);
            EventHandler.add(allDayRow, 'mouseup', this.onMoveup, this);
        }
    };
    KeyboardInteraction.prototype.onMouseSelection = function (e) {
        var selectionEdges = this.parent.boundaryValidation(e.pageY, e.pageX);
        if (selectionEdges.bottom || selectionEdges.top || selectionEdges.left || selectionEdges.right) {
            var parent_1 = this.parent.element.querySelector('.' + cls.CONTENT_WRAP_CLASS);
            var yInBounds = parent_1.offsetHeight <= parent_1.scrollHeight && parent_1.scrollTop >= 0 &&
                parent_1.scrollTop + parent_1.offsetHeight <= parent_1.scrollHeight;
            var xInBounds = parent_1.offsetWidth <= parent_1.scrollWidth && parent_1.scrollLeft >= 0 &&
                parent_1.scrollLeft + parent_1.offsetWidth <= parent_1.scrollWidth;
            if (yInBounds && (selectionEdges.top || selectionEdges.bottom)) {
                parent_1.scrollTop += selectionEdges.top ?
                    -e.target.offsetHeight : e.target.offsetHeight;
            }
            if (xInBounds && (selectionEdges.left || selectionEdges.right)) {
                parent_1.scrollLeft += selectionEdges.left ?
                    -e.target.offsetWidth : e.target.offsetWidth;
            }
        }
        var target = this.getClosestCell(e);
        if (target) {
            this.selectCells(true, target);
        }
    };
    KeyboardInteraction.prototype.getClosestCell = function (e) {
        return closest(e.target, '.' + cls.WORK_CELLS_CLASS + ',.' + cls.ALLDAY_CELLS_CLASS);
    };
    KeyboardInteraction.prototype.onMoveup = function (e) {
        var _this = this;
        if (e.target.classList.contains(cls.WORK_CELLS_CLASS)) {
            EventHandler.remove(this.parent.getContentTable(), 'mousemove', this.onMouseSelection);
            EventHandler.remove(this.parent.getContentTable(), 'mouseup', this.onMoveup);
        }
        if (e.target.classList.contains(cls.ALLDAY_CELLS_CLASS)) {
            var allDayRow = this.parent.getAllDayRow();
            EventHandler.remove(allDayRow, 'mousemove', this.onMouseSelection);
            EventHandler.remove(allDayRow, 'mouseup', this.onMoveup);
        }
        if (this.isPreventAction(e)) {
            return;
        }
        var selectedCells = [].slice.call(this.parent.element.querySelectorAll('.e-selected-cell'));
        var queryStr = '.' + cls.WORK_CELLS_CLASS + ',.' + cls.ALLDAY_CELLS_CLASS + ',.' + cls.HEADER_CELLS_CLASS;
        var target = closest(e.target, queryStr);
        this.parent.activeCellsData = this.parent.getCellDetails((selectedCells.length > 1) ? this.parent.getSelectedElements() : target);
        var cellData = {};
        this.parent.eventWindow.convertToEventData(this.parent.activeCellsData, cellData);
        var args = {
            data: cellData,
            element: this.parent.activeCellsData.element,
            showQuickPopup: false, event: e,
            requestType: 'cellSelect'
        };
        this.parent.trigger(event.select, args, function (selectArgs) {
            if (selectArgs.showQuickPopup) {
                var cellArgs = extend(_this.parent.activeCellsData, { cancel: false, event: e, name: 'cellClick' });
                _this.parent.notify(event.cellClick, cellArgs);
            }
        });
    };
    KeyboardInteraction.prototype.processEnter = function (e) {
        if (this.parent.activeViewOptions.readonly || this.isPreventAction(e)) {
            return;
        }
        var target = (e.target);
        if (closest(target, '.' + cls.POPUP_WRAPPER_CLASS)) {
            if (target.classList.contains(cls.QUICK_POPUP_EVENT_DETAILS_CLASS) ||
                target.classList.contains(cls.EVENT_CREATE_CLASS) ||
                target.classList.contains(cls.EDIT_EVENT_CLASS) ||
                target.classList.contains(cls.DELETE_EVENT_CLASS) ||
                target.classList.contains(cls.CLOSE_CLASS)) {
                target.click();
                e.preventDefault();
            }
            else if (target.classList.contains(cls.SUBJECT_CLASS)) {
                this.parent.element.querySelector('.' + cls.EVENT_CREATE_CLASS).click();
                e.preventDefault();
            }
            return;
        }
        if (target.classList.contains(cls.WORK_CELLS_CLASS) || target.classList.contains(cls.ALLDAY_CELLS_CLASS)) {
            if (this.selectedCells.length > 1) {
                var start = this.parent.getCellDetails(this.selectedCells[0]);
                var end = this.parent.getCellDetails(this.selectedCells[this.selectedCells.length - 1]);
                start.endTime = end.endTime;
                start.element = target;
                this.parent.activeCellsData = start;
            }
            else {
                this.parent.activeCellsData = this.parent.getCellDetails(target);
            }
            var args = extend(this.parent.activeCellsData, { cancel: false, event: e });
            this.parent.notify(event.cellClick, args);
            return;
        }
        if (target.classList.contains(cls.APPOINTMENT_CLASS) || target.classList.contains(cls.MORE_EVENT_CLOSE_CLASS) ||
            target.classList.contains(cls.ALLDAY_APPOINTMENT_SECTION_CLASS) || target.classList.contains(cls.MORE_INDICATOR_CLASS)) {
            target.click();
            return;
        }
        if (target.classList.contains(cls.MORE_EVENT_HEADER_DATE_CLASS)) {
            this.parent.setProperties({ selectedDate: new Date(parseInt(target.getAttribute('data-date'), 10)) }, true);
            this.parent.changeView(this.parent.getNavigateView(), e);
            this.processEscape();
            return;
        }
    };
    KeyboardInteraction.prototype.getCells = function (isInverseTable, start, end) {
        var tableEle = this.parent.getContentTable();
        var cells = [].slice.call(tableEle.querySelectorAll('td'));
        var maxRow = tableEle.rows.length;
        var maxColumn = tableEle.rows[0].cells.length;
        if (start.classList.contains(cls.ALLDAY_CELLS_CLASS)) {
            var allDayRow = this.parent.getAllDayRow();
            cells = [].slice.call(allDayRow.cells);
            maxRow = 1;
            maxColumn = allDayRow.cells.length;
        }
        var startIndex = cells.indexOf(start);
        var endIndex = cells.indexOf(end);
        var inverseCells = [];
        if (isInverseTable) {
            for (var i = 0; i < maxColumn; i++) {
                for (var j = 0; j < maxRow; j++) {
                    inverseCells.push(cells[maxColumn * j + i]);
                }
            }
            startIndex = inverseCells.indexOf(start);
            endIndex = inverseCells.indexOf(end);
        }
        if (startIndex > endIndex) {
            var temp = startIndex;
            startIndex = endIndex;
            endIndex = temp;
        }
        var sCells = isInverseTable ? inverseCells : cells;
        return sCells.slice(startIndex, endIndex + 1);
    };
    KeyboardInteraction.prototype.focusFirstCell = function () {
        if (this.parent.currentView === 'Agenda') {
            var focusCell = this.parent.getContentTable().querySelector('.' + cls.AGENDA_CELLS_CLASS);
            focusCell.setAttribute('tabindex', '0');
            focusCell.focus();
            return;
        }
        this.parent.eventBase.removeSelectedAppointmentClass();
        if (this.parent.activeView.isTimelineView()) {
            var cell = this.parent.element.querySelector('.' + cls.CONTENT_TABLE_CLASS +
                ' tr:not(.' + cls.HIDDEN_CLASS + ') .' + cls.WORK_CELLS_CLASS + ':not(.' + cls.RESOURCE_GROUP_CELLS_CLASS + ')');
            this.selectCells(false, cell);
        }
        else {
            this.selectCells(false, this.parent.getWorkCellElements()[0]);
        }
    };
    KeyboardInteraction.prototype.isInverseTableSelect = function () {
        return this.parent.activeView.isInverseTableSelect;
    };
    /** @hidden */
    KeyboardInteraction.prototype.selectCells = function (isMultiple, targetCell) {
        var _this = this;
        this.parent.removeSelectedClass();
        var target = (targetCell instanceof Array) ? targetCell.slice(-1)[0] : targetCell;
        if (isMultiple) {
            var initialId_1;
            var args = {
                element: targetCell,
                allowMultipleRow: true,
                requestType: 'mousemove'
            };
            this.parent.trigger(event.select, args, function (selectArgs) {
                if (!selectArgs.allowMultipleRow) {
                    var currentView = _this.parent.currentView;
                    if (currentView === 'Day' || currentView === 'Week' || currentView === 'WorkWeek') {
                        target = target.parentElement.children[_this.initialTarget.cellIndex];
                    }
                }
                var selectedCells = _this.getCells(_this.isInverseTableSelect(), _this.initialTarget, target);
                if (_this.parent.activeViewOptions.group.resources.length > 0) {
                    initialId_1 = _this.initialTarget.getAttribute('data-group-index');
                    var resourceSelectedCells = [];
                    for (var _i = 0, selectedCells_1 = selectedCells; _i < selectedCells_1.length; _i++) {
                        var cell = selectedCells_1[_i];
                        if (cell.getAttribute('data-group-index') === initialId_1) {
                            resourceSelectedCells.push(cell);
                        }
                    }
                    selectedCells = resourceSelectedCells;
                }
                _this.selectedCells = selectedCells;
                if (selectedCells.length > 2 && !target.classList.contains(cls.ALLDAY_CELLS_CLASS)) {
                    var allDayCells = _this.getAllDayCells(selectedCells);
                    if (_this.parent.activeViewOptions.group.resources.length > 0) {
                        var resourceAllDayCells = [];
                        for (var _a = 0, allDayCells_1 = allDayCells; _a < allDayCells_1.length; _a++) {
                            var cell = allDayCells_1[_a];
                            if (cell.getAttribute('data-group-index') === initialId_1) {
                                resourceAllDayCells.push(cell);
                            }
                        }
                        allDayCells = resourceAllDayCells;
                    }
                    selectedCells = selectedCells.concat(allDayCells);
                }
                if ((target.getAttribute('data-group-index') !== initialId_1) && _this.parent.activeViewOptions.group.resources.length > 0) {
                    target = _this.selectedCells[_this.selectedCells.length - 1];
                }
                _this.parent.addSelectedClass(selectedCells, target);
            });
        }
        else {
            this.initialTarget = target;
            this.selectedCells = [target];
            this.parent.addSelectedClass([target], target);
        }
    };
    KeyboardInteraction.prototype.selectAppointment = function (isReverse, target) {
        var appointments = this.getAppointmentElements();
        if (appointments.length < 0) {
            return;
        }
        this.parent.eventBase.removeSelectedAppointmentClass();
        var nextAppEle;
        if (target.classList.contains(cls.APPOINTMENT_CLASS)) {
            var targetIndex = appointments.indexOf(target);
            nextAppEle = appointments[(isReverse ? targetIndex - 1 : targetIndex + 1)];
        }
        else {
            nextAppEle = isReverse ? appointments[appointments.length - 1] : appointments[0];
        }
        if (nextAppEle) {
            this.parent.eventBase.addSelectedAppointments([nextAppEle]);
            nextAppEle.focus();
            addClass([nextAppEle], cls.AGENDA_SELECTED_CELL);
        }
    };
    KeyboardInteraction.prototype.selectAppointmentElementFromWorkCell = function (isReverse, target) {
        var _this = this;
        this.parent.eventBase.removeSelectedAppointmentClass();
        this.parent.removeSelectedClass();
        if (target.classList.contains(cls.WORK_CELLS_CLASS) || target.classList.contains(cls.ALLDAY_CELLS_CLASS)) {
            var appointmentElements_1 = this.getUniqueAppointmentElements();
            var filteredElements_1 = [];
            var selectedDate_1 = parseInt(target.getAttribute('data-date'), 10);
            var selectedSeriesEvents = this.parent.eventsProcessed.filter(function (eventObject) {
                return (!isReverse ? (eventObject[_this.parent.eventFields.startTime].getTime() >= selectedDate_1) :
                    (eventObject[_this.parent.eventFields.startTime].getTime() <= selectedDate_1));
            });
            selectedSeriesEvents.filter(function (event) {
                appointmentElements_1.filter(function (element) {
                    if (JSON.stringify(event.Guid) === JSON.stringify(element.getAttribute('data-guid'))) {
                        filteredElements_1.push(element);
                    }
                });
            });
            if (filteredElements_1.length > 0) {
                var selectedElement = isReverse ? filteredElements_1[filteredElements_1.length - 1] : filteredElements_1[0];
                var focusElements = this.getAppointmentElementsByGuid(selectedElement.getAttribute('data-guid'));
                this.parent.eventBase.addSelectedAppointments(focusElements);
                (focusElements[focusElements.length - 1]).focus();
            }
        }
    };
    KeyboardInteraction.prototype.getAllDayCells = function (cells) {
        var allDayRow = this.parent.getAllDayRow();
        if (!allDayRow) {
            return [];
        }
        var startCell = cells[0];
        var endCell = cells[cells.length - 1];
        var start = this.parent.getCellDetails(startCell);
        var end = this.parent.getCellDetails(endCell);
        if (end.endTime.getTime() - start.startTime.getTime() >= util.MS_PER_DAY) {
            var allDayCells = [].slice.call(allDayRow.cells);
            return allDayCells.slice(startCell.cellIndex, endCell.cellIndex + 1);
        }
        return [];
    };
    KeyboardInteraction.prototype.getAppointmentElements = function () {
        return [].slice.call(this.parent.element.querySelectorAll('.' + cls.APPOINTMENT_CLASS));
    };
    KeyboardInteraction.prototype.getAppointmentElementsByGuid = function (guid) {
        return [].slice.call(this.parent.element.querySelectorAll('div[data-guid="' + guid + '"]'));
    };
    KeyboardInteraction.prototype.getUniqueAppointmentElements = function () {
        var appointments = this.getAppointmentElements();
        var appointmentElements = [];
        appointments.map(function (value) {
            return value.getAttribute('data-guid');
        }).filter(function (value, index, self) {
            if (self.indexOf(value) === index) {
                appointmentElements.push(appointments[index]);
            }
        });
        return appointmentElements;
    };
    KeyboardInteraction.prototype.getWorkCellFromAppointmentElement = function (target) {
        var selectedObject = this.parent.eventBase.getEventByGuid(target.getAttribute('data-guid'));
        return this.parent.eventBase.selectWorkCellByTime([selectedObject]);
    };
    KeyboardInteraction.prototype.processViewNavigation = function (e) {
        var index = parseInt(e.key, 10) - 1;
        if (index < this.parent.views.length) {
            var view = this.parent.viewCollections[index].option;
            this.parent.changeView(view, e, undefined, index);
            if (this.parent.headerModule) {
                this.parent.headerModule.element.querySelector('.e-active-view button').focus();
            }
        }
    };
    KeyboardInteraction.prototype.processUp = function (e, isMultiple) {
        if ((isMultiple && (this.parent.activeView.isTimelineView() || this.parent.currentView === 'MonthAgenda'))) {
            return;
        }
        var target = (e.target);
        var selectedElements = this.parent.getSelectedElements();
        var selectedEventElements = this.parent.eventBase.getSelectedAppointments();
        var moreEventWrapper = this.parent.element.querySelector('.' + cls.MORE_POPUP_WRAPPER_CLASS);
        var quickPopupWrapper = this.getQuickPopupElement();
        if (selectedElements.length > 0 && !e.target.classList.contains(cls.WORK_CELLS_CLASS)) {
            target = selectedElements[selectedElements.length - 1];
        }
        if (selectedEventElements.length > 0 && !moreEventWrapper.classList.contains(cls.POPUP_OPEN) &&
            !quickPopupWrapper.classList.contains(cls.POPUP_OPEN) &&
            ['Day', 'Week', 'WorkWeek', 'Month'].indexOf(this.parent.currentView) !== -1) {
            target = this.getWorkCellFromAppointmentElement(selectedEventElements[selectedEventElements.length - 1]);
            this.parent.eventBase.removeSelectedAppointmentClass();
        }
        if (!target) {
            return;
        }
        if (target.classList.contains(cls.WORK_CELLS_CLASS) && !this.parent.element.querySelector('.' + cls.POPUP_OPEN)) {
            var tableRows = this.parent.getTableRows();
            var curRowIndex = tableRows.indexOf(target.parentElement);
            if (curRowIndex > 0 && curRowIndex < tableRows.length) {
                this.selectCells(isMultiple, (tableRows[curRowIndex - 1]).cells[target.cellIndex]);
            }
        }
        else if (this.parent.currentView === 'Agenda' || this.parent.currentView === 'MonthAgenda') {
            this.selectAppointment(true, target);
        }
    };
    KeyboardInteraction.prototype.processDown = function (e, isMultiple) {
        if ((isMultiple && (this.parent.activeView.isTimelineView() || this.parent.currentView === 'MonthAgenda'))) {
            return;
        }
        var target = (e.target);
        var selectedCells = this.parent.getSelectedElements();
        var selectedElements = this.parent.eventBase.getSelectedAppointments();
        var moreEventWrapper = this.parent.element.querySelector('.' + cls.MORE_POPUP_WRAPPER_CLASS);
        var quickPopupWrapper = this.getQuickPopupElement();
        if (selectedCells.length > 0 && !e.target.classList.contains(cls.WORK_CELLS_CLASS)) {
            target = selectedCells[selectedCells.length - 1];
        }
        if (selectedElements.length > 0 && !moreEventWrapper.classList.contains(cls.POPUP_OPEN) &&
            !quickPopupWrapper.classList.contains(cls.POPUP_OPEN) &&
            ['Day', 'Week', 'WorkWeek', 'Month'].indexOf(this.parent.currentView) !== -1) {
            target = this.getWorkCellFromAppointmentElement(selectedElements[selectedElements.length - 1]);
            this.parent.eventBase.removeSelectedAppointmentClass();
        }
        var tableRows = this.parent.getTableRows();
        if (!target) {
            return;
        }
        if (target.classList.contains(cls.WORK_CELLS_CLASS) && !this.parent.element.querySelector('.' + cls.POPUP_OPEN)) {
            var curRowIndex = tableRows.indexOf(target.parentElement);
            if (curRowIndex >= 0 && curRowIndex < tableRows.length - 1) {
                this.selectCells(isMultiple, (tableRows[curRowIndex + 1]).cells[target.cellIndex]);
            }
        }
        else if (this.parent.currentView === 'Agenda' || this.parent.currentView === 'MonthAgenda') {
            this.selectAppointment(false, target);
        }
    };
    KeyboardInteraction.prototype.processLeftRight = function (target) {
        var tableEle = this.parent.getContentTable();
        var curRowIndex = target.parentNode.sectionRowIndex;
        var key = {
            element: tableEle,
            rowIndex: curRowIndex,
            columnIndex: target.cellIndex,
            maxIndex: tableEle.rows[curRowIndex].cells.length
        };
        return key;
    };
    KeyboardInteraction.prototype.getQuickPopupElement = function () {
        return (this.parent.isAdaptive ? document.body : this.parent.element).querySelector('.' + cls.POPUP_WRAPPER_CLASS);
    };
    KeyboardInteraction.prototype.isCancelLeftRightAction = function (e, isMultiple) {
        if (this.parent.currentView === 'Agenda' || (isMultiple && this.parent.currentView === 'MonthAgenda')) {
            return true;
        }
        if ((this.isPreventAction(e) && isMultiple)) {
            return true;
        }
        var moreEventWrapper = this.parent.element.querySelector('.' + cls.MORE_POPUP_WRAPPER_CLASS);
        var quickPopupWrapper = this.getQuickPopupElement();
        if (moreEventWrapper.classList.contains(cls.POPUP_OPEN) || quickPopupWrapper.classList.contains(cls.POPUP_OPEN)) {
            return true;
        }
        return false;
    };
    KeyboardInteraction.prototype.processRight = function (e, isMultiple) {
        if (this.isCancelLeftRightAction(e, isMultiple)) {
            return;
        }
        var selectedCells = this.parent.getSelectedElements();
        var targetCell;
        var selectedAppointments = this.parent.eventBase.getSelectedAppointments();
        var target = (e.target);
        if (selectedCells.length > 0 && !target.classList.contains(cls.WORK_CELLS_CLASS) &&
            !target.classList.contains(cls.ALLDAY_CELLS_CLASS)) {
            target = selectedCells[selectedCells.length - 1];
        }
        if (selectedAppointments.length > 0) {
            target = this.getWorkCellFromAppointmentElement(selectedAppointments[selectedAppointments.length - 1]);
            this.parent.eventBase.removeSelectedAppointmentClass();
            if (!target) {
                return;
            }
        }
        if (target.classList.contains(cls.WORK_CELLS_CLASS)) {
            var key = this.processLeftRight(target);
            if (key.columnIndex >= 0 && key.columnIndex < key.maxIndex - 1) {
                targetCell = this.calculateNextPrevDate(target, key.element.rows[key.rowIndex].cells[target.cellIndex + 1], 'right');
                if (!isNullOrUndefined(targetCell)) {
                    this.selectCells(isMultiple, targetCell);
                }
            }
            else if (key.columnIndex === key.maxIndex - 1) {
                if (!this.isInverseTableSelect() && key.rowIndex < key.element.rows.length - 1) {
                    targetCell = this.calculateNextPrevDate(target, key.element.rows[key.rowIndex + 1].cells[0], 'right');
                    if (!isNullOrUndefined(targetCell)) {
                        this.selectCells(isMultiple, targetCell);
                    }
                }
                else if (!isMultiple) {
                    var rowIndex = this.isInverseTableSelect() ? key.rowIndex : 0;
                    this.parent.changeDate(this.parent.activeView.getNextPreviousDate('next'), e);
                    var tableEle = this.parent.getContentTable();
                    this.selectCells(false, tableEle.rows[rowIndex].cells[0]);
                }
            }
        }
        else if (target.classList.contains(cls.ALLDAY_CELLS_CLASS)) {
            var curColIndex = target.cellIndex;
            var allDayRow = this.parent.getAllDayRow();
            var maxColIndex = allDayRow.cells.length;
            if (curColIndex >= 0 && curColIndex < maxColIndex - 1) {
                this.selectCells(isMultiple, allDayRow.cells[curColIndex + 1]);
            }
            else if (curColIndex === maxColIndex - 1 && !isMultiple) {
                this.parent.changeDate(this.parent.activeView.getNextPreviousDate('next'), e);
                var allDayRow_1 = this.parent.getAllDayRow();
                this.selectCells(false, allDayRow_1.cells[0]);
            }
        }
    };
    KeyboardInteraction.prototype.processLeft = function (e, isMultiple) {
        if (this.isCancelLeftRightAction(e, isMultiple)) {
            return;
        }
        var target = (e.target);
        var selectedCells = this.parent.getSelectedElements();
        var targetCell;
        if (selectedCells.length > 0 && !target.classList.contains(cls.WORK_CELLS_CLASS) &&
            !target.classList.contains(cls.ALLDAY_CELLS_CLASS)) {
            target = selectedCells[selectedCells.length - 1];
        }
        var selectedElements = this.parent.eventBase.getSelectedAppointments();
        if (selectedElements.length > 0) {
            target = this.getWorkCellFromAppointmentElement(selectedElements[selectedElements.length - 1]);
            this.parent.eventBase.removeSelectedAppointmentClass();
            if (!target) {
                return;
            }
        }
        if (target.classList.contains(cls.WORK_CELLS_CLASS)) {
            var key = this.processLeftRight(target);
            if (key.columnIndex > 0 && key.columnIndex < key.maxIndex) {
                targetCell = this.calculateNextPrevDate(target, key.element.rows[key.rowIndex].cells[target.cellIndex - 1], 'left');
                if (!isNullOrUndefined(targetCell)) {
                    this.selectCells(isMultiple, targetCell);
                }
            }
            else if (key.columnIndex === 0) {
                if (!this.isInverseTableSelect() && key.rowIndex > 0) {
                    targetCell = this.calculateNextPrevDate(target, key.element.rows[key.rowIndex - 1].cells[key.maxIndex - 1], 'left');
                    if (!isNullOrUndefined(targetCell)) {
                        this.selectCells(isMultiple, targetCell);
                    }
                }
                else if (!isMultiple) {
                    this.parent.changeDate(this.parent.activeView.getNextPreviousDate('previous'), e);
                    var tableEle = this.parent.getContentTable();
                    var rowIndex = this.isInverseTableSelect() ? key.rowIndex : tableEle.rows.length - 1;
                    this.selectCells(false, tableEle.rows[rowIndex].cells[key.maxIndex - 1]);
                }
            }
        }
        else if (target.classList.contains(cls.ALLDAY_CELLS_CLASS)) {
            var curColIndex = target.cellIndex;
            var allDayRow = this.parent.getAllDayRow();
            var maxColIndex = allDayRow.cells.length;
            if (curColIndex > 0 && curColIndex < maxColIndex) {
                this.selectCells(isMultiple, allDayRow.cells[curColIndex - 1]);
            }
            else if (curColIndex === 0 && !isMultiple) {
                this.parent.changeDate(this.parent.activeView.getNextPreviousDate('previous'), e);
                var allDayRow_2 = this.parent.getAllDayRow();
                this.selectCells(false, allDayRow_2.cells[maxColIndex - 1]);
            }
        }
    };
    KeyboardInteraction.prototype.calculateNextPrevDate = function (currentCell, target, type) {
        var initialId = this.initialTarget.getAttribute('data-group-index');
        if (this.parent.activeViewOptions.group.resources.length > 0 && this.parent.currentView === 'Month') {
            if (currentCell && target && target.getAttribute('data-group-index') !== initialId) {
                var currentDate = new Date(parseInt(currentCell.getAttribute('data-date'), 10));
                var nextPrevDate = (type === 'right') ? new Date(currentDate.setDate(currentDate.getDate() + 1))
                    : new Date(currentDate.setDate(currentDate.getDate() - 1));
                target = [].slice.call(this.parent.element.querySelectorAll('td[data-date="'
                    + nextPrevDate.getTime().toString() + '"]' + '[data-group-index="' + initialId + '"]'))[0];
            }
        }
        return target;
    };
    KeyboardInteraction.prototype.getFocusableElements = function (container) {
        var queryString = 'a[href]:not([tabindex="-1"]),input:not([disabled]):not([tabindex="-1"]),' +
            'textarea:not([disabled]):not([tabindex="-1"]),button:not([disabled]):not([tabindex="-1"]),' +
            'select:not([disabled]):not([tabindex="-1"]),[tabindex]:not([tabindex="-1"]),[contentEditable=true]:not([tabindex="-1"])';
        return [].slice.call(container.querySelectorAll(queryString));
    };
    KeyboardInteraction.prototype.processTabOnPopup = function (e, popupElement) {
        var _this = this;
        var focusableElements = this.getFocusableElements(popupElement);
        focusableElements = focusableElements.filter(function (element) {
            var footerEle = _this.parent.element.querySelector('.' + cls.POPUP_FOOTER_CLASS);
            if (footerEle && footerEle.offsetParent) {
                return !(element.classList.contains(cls.EDIT_CLASS) || element.classList.contains(cls.DELETE_CLASS));
            }
            else {
                return !(element.classList.contains(cls.EDIT_EVENT_CLASS) || element.classList.contains(cls.DELETE_EVENT_CLASS));
            }
        });
        var firstEle = focusableElements[0];
        var lastEle = focusableElements[focusableElements.length - 1];
        if (!isNullOrUndefined(lastEle) && document.activeElement === lastEle && !e.shiftKey) {
            e.preventDefault();
            firstEle.focus();
        }
        if (!isNullOrUndefined(firstEle) && document.activeElement === firstEle && e.shiftKey) {
            e.preventDefault();
            lastEle.focus();
        }
    };
    KeyboardInteraction.prototype.processTab = function (e, isReverse) {
        var target = e.target;
        var popupWrapper = closest(target, '.' + cls.POPUP_WRAPPER_CLASS + ',.' + cls.MORE_POPUP_WRAPPER_CLASS);
        if (popupWrapper && popupWrapper.classList.contains(cls.POPUP_OPEN)) {
            if (popupWrapper.classList.contains(cls.MORE_POPUP_WRAPPER_CLASS)) {
                this.parent.eventBase.removeSelectedAppointmentClass();
            }
            this.processTabOnPopup(e, popupWrapper);
            return;
        }
        if (target.classList.contains(cls.ROOT)) {
            this.parent.eventBase.removeSelectedAppointmentClass();
            return;
        }
        if (target.classList.contains(cls.APPOINTMENT_CLASS)) {
            var appointments = [].slice.call(this.parent.element.querySelectorAll('.' + cls.APPOINTMENT_CLASS));
            var selectedAppointments = this.parent.eventBase.getSelectedAppointments();
            if (selectedAppointments.length > 0) {
                target = selectedAppointments[selectedAppointments.length - 1];
            }
            this.parent.eventBase.removeSelectedAppointmentClass();
            if (!isReverse && target.getAttribute('data-guid') === appointments[appointments.length - 1].getAttribute('data-guid') ||
                isReverse && target.getAttribute('data-guid') === appointments[0].getAttribute('data-guid')) {
                return;
            }
            if (this.parent.currentView === 'Agenda' || this.parent.currentView === 'MonthAgenda') {
                this.selectAppointment(isReverse, target);
                e.preventDefault();
            }
            return;
        }
        var selectedCells = this.parent.getSelectedElements();
        if (selectedCells.length > 0 && !target.classList.contains(cls.APPOINTMENT_CLASS)) {
            target = selectedCells[selectedCells.length - 1];
            this.selectAppointmentElementFromWorkCell(isReverse, target);
            e.preventDefault();
            return;
        }
    };
    KeyboardInteraction.prototype.processDelete = function (e) {
        if (document.activeElement && document.activeElement.classList.contains(cls.APPOINTMENT_CLASS)) {
            addClass([document.activeElement], cls.APPOINTMENT_BORDER);
            this.parent.activeEventData = this.parent.eventBase.getSelectedEvents();
            if (this.parent.activeViewOptions.readonly || document.activeElement.classList.contains('e-read-only')) {
                return;
            }
            this.parent.quickPopup.deleteClick();
        }
    };
    KeyboardInteraction.prototype.processEscape = function () {
        this.parent.quickPopup.onClosePopup();
        this.parent.quickPopup.morePopup.hide();
        if (this.parent.headerModule) {
            this.parent.headerModule.hideHeaderPopup();
        }
    };
    KeyboardInteraction.prototype.isPreventAction = function (e) {
        var target = closest(e.target, '.' + cls.RESOURCE_GROUP_CELLS_CLASS);
        if (this.parent.activeView.isTimelineView() && !isNullOrUndefined(target)) {
            return true;
        }
        return false;
    };
    /**
     * Get module name.
     */
    KeyboardInteraction.prototype.getModuleName = function () {
        return 'keyboard';
    };
    /**
     * To destroy the keyboard module.
     * @return {void}
     * @private
     */
    KeyboardInteraction.prototype.destroy = function () {
        this.removeEventListener();
        this.keyboardModule.destroy();
    };
    return KeyboardInteraction;
}());
export { KeyboardInteraction };
