import { closest, EventHandler, isNullOrUndefined, formatUnit, append, isBlazor } from '@syncfusion/ej2-base';
import { addClass, removeClass, createElement, remove, extend, updateBlazorTemplate, resetBlazorTemplate } from '@syncfusion/ej2-base';
import { getElement } from '@syncfusion/ej2-base';
import { Dialog, Popup, isCollide } from '@syncfusion/ej2-popups';
import { Button } from '@syncfusion/ej2-buttons';
import { Input } from '@syncfusion/ej2-inputs';
import { FieldValidator } from './form-validator';
import * as event from '../base/constant';
import * as cls from '../base/css-constant';
import * as util from '../base/util';
var EVENT_FIELD = 'e-field';
/**
 * Quick Popups interactions
 */
var QuickPopups = /** @class */ (function () {
    /**
     * Constructor for QuickPopups
     */
    function QuickPopups(parent) {
        this.isMultipleEventSelect = false;
        this.isCrudAction = false;
        this.parent = parent;
        this.l10n = this.parent.localeObj;
        this.fieldValidator = new FieldValidator();
        this.render();
        this.addEventListener();
    }
    QuickPopups.prototype.render = function () {
        this.renderQuickPopup();
        this.renderMorePopup();
        this.renderQuickDialog();
    };
    QuickPopups.prototype.renderQuickPopup = function () {
        var quickPopupWrapper = createElement('div', { className: cls.POPUP_WRAPPER_CLASS + ' e-popup-close' });
        if (this.parent.isAdaptive) {
            document.body.appendChild(quickPopupWrapper);
            addClass([quickPopupWrapper], cls.DEVICE_CLASS);
        }
        else {
            this.parent.element.appendChild(quickPopupWrapper);
        }
        this.quickPopup = new Popup(quickPopupWrapper, {
            targetType: (this.parent.isAdaptive ? 'container' : 'relative'),
            enableRtl: this.parent.enableRtl,
            open: this.quickPopupOpen.bind(this),
            close: this.quickPopupClose.bind(this),
            hideAnimation: (this.parent.isAdaptive ? { name: 'ZoomOut' } : { name: 'FadeOut', duration: 150 }),
            showAnimation: (this.parent.isAdaptive ? { name: 'ZoomIn' } : { name: 'FadeIn', duration: 150 }),
            collision: (this.parent.isAdaptive ? { X: 'fit', Y: 'fit' } :
                (this.parent.enableRtl ? { X: 'flip', Y: 'fit' } : { X: 'none', Y: 'fit' })),
            position: (this.parent.isAdaptive || this.parent.enableRtl ? { X: 'left', Y: 'top' } : { X: 'right', Y: 'top' }),
            viewPortElement: (this.parent.isAdaptive ? document.body : this.parent.element),
            zIndex: (this.parent.isAdaptive ? 1004 : 3)
        });
        this.quickPopup.isStringTemplate = true;
    };
    QuickPopups.prototype.renderMorePopup = function () {
        var moreEventPopup = "<div class=\"" + cls.MORE_EVENT_POPUP_CLASS + "\"><div class=\"" + cls.MORE_EVENT_HEADER_CLASS + "\">" +
            ("<div class=\"" + cls.MORE_EVENT_CLOSE_CLASS + "\" title=\"" + this.l10n.getConstant('close') + "\" tabindex=\"0\"></div>") +
            ("<div class=\"" + cls.MORE_EVENT_DATE_HEADER_CLASS + "\"><div class=\"" + cls.MORE_EVENT_HEADER_DAY_CLASS + "\"></div>") +
            ("<div class=\"" + cls.MORE_EVENT_HEADER_DATE_CLASS + " " + cls.NAVIGATE_CLASS + "\" tabindex=\"0\"></div></div></div></div>");
        var moreEventWrapper = createElement('div', {
            className: cls.MORE_POPUP_WRAPPER_CLASS + ' e-popup-close',
            innerHTML: moreEventPopup
        });
        if (this.parent.isAdaptive) {
            document.body.appendChild(moreEventWrapper);
            addClass([moreEventWrapper], cls.DEVICE_CLASS);
        }
        else {
            this.parent.element.appendChild(moreEventWrapper);
        }
        this.morePopup = new Popup(moreEventWrapper, {
            targetType: (this.parent.isAdaptive ? 'container' : 'relative'),
            enableRtl: this.parent.enableRtl,
            hideAnimation: { name: 'ZoomOut', duration: 300 },
            showAnimation: { name: 'ZoomIn', duration: 300 },
            open: this.morePopupOpen.bind(this),
            close: this.morePopupClose.bind(this),
            collision: (this.parent.isAdaptive ? { X: 'fit', Y: 'fit' } :
                (this.parent.enableRtl ? { X: 'flip', Y: 'fit' } : { X: 'flip', Y: 'flip' })),
            viewPortElement: (this.parent.isAdaptive ? document.body : this.parent.element),
            zIndex: (this.parent.isAdaptive ? 1002 : 2)
        });
        this.morePopup.isStringTemplate = true;
        var closeButton = this.morePopup.element.querySelector('.' + cls.MORE_EVENT_CLOSE_CLASS);
        this.renderButton('e-round', cls.ICON + ' ' + cls.CLOSE_ICON_CLASS, false, closeButton, this.closeClick);
        EventHandler.add(this.morePopup.element.querySelector('.' + cls.MORE_EVENT_HEADER_DATE_CLASS), 'click', this.navigationClick, this);
    };
    QuickPopups.prototype.renderQuickDialog = function () {
        var buttonModel = [
            { buttonModel: { cssClass: 'e-quick-alertok e-flat', isPrimary: true }, click: this.dialogButtonClick.bind(this) },
            { buttonModel: { cssClass: 'e-quick-alertcancel e-flat', isPrimary: false }, click: this.dialogButtonClick.bind(this) },
            {
                buttonModel: { cssClass: 'e-quick-dialog-cancel e-disable e-flat', isPrimary: false },
                click: this.dialogButtonClick.bind(this)
            }
        ];
        if (this.parent.eventSettings.editFollowingEvents) {
            var followingSeriesButton = {
                buttonModel: { cssClass: 'e-quick-alertfollowing e-flat', isPrimary: false }, click: this.dialogButtonClick.bind(this)
            };
            buttonModel.splice(1, 0, followingSeriesButton);
        }
        this.quickDialog = new Dialog({
            animationSettings: { effect: 'Zoom' },
            buttons: buttonModel,
            cssClass: cls.QUICK_DIALOG_CLASS,
            closeOnEscape: true,
            enableRtl: this.parent.enableRtl,
            beforeClose: this.beforeQuickDialogClose.bind(this),
            isModal: true,
            position: { X: 'center', Y: 'center' },
            showCloseIcon: true,
            target: document.body,
            visible: false,
            width: 'auto'
        });
        var dialogElement = createElement('div', { id: this.parent.element.id + 'QuickDialog' });
        this.parent.element.appendChild(dialogElement);
        this.quickDialog.appendTo(dialogElement);
        this.quickDialog.isStringTemplate = true;
        var okButton = this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_ALERT_OK);
        if (okButton) {
            okButton.setAttribute('aria-label', this.l10n.getConstant('occurrence'));
        }
        var cancelButton = this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_ALERT_CANCEL);
        if (cancelButton) {
            cancelButton.setAttribute('aria-label', this.l10n.getConstant('series'));
        }
    };
    QuickPopups.prototype.renderButton = function (className, iconName, isDisabled, element, clickEvent) {
        var buttonObj = new Button({
            cssClass: className,
            disabled: isDisabled,
            enableRtl: this.parent.enableRtl,
            iconCss: iconName
        });
        buttonObj.appendTo(element);
        buttonObj.isStringTemplate = true;
        EventHandler.add(element, 'click', clickEvent, this);
    };
    QuickPopups.prototype.quickDialogClass = function (action) {
        var classList = [
            cls.QUICK_DIALOG_OCCURRENCE_CLASS, cls.QUICK_DIALOG_SERIES_CLASS, cls.QUICK_DIALOG_DELETE_CLASS,
            cls.QUICK_DIALOG_CANCEL_CLASS, cls.QUICK_DIALOG_ALERT_BTN_CLASS, cls.DISABLE_CLASS
        ];
        var okButton = this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_ALERT_OK);
        var cancelButton = this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_ALERT_CANCEL);
        var followingEventButton = this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_ALERT_FOLLOWING);
        removeClass([okButton, cancelButton], classList);
        addClass([this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_CANCEL_CLASS)], cls.DISABLE_CLASS);
        if (this.parent.eventSettings.editFollowingEvents) {
            addClass([followingEventButton], cls.DISABLE_CLASS);
            removeClass([this.quickDialog.element], cls.FOLLOWING_EVENTS_DIALOG);
        }
        switch (action) {
            case 'Recurrence':
                addClass([okButton], cls.QUICK_DIALOG_OCCURRENCE_CLASS);
                addClass([cancelButton], cls.QUICK_DIALOG_SERIES_CLASS);
                if (this.parent.eventSettings.editFollowingEvents) {
                    removeClass([followingEventButton], cls.DISABLE_CLASS);
                    addClass([this.quickDialog.element], cls.FOLLOWING_EVENTS_DIALOG);
                    addClass([followingEventButton], cls.QUICK_DIALOG_FOLLOWING_EVENTS_CLASS);
                }
                break;
            case 'Delete':
                addClass([okButton], cls.QUICK_DIALOG_DELETE_CLASS);
                addClass([cancelButton], cls.QUICK_DIALOG_CANCEL_CLASS);
                break;
            case 'Alert':
                addClass([okButton], [cls.QUICK_DIALOG_ALERT_OK, cls.QUICK_DIALOG_ALERT_BTN_CLASS]);
                addClass([cancelButton], [cls.QUICK_DIALOG_ALERT_CANCEL, cls.DISABLE_CLASS]);
                break;
        }
    };
    QuickPopups.prototype.applyFormValidation = function () {
        var form = this.quickPopup.element.querySelector('.' + cls.FORM_CLASS);
        var rules = {};
        rules[this.parent.eventSettings.fields.subject.name] = this.parent.eventSettings.fields.subject.validation;
        this.fieldValidator.renderFormValidator(form, rules, this.quickPopup.element);
    };
    QuickPopups.prototype.openRecurrenceAlert = function () {
        var editDeleteOnly = this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_ALERT_OK);
        if (editDeleteOnly) {
            editDeleteOnly.innerHTML = this.l10n.getConstant(this.parent.currentAction === 'Delete' ? 'deleteEvent' : 'editEvent');
        }
        var editFollowingEventsOnly = this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_ALERT_FOLLOWING);
        if (editFollowingEventsOnly) {
            editFollowingEventsOnly.innerHTML = this.l10n.getConstant('editFollowingEvent');
        }
        var editDeleteSeries = this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_ALERT_CANCEL);
        if (editDeleteSeries) {
            editDeleteSeries.innerHTML = this.l10n.getConstant(this.parent.currentAction === 'Delete' ? 'deleteSeries' : 'editSeries');
        }
        this.quickDialog.content = this.l10n.getConstant('editContent');
        this.quickDialog.header = this.l10n.getConstant(this.parent.currentAction === 'Delete' ? 'deleteTitle' : 'editTitle');
        this.quickDialogClass('Recurrence');
        var activeEvent = this.parent.activeEventData.event;
        if (this.parent.eventSettings.editFollowingEvents && this.parent.currentAction === 'EditOccurrence'
            && !isNullOrUndefined(activeEvent[this.parent.eventFields.recurrenceID]) && activeEvent[this.parent.eventFields.recurrenceID]
            !== activeEvent[this.parent.eventFields.id]) {
            var followingEventButton = this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_ALERT_FOLLOWING);
            addClass([followingEventButton], cls.DISABLE_CLASS);
        }
        this.showQuickDialog('RecurrenceAlert');
    };
    QuickPopups.prototype.openRecurrenceValidationAlert = function (type) {
        this.quickDialogClass('Alert');
        var okButton = this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_ALERT_OK);
        okButton.innerHTML = this.l10n.getConstant('ok');
        var cancelButton = this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_ALERT_CANCEL);
        cancelButton.innerHTML = this.l10n.getConstant('cancel');
        this.quickDialog.header = this.l10n.getConstant('alert');
        switch (type) {
            case 'wrongPattern':
                addClass([cancelButton], cls.DISABLE_CLASS);
                this.quickDialog.content = this.l10n.getConstant('wrongPattern');
                break;
            case 'createError':
                addClass([cancelButton], cls.DISABLE_CLASS);
                this.quickDialog.content = this.l10n.getConstant('createError');
                break;
            case 'sameDayAlert':
                addClass([cancelButton], cls.DISABLE_CLASS);
                this.quickDialog.content = this.l10n.getConstant('sameDayAlert');
                break;
            case 'seriesChangeAlert':
                var dialogCancel = this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_CANCEL_CLASS);
                removeClass([cancelButton, dialogCancel], cls.DISABLE_CLASS);
                this.quickDialog.content = this.l10n.getConstant('seriesChangeAlert');
                okButton.innerHTML = this.l10n.getConstant('yes');
                cancelButton.innerHTML = this.l10n.getConstant('no');
                dialogCancel.innerHTML = this.l10n.getConstant('cancel');
                break;
        }
        if ((!this.parent.enableRecurrenceValidation && type === 'wrongPattern') || this.parent.enableRecurrenceValidation) {
            this.showQuickDialog('RecurrenceValidationAlert');
        }
    };
    QuickPopups.prototype.openDeleteAlert = function () {
        if (this.parent.activeViewOptions.readonly) {
            return;
        }
        var okButton = this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_ALERT_OK);
        if (okButton) {
            okButton.innerHTML = this.l10n.getConstant('delete');
        }
        var cancelButton = this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_ALERT_CANCEL);
        if (cancelButton) {
            cancelButton.innerHTML = this.l10n.getConstant('cancel');
        }
        this.quickDialog.content = (this.parent.activeEventData.event.length > 1) ?
            this.l10n.getConstant('deleteMultipleContent') : this.l10n.getConstant('deleteContent');
        this.quickDialog.header = (this.parent.activeEventData.event.length > 1) ?
            this.l10n.getConstant('deleteMultipleEvent') : this.l10n.getConstant('deleteEvent');
        this.quickDialogClass('Delete');
        this.showQuickDialog('DeleteAlert');
    };
    QuickPopups.prototype.openValidationError = function (type, eventData) {
        this.quickDialog.header = this.l10n.getConstant('alert');
        this.quickDialog.content = this.l10n.getConstant(type);
        var okButton = this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_ALERT_OK);
        if (okButton) {
            okButton.innerHTML = this.l10n.getConstant('ok');
        }
        var cancelButton = this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_ALERT_CANCEL);
        if (cancelButton) {
            cancelButton.innerHTML = this.l10n.getConstant('cancel');
        }
        this.quickDialogClass('Alert');
        this.showQuickDialog('ValidationAlert', eventData);
    };
    QuickPopups.prototype.showQuickDialog = function (popupType, eventData) {
        var _this = this;
        this.quickDialog.dataBind();
        var eventProp = {
            type: popupType, cancel: false, data: eventData || this.parent.activeEventData.event, element: this.quickDialog.element
        };
        this.parent.trigger(event.popupOpen, eventProp, function (popupArgs) {
            if (!popupArgs.cancel) {
                _this.quickDialog.show();
            }
        });
    };
    QuickPopups.prototype.createMoreEventList = function (eventCollection, groupOrder, groupIndex) {
        var _this = this;
        var fields = this.parent.eventFields;
        var moreEventContentEle = createElement('div', { className: cls.MORE_EVENT_CONTENT_CLASS });
        var moreEventWrapperEle = createElement('div', { className: cls.MORE_EVENT_WRAPPER_CLASS });
        if (eventCollection.length === 0) {
            moreEventWrapperEle = createElement('div', {
                className: cls.MORE_EVENT_CONTENT_CLASS,
                innerHTML: this.l10n.getConstant('emptyContainer')
            });
        }
        else {
            var _loop_1 = function (eventData) {
                var eventText = (eventData[fields.subject] || this_1.parent.eventSettings.fields.subject.default);
                var appointmentEle = createElement('div', {
                    className: cls.APPOINTMENT_CLASS,
                    attrs: {
                        'data-id': '' + eventData[fields.id],
                        'data-guid': eventData.Guid, 'role': 'button', 'tabindex': '0',
                        'aria-readonly': this_1.parent.eventBase.getReadonlyAttribute(eventData),
                        'aria-selected': 'false', 'aria-grabbed': 'true', 'aria-label': eventText
                    }
                });
                var templateElement = void 0;
                if (!isNullOrUndefined(this_1.parent.activeViewOptions.eventTemplate)) {
                    templateElement = this_1.parent.getAppointmentTemplate()(eventData);
                    append(templateElement, appointmentEle);
                }
                else {
                    appointmentEle.appendChild(createElement('div', { className: cls.SUBJECT_CLASS, innerHTML: eventText }));
                }
                if (this_1.parent.activeViewOptions.group.resources.length > 0) {
                    appointmentEle.setAttribute('data-group-index', groupIndex);
                }
                if (!isNullOrUndefined(eventData[fields.recurrenceRule])) {
                    var iconClass = (eventData[fields.id] === eventData[fields.recurrenceID]) ?
                        cls.EVENT_RECURRENCE_ICON_CLASS : cls.EVENT_RECURRENCE_EDIT_ICON_CLASS;
                    appointmentEle.appendChild(createElement('div', { className: cls.ICON + ' ' + iconClass }));
                }
                var args = { data: eventData, element: appointmentEle, cancel: false };
                this_1.parent.trigger(event.eventRendered, args, function (eventArgs) {
                    if (!eventArgs.cancel) {
                        moreEventWrapperEle.appendChild(appointmentEle);
                        _this.parent.eventBase.wireAppointmentEvents(appointmentEle, eventData, _this.parent.isAdaptive);
                        _this.parent.eventBase.applyResourceColor(appointmentEle, eventData, 'backgroundColor', groupOrder);
                    }
                });
            };
            var this_1 = this;
            for (var _i = 0, eventCollection_1 = eventCollection; _i < eventCollection_1.length; _i++) {
                var eventData = eventCollection_1[_i];
                _loop_1(eventData);
            }
        }
        moreEventContentEle.appendChild(moreEventWrapperEle);
        return moreEventContentEle;
    };
    QuickPopups.prototype.tapHoldEventPopup = function (e) {
        var target = closest(e.target, '.' + cls.APPOINTMENT_CLASS);
        this.isMultipleEventSelect = false;
        this.parent.selectedElements = [];
        this.isMultipleEventSelect = true;
        this.parent.eventBase.getSelectedEventElements(target);
        this.parent.activeEventData = this.parent.eventBase.getSelectedEvents();
        var guid = target.getAttribute('data-guid');
        var eventObj = this.parent.eventBase.getEventByGuid(guid);
        if (isNullOrUndefined(eventObj)) {
            return;
        }
        var eventTitle = (eventObj[this.parent.eventFields.subject] || this.l10n.getConstant('noTitle'));
        var eventTemplate = "<div class=\"" + cls.MULTIPLE_EVENT_POPUP_CLASS + "\"><div class=\"" + cls.POPUP_HEADER_CLASS + "\">" +
            ("<button class=\"" + cls.CLOSE_CLASS + "\" title=\"" + this.l10n.getConstant('close') + "\"></button>") +
            ("<div class=\"" + cls.SUBJECT_CLASS + "\">" + eventTitle + "</div>") +
            ("<button class=\"" + cls.EDIT_CLASS + "\" title=\"" + this.l10n.getConstant('edit') + "\"></button>") +
            ("<button class=\"" + cls.DELETE_CLASS + "\" title=\"" + this.l10n.getConstant('delete') + "\"></button></div></div>");
        this.quickPopup.element.innerHTML = eventTemplate;
        var closeIcon = this.quickPopup.element.querySelector('.' + cls.CLOSE_CLASS);
        this.renderButton('e-flat e-round e-small', cls.ICON + ' ' + cls.CLOSE_ICON_CLASS, false, closeIcon, this.closeClick);
        var readonly = this.parent.activeViewOptions.readonly || eventObj[this.parent.eventFields.isReadonly];
        var editIcon = this.quickPopup.element.querySelector('.' + cls.EDIT_CLASS);
        this.renderButton('e-flat e-round e-small', cls.ICON + ' ' + cls.EDIT_ICON_CLASS, readonly, editIcon, this.editClick);
        var deleteIcon = this.quickPopup.element.querySelector('.' + cls.DELETE_CLASS);
        this.renderButton('e-flat e-round e-small', cls.ICON + ' ' + cls.DELETE_ICON_CLASS, readonly, deleteIcon, this.deleteClick);
        this.beforeQuickPopupOpen(target);
    };
    QuickPopups.prototype.isCellBlocked = function (args) {
        var tempObj = {};
        tempObj[this.parent.eventFields.startTime] = this.parent.activeCellsData.startTime;
        tempObj[this.parent.eventFields.endTime] = this.parent.activeCellsData.endTime;
        tempObj[this.parent.eventFields.isAllDay] = this.parent.activeCellsData.isAllDay;
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            var targetCell = args.element instanceof Array ? args.element[0] : args.element;
            var groupIndex = parseInt(targetCell.getAttribute('data-group-index'), 10);
            this.parent.resourceBase.setResourceValues(tempObj, true, isNaN(groupIndex) ? null : groupIndex);
        }
        return this.parent.eventBase.isBlockRange(tempObj);
    };
    // tslint:disable-next-line:max-func-body-length
    QuickPopups.prototype.cellClick = function (args) {
        this.resetQuickPopupTemplates();
        if (!this.parent.showQuickInfo || !this.parent.eventSettings.allowAdding ||
            this.parent.currentView === 'MonthAgenda' || this.isCellBlocked(args)) {
            this.quickPopupHide();
            return;
        }
        var targetEle = args.event.target;
        if (this.parent.isAdaptive) {
            this.quickPopupHide();
            var newEventClone = this.parent.element.querySelector('.' + cls.NEW_EVENT_CLASS);
            if (isNullOrUndefined(newEventClone)) {
                newEventClone = createElement('div', {
                    className: cls.NEW_EVENT_CLASS,
                    innerHTML: "<div class=\"e-title\">+ " + this.l10n.getConstant('newEvent') + "</div>"
                });
            }
            var targetCell = closest(targetEle, '.' + cls.WORK_CELLS_CLASS + ',.' + cls.ALLDAY_CELLS_CLASS);
            if (targetCell) {
                targetCell.appendChild(newEventClone);
            }
            return;
        }
        var target = closest(targetEle, '.' + cls.WORK_CELLS_CLASS + ',.' + cls.ALLDAY_CELLS_CLASS + ',.' +
            cls.HEADER_CELLS_CLASS);
        if (isNullOrUndefined(target) || targetEle.classList.contains(cls.MORE_INDICATOR_CLASS)) {
            return;
        }
        var isSameTarget = this.quickPopup.relateTo === target;
        if (isSameTarget && this.quickPopup.element.classList.contains(cls.POPUP_OPEN)) {
            var subjectElement_1 = this.quickPopup.element.querySelector('.' + cls.SUBJECT_CLASS);
            if (subjectElement_1) {
                subjectElement_1.focus();
            }
            return;
        }
        var temp = {};
        temp[this.parent.eventFields.startTime] = this.parent.activeCellsData.startTime;
        temp[this.parent.eventFields.endTime] = this.parent.activeCellsData.endTime;
        temp[this.parent.eventFields.isAllDay] = this.parent.activeCellsData.isAllDay;
        var quickCellPopup = createElement('div', { className: cls.CELL_POPUP_CLASS });
        quickCellPopup.appendChild(this.getPopupHeader('Cell', temp));
        quickCellPopup.appendChild(this.getPopupContent('Cell', args, temp));
        quickCellPopup.appendChild(this.getPopupFooter('Cell', temp));
        var subjectElement = quickCellPopup.querySelector('.' + cls.SUBJECT_CLASS);
        if (subjectElement) {
            Input.createInput({ element: subjectElement, properties: { placeholder: this.l10n.getConstant('addTitle') } });
        }
        var closeIcon = quickCellPopup.querySelector('.' + cls.CLOSE_CLASS);
        if (closeIcon) {
            this.renderButton('e-flat e-round e-small', cls.ICON + ' ' + cls.CLOSE_ICON_CLASS, false, closeIcon, this.quickPopupHide);
        }
        var moreButton = quickCellPopup.querySelector('.' + cls.QUICK_POPUP_EVENT_DETAILS_CLASS);
        if (moreButton) {
            this.renderButton('e-flat', '', false, moreButton, this.detailsClick);
        }
        var saveButton = quickCellPopup.querySelector('.' + cls.EVENT_CREATE_CLASS);
        if (saveButton) {
            this.renderButton('e-flat e-primary', '', this.parent.activeViewOptions.readonly, saveButton, this.saveClick);
        }
        this.quickPopup.content = quickCellPopup;
        this.quickPopup.dataBind();
        this.applyFormValidation();
        if (this.morePopup) {
            this.morePopup.hide();
        }
        this.quickPopup.relateTo = target;
        this.beforeQuickPopupOpen(target);
    };
    QuickPopups.prototype.isSameEventClick = function (events) {
        var isSameTarget = this.quickPopup.relateTo === closest(events.element, '.' + cls.APPOINTMENT_CLASS);
        if (isSameTarget && this.quickPopup.element.classList.contains(cls.POPUP_OPEN)) {
            var editIcon = this.quickPopup.element.querySelector('.' + cls.EDIT_CLASS);
            if (editIcon) {
                editIcon.focus();
            }
            if (!this.parent.isAdaptive) {
                var editButton = this.quickPopup.element.querySelector('.' + cls.EDIT_EVENT_CLASS);
                if (editButton) {
                    editButton.focus();
                }
            }
            return true;
        }
        return false;
    };
    QuickPopups.prototype.isQuickTemplate = function (type) {
        return this.parent.quickInfoTemplates.templateType === 'Both' || this.parent.quickInfoTemplates.templateType === type;
    };
    QuickPopups.prototype.eventClick = function (events) {
        this.resetQuickPopupTemplates();
        if (this.parent.eventTooltip) {
            this.parent.eventTooltip.close();
        }
        if (!this.parent.showQuickInfo) {
            return;
        }
        if (this.parent.isAdaptive && this.isMultipleEventSelect) {
            this.updateTapHoldEventPopup(closest(events.element, '.' + cls.APPOINTMENT_CLASS));
        }
        else {
            var isSameTarget = this.isSameEventClick(events);
            if (isSameTarget) {
                return;
            }
            var eventData = events.event;
            var quickEventPopup = createElement('div', { className: cls.EVENT_POPUP_CLASS });
            quickEventPopup.appendChild(this.getPopupHeader('Event', eventData));
            quickEventPopup.appendChild(this.getPopupContent('Event', events, eventData));
            quickEventPopup.appendChild(this.getPopupFooter('Event', eventData));
            var readonly = this.parent.activeViewOptions.readonly || eventData[this.parent.eventFields.isReadonly];
            var editAction = !this.parent.eventSettings.allowEditing || readonly;
            var deleteAction = !this.parent.eventSettings.allowDeleting || readonly;
            var editIcon = quickEventPopup.querySelector('.' + cls.EDIT_CLASS);
            var buttonClass = 'e-flat e-round e-small';
            if (editIcon) {
                this.renderButton(buttonClass, cls.ICON + ' ' + cls.EDIT_ICON_CLASS, editAction, editIcon, this.editClick);
            }
            var deleteIcon = quickEventPopup.querySelector('.' + cls.DELETE_CLASS);
            if (deleteIcon) {
                this.renderButton(buttonClass, cls.ICON + ' ' + cls.DELETE_ICON_CLASS, deleteAction, deleteIcon, this.deleteClick);
            }
            var closeIcon = quickEventPopup.querySelector('.' + cls.CLOSE_CLASS);
            if (closeIcon) {
                this.renderButton(buttonClass, cls.ICON + ' ' + cls.CLOSE_ICON_CLASS, false, closeIcon, this.quickPopupHide);
            }
            var editButton = quickEventPopup.querySelector('.' + cls.EDIT_EVENT_CLASS);
            if (editButton) {
                this.renderButton('e-flat e-primary', '', editAction, editButton, this.editClick);
            }
            var deleteButton = quickEventPopup.querySelector('.' + cls.DELETE_EVENT_CLASS);
            if (deleteButton) {
                this.renderButton('e-flat', '', deleteAction, deleteButton, this.deleteClick);
            }
            this.quickPopup.content = quickEventPopup;
            this.quickPopup.dataBind();
            if (this.morePopup && !closest(events.element, '.' + cls.MORE_EVENT_WRAPPER_CLASS)) {
                this.morePopup.hide();
            }
            this.quickPopup.relateTo = this.parent.isAdaptive ? document.body :
                closest(events.element, '.' + cls.APPOINTMENT_CLASS);
            this.beforeQuickPopupOpen(events.element);
        }
    };
    QuickPopups.prototype.getPopupHeader = function (headerType, headerData) {
        var headerTemplate = createElement('div', { className: cls.POPUP_HEADER_CLASS });
        if (this.isQuickTemplate(headerType) && this.parent.quickInfoTemplates.header) {
            var headerArgs = extend({}, headerData, { elementType: headerType.toLowerCase() }, true);
            var templateId = this.parent.element.id;
            var templateArgs = util.addLocalOffsetToEvent(headerArgs, this.parent.eventFields);
            var headerTemp = this.parent.getQuickInfoTemplatesHeader()(templateArgs, this.parent, 'header', templateId + '_headerTemplate', false);
            append([].slice.call(headerTemp), headerTemplate);
        }
        else {
            var header = void 0;
            switch (headerType) {
                case 'Cell':
                    header = "<div class=\"" + cls.POPUP_HEADER_ICON_WRAPPER + "\"><button class=\"" + cls.CLOSE_CLASS + "\" title=" +
                        ("\"" + this.l10n.getConstant('close') + "\"></button></div>");
                    break;
                case 'Event':
                    var args = this.getFormattedString(headerData);
                    header = "<div class=\"" + cls.POPUP_HEADER_ICON_WRAPPER + "\">" +
                        ("<button class=\"" + (cls.EDIT_CLASS + ' ' + cls.ICON) + "\" title=\"" + this.l10n.getConstant('edit') + "\"></button>") +
                        ("<button class=\"" + (cls.DELETE_CLASS + ' ' + cls.ICON) + "\" title=\"" + this.l10n.getConstant('delete') + "\"></button>") +
                        ("<button class=\"" + cls.CLOSE_CLASS + "\" title=\"" + this.l10n.getConstant('close') + "\"></button></div>") +
                        ("<div class=\"" + cls.SUBJECT_WRAP + "\"><div class=\"" + cls.SUBJECT_CLASS + " " + cls.TEXT_ELLIPSIS + "\" ") +
                        ("title=\"" + args.eventSubject + "\">" + args.eventSubject + "</div></div >");
                    break;
            }
            var templateWrapper = createElement('div', { innerHTML: header });
            append([].slice.call(templateWrapper.childNodes), headerTemplate);
        }
        return headerTemplate;
    };
    QuickPopups.prototype.getPopupContent = function (type, args, data) {
        var contentTemplate = createElement('div', { className: cls.POPUP_CONTENT_CLASS });
        if (this.isQuickTemplate(type) && this.parent.quickInfoTemplates.content) {
            var contentArgs = extend({}, data, { elementType: type.toLowerCase() }, true);
            var templateId = this.parent.element.id;
            var templateArgs = util.addLocalOffsetToEvent(contentArgs, this.parent.eventFields);
            var contentTemp = this.parent.getQuickInfoTemplatesContent()(templateArgs, this.parent, 'content', templateId + '_contentTemplate', false);
            append([].slice.call(contentTemp), contentTemplate);
        }
        else {
            var content = void 0;
            var resourceText = this.getResourceText(args, type.toLowerCase());
            switch (type) {
                case 'Cell':
                    var cellDetails = this.getFormattedString(data);
                    content = "<table class=\"" + cls.POPUP_TABLE_CLASS + "\"><tbody><tr><td><form class=\"" + cls.FORM_CLASS + "\" onsubmit=" +
                        ("\"return false;\"><input class=\"" + cls.SUBJECT_CLASS + " " + EVENT_FIELD + "\" type=\"text\" name=") +
                        ("\"" + this.parent.eventFields.subject + "\" /></form></td></tr><tr><td><div class=\"" + cls.DATE_TIME_CLASS + "\">") +
                        ("<div class=\"" + cls.DATE_TIME_ICON_CLASS + " " + cls.ICON + "\"></div><div class=\"" + cls.DATE_TIME_DETAILS_CLASS + " ") +
                        (cls.TEXT_ELLIPSIS + "\">" + cellDetails.details + "</div></div>") +
                        ((this.parent.activeViewOptions.group.resources.length > 0 ? "<div class=\"" + cls.RESOURCE_CLASS + "\">" +
                            ("<div class=\"" + cls.RESOURCE_ICON_CLASS + " " + cls.ICON + " \"></div><div class=\"" + cls.RESOURCE_DETAILS_CLASS + " ") +
                            (cls.TEXT_ELLIPSIS + "\">" + resourceText + "</div></div>") : '') + "</td></tr></tbody></table>");
                    break;
                case 'Event':
                    var args_1 = this.getFormattedString(data);
                    content = '<div class="' + cls.DATE_TIME_CLASS + '"><div class="' + cls.DATE_TIME_ICON_CLASS + ' ' + cls.ICON +
                        '"></div><div class="' + cls.DATE_TIME_WRAPPER_CLASS + ' ' + cls.TEXT_ELLIPSIS + '"><div class="' +
                        cls.DATE_TIME_DETAILS_CLASS + ' ' + cls.TEXT_ELLIPSIS + '">' + args_1.details + '</div>';
                    if (data[this.parent.eventFields.recurrenceRule]) {
                        content += '<div class="' + cls.RECURRENCE_SUMMARY_CLASS + ' ' + cls.TEXT_ELLIPSIS + '">' +
                            this.getRecurrenceSummary(data) + '</div>';
                    }
                    content += '</div></div>';
                    if (data[this.parent.eventFields.location]) {
                        content += '<div class="' + cls.LOCATION_CLASS + '"><div class="' + cls.LOCATION_ICON_CLASS + ' ' +
                            cls.ICON + '"></div><div class="' + cls.LOCATION_DETAILS_CLASS + ' ' + cls.TEXT_ELLIPSIS + '">' +
                            data[this.parent.eventFields.location] + '</div></div>';
                    }
                    if (data[this.parent.eventFields.startTimezone] || data[this.parent.eventFields.endTimezone]) {
                        content += '<div class="' + cls.TIME_ZONE_CLASS + '"><div class="' + cls.TIME_ZONE_ICON_CLASS + ' ' + cls.ICON +
                            '"></div><div class="' + cls.TIME_ZONE_DETAILS_CLASS + ' ' + cls.TEXT_ELLIPSIS + '">' +
                            this.getTimezone(data) + '</div></div>';
                    }
                    if (data[this.parent.eventFields.description]) {
                        content += '<div class="' + cls.DESCRIPTION_CLASS + '"><div class="' + cls.DESCRIPTION_ICON_CLASS + ' ' + cls.ICON +
                            '"></div><div class="' + cls.DESCRIPTION_DETAILS_CLASS + ' ' + cls.TEXT_ELLIPSIS + '">' +
                            data[this.parent.eventFields.description] + '</div></div>';
                    }
                    if (this.parent.resourceCollection.length > 0) {
                        content += '<div class="' + cls.RESOURCE_CLASS + '"><div class="' + cls.RESOURCE_ICON_CLASS + ' ' + cls.ICON +
                            '"></div><div class="' + cls.RESOURCE_DETAILS_CLASS + ' ' + cls.TEXT_ELLIPSIS + '">' +
                            resourceText + '</div></div>';
                    }
                    break;
            }
            var templateWrapper = createElement('div', { innerHTML: content });
            append([].slice.call(templateWrapper.childNodes), contentTemplate);
        }
        return contentTemplate;
    };
    QuickPopups.prototype.getPopupFooter = function (footerType, footerData) {
        var footerTemplate = createElement('div', { className: cls.POPUP_FOOTER_CLASS });
        if (this.isQuickTemplate(footerType) && this.parent.quickInfoTemplates.footer) {
            var footerArgs = extend({}, footerData, { elementType: footerType.toLowerCase() }, true);
            var templateId = this.parent.element.id;
            var templateArgs = util.addLocalOffsetToEvent(footerArgs, this.parent.eventFields);
            var footerTemp = this.parent.getQuickInfoTemplatesFooter()(templateArgs, this.parent, 'footer', templateId + '_footerTemplate', false);
            append([].slice.call(footerTemp), footerTemplate);
        }
        else {
            var footer = void 0;
            switch (footerType) {
                case 'Cell':
                    footer = "<button class=\"" + (cls.QUICK_POPUP_EVENT_DETAILS_CLASS + ' ' + cls.TEXT_ELLIPSIS) + "\" title=" +
                        ("\"" + this.l10n.getConstant('moreDetails') + "\">" + this.l10n.getConstant('moreDetails') + "</button>") +
                        ("<button class=\"" + cls.EVENT_CREATE_CLASS + " " + cls.TEXT_ELLIPSIS + "\" title=\"" + this.l10n.getConstant('save') + "\">") +
                        (this.l10n.getConstant('save') + "</button>");
                    break;
                case 'Event':
                    footer = "" + (this.parent.isAdaptive ? '' : "<button class=\"" + cls.EDIT_EVENT_CLASS + " " +
                        (cls.TEXT_ELLIPSIS + "\" title=\"" + this.l10n.getConstant('edit') + "\">" + this.l10n.getConstant('edit') + "</button>") +
                        ("<button class=\"" + cls.DELETE_EVENT_CLASS + " " + cls.TEXT_ELLIPSIS + "\" title=\"" + this.l10n.getConstant('delete') + "\">") +
                        (this.l10n.getConstant('delete') + "</button>"));
                    break;
            }
            var templateWrapper = createElement('div', { innerHTML: footer });
            append([].slice.call(templateWrapper.childNodes), footerTemplate);
        }
        return footerTemplate;
    };
    QuickPopups.prototype.getResourceText = function (args, type) {
        if (this.parent.resourceCollection.length === 0) {
            return null;
        }
        var resourceValue = '';
        if (this.parent.activeViewOptions.group.resources.length === 0) {
            var resourceCollection_1 = this.parent.resourceBase.resourceCollection.slice(-1)[0];
            var resourceData = resourceCollection_1.dataSource;
            var resourceIndex_1 = 0;
            var eventData_1 = args.event;
            resourceData.forEach(function (resource, index) {
                if (resource[resourceCollection_1.idField] === eventData_1[resourceCollection_1.field]) {
                    resourceIndex_1 = index;
                }
            });
            resourceValue = resourceData[resourceIndex_1][resourceCollection_1.textField];
        }
        else {
            if (type === 'event') {
                var eventData = args.event;
                var resourceData = void 0;
                var lastResource_1;
                for (var i = this.parent.resourceBase.resourceCollection.length - 1; i >= 0; i--) {
                    resourceData = eventData[this.parent.resourceBase.resourceCollection[i].field];
                    if (!isNullOrUndefined(resourceData)) {
                        lastResource_1 = this.parent.resourceBase.resourceCollection[i];
                        break;
                    }
                }
                if (!Array.isArray(resourceData)) {
                    resourceData = [resourceData];
                }
                var resNames_1 = [];
                var lastResourceData_1 = lastResource_1.dataSource;
                resourceData.map(function (value) {
                    var i = util.findIndexInData(lastResourceData_1, lastResource_1.idField, value);
                    var text = lastResourceData_1[i][lastResource_1.textField];
                    if (text) {
                        resNames_1.push(text);
                    }
                });
                resourceValue = resNames_1.join(', ');
            }
            else {
                var argsData = args;
                var groupIndex = !isNullOrUndefined(argsData.groupIndex) ? argsData.groupIndex : 0;
                var resourceDetails = this.parent.resourceBase.lastResourceLevel[groupIndex];
                resourceValue = resourceDetails.resourceData[resourceDetails.resource.textField];
            }
        }
        return resourceValue;
    };
    QuickPopups.prototype.getFormattedString = function (eventData) {
        var fields = this.parent.eventFields;
        var eventSubject = (eventData[fields.subject] || this.l10n.getConstant('noTitle'));
        var startDate = eventData[fields.startTime];
        var endDate = eventData[fields.endTime];
        var startDateDetails = this.getDateFormat(startDate, 'long');
        var endDateDetails = (eventData[fields.isAllDay] && endDate.getHours() === 0 && endDate.getMinutes() === 0) ?
            this.getDateFormat(util.addDays(new Date(endDate.getTime()), -1), 'long') : this.getDateFormat(endDate, 'long');
        var startTimeDetail = this.parent.getTimeString(startDate);
        var endTimeDetail = this.parent.getTimeString(endDate);
        var details = '';
        var spanLength = endDate.getDate() !== startDate.getDate() &&
            (endDate.getTime() - startDate.getTime()) / (60 * 60 * 1000) < 24 ? 1 : 0;
        if (eventData[fields.isAllDay]) {
            details = startDateDetails + ' (' + this.l10n.getConstant('allDay') + ')';
            if (((endDate.getTime() - startDate.getTime()) / util.MS_PER_DAY) > 1) {
                details += '&nbsp;-&nbsp;' + endDateDetails + ' (' + this.l10n.getConstant('allDay') + ')';
            }
        }
        else if ((((endDate.getTime() - startDate.getTime()) / util.MS_PER_DAY) >= 1) || spanLength > 0) {
            details = startDateDetails + ' (' + startTimeDetail + ')' + '&nbsp;-&nbsp;' + endDateDetails + ' (' + endTimeDetail + ')';
        }
        else {
            details = startDateDetails + ' (' + (startTimeDetail + '&nbsp;-&nbsp;' + endTimeDetail) + ')';
        }
        return { eventSubject: eventSubject, details: details };
    };
    QuickPopups.prototype.moreEventClick = function (data, endDate, groupIndex) {
        var _this = this;
        this.quickPopupHide(true);
        var moreEventContentEle = this.morePopup.element.querySelector('.' + cls.MORE_EVENT_CONTENT_CLASS);
        if (moreEventContentEle) {
            remove(moreEventContentEle);
        }
        var selectedDate = ((data.date).getTime()).toString();
        var target = closest(data.element, '.' + cls.MORE_INDICATOR_CLASS + ',.' + cls.WORK_CELLS_CLASS);
        this.morePopup.element.querySelector('.' + cls.MORE_EVENT_HEADER_DAY_CLASS).innerHTML = this.getDateFormat(data.date, 'E');
        var dateElement = this.morePopup.element.querySelector('.' + cls.MORE_EVENT_HEADER_DATE_CLASS);
        dateElement.innerHTML = this.getDateFormat(data.date, 'd');
        dateElement.setAttribute('data-date', selectedDate);
        dateElement.setAttribute('data-end-date', endDate.getTime().toString());
        var groupOrder;
        if (!isNullOrUndefined(groupIndex)) {
            dateElement.setAttribute('data-group-index', groupIndex);
            groupOrder = this.parent.resourceBase.lastResourceLevel[parseInt(groupIndex, 10)].groupOrder;
        }
        var moreEventElements = this.createMoreEventList(data.event, groupOrder, groupIndex);
        this.morePopup.element.querySelector('.' + cls.MORE_EVENT_POPUP_CLASS).appendChild(moreEventElements);
        removeClass(this.morePopup.element.querySelector('.' + cls.MORE_EVENT_DATE_HEADER_CLASS).childNodes, cls.CURRENTDATE_CLASS);
        if (util.resetTime(data.date).getTime() === util.resetTime(this.parent.getCurrentTime()).getTime()) {
            addClass(this.morePopup.element.querySelector('.' + cls.MORE_EVENT_DATE_HEADER_CLASS).childNodes, cls.CURRENTDATE_CLASS);
        }
        if (!this.parent.isAdaptive) {
            if (this.parent.currentView.indexOf('Timeline') !== -1) {
                var gIndex = target.getAttribute('data-group-index');
                var startDate = new Date(parseInt(target.getAttribute('data-start-date'), 10));
                startDate.setHours(startDate.getHours(), startDate.getMinutes(), 0);
                var tdDate = startDate.getTime().toString();
                if (isNullOrUndefined(gIndex)) {
                    this.morePopup.relateTo = this.parent.element.querySelector('.' + cls.CONTENT_WRAP_CLASS +
                        ' tbody tr td[data-date="' + tdDate + '"]');
                }
                else {
                    this.morePopup.relateTo = this.parent.element.querySelector('.' + cls.CONTENT_WRAP_CLASS +
                        ' tbody tr td[data-group-index="' + gIndex + '"][data-date="' + tdDate + '"]');
                }
            }
            else {
                this.morePopup.relateTo = closest(target, '.' + cls.WORK_CELLS_CLASS);
            }
        }
        if (this.parent.isAdaptive) {
            this.morePopup.element.style.top = '0px';
            this.morePopup.element.style.left = '0px';
            this.morePopup.element.style.height = formatUnit(window.innerHeight);
        }
        var eventProp = { type: 'EventContainer', cancel: false, element: this.morePopup.element };
        if (!isBlazor()) {
            eventProp.data = data;
        }
        this.parent.trigger(event.popupOpen, eventProp, function (popupArgs) {
            if (!popupArgs.cancel) {
                _this.morePopup.show();
            }
        });
    };
    QuickPopups.prototype.saveClick = function () {
        this.isCrudAction = true;
        this.quickPopupHide();
    };
    QuickPopups.prototype.detailsClick = function () {
        var subjectEle = this.quickPopup.element.querySelector('.' + cls.SUBJECT_CLASS);
        if (subjectEle && subjectEle.value !== '') {
            var args = extend(this.parent.activeCellsData, { subject: subjectEle.value });
        }
        this.fieldValidator.destroyToolTip();
        this.quickPopupHide();
        this.parent.eventWindow.openEditor(this.parent.activeCellsData, 'Add');
    };
    QuickPopups.prototype.editClick = function () {
        this.quickPopupHide(true);
        var data = this.parent.activeEventData.event;
        this.parent.currentAction = 'EditSeries';
        if (!isNullOrUndefined(data[this.parent.eventFields.recurrenceRule])) {
            this.parent.currentAction = 'EditOccurrence';
            this.openRecurrenceAlert();
        }
        else {
            this.parent.eventWindow.openEditor(data, this.parent.currentAction);
        }
    };
    QuickPopups.prototype.deleteClick = function () {
        this.quickPopupHide(true);
        this.parent.currentAction = 'Delete';
        if (this.parent.activeEventData.event[this.parent.eventFields.recurrenceRule]) {
            this.openRecurrenceAlert();
        }
        else {
            this.openDeleteAlert();
        }
    };
    QuickPopups.prototype.updateMoreEventContent = function () {
        if (this.morePopup.element.classList.contains('e-popup-close')) {
            return;
        }
        var moreEventContentEle = this.morePopup.element.querySelector('.' + cls.MORE_EVENT_CONTENT_CLASS);
        if (moreEventContentEle) {
            remove(moreEventContentEle);
        }
        var dateElement = this.morePopup.element.querySelector('.' + cls.MORE_EVENT_HEADER_DATE_CLASS);
        var startDate = this.parent.getDateFromElement(dateElement);
        var endDate = new Date(parseInt(dateElement.getAttribute('data-end-date'), 10));
        var groupIndex = dateElement.getAttribute('data-group-index');
        var data;
        var groupOrder;
        if (!isNullOrUndefined(groupIndex)) {
            data = this.parent.resourceBase.lastResourceLevel[parseInt(groupIndex, 10)];
            groupOrder = data.groupOrder;
        }
        var filteredEvents = this.parent.eventBase.filterEvents(startDate, endDate, this.parent.eventsProcessed, data);
        var moreElement = this.createMoreEventList(filteredEvents, groupOrder, groupIndex);
        this.morePopup.element.querySelector('.' + cls.MORE_EVENT_POPUP_CLASS).appendChild(moreElement);
    };
    QuickPopups.prototype.closeClick = function () {
        this.quickPopupHide();
        this.morePopup.hide();
    };
    QuickPopups.prototype.dialogButtonClick = function (event) {
        this.quickDialog.hide();
        var target = event.target;
        var cancelBtn = this.quickDialog.element.querySelector('.' + cls.QUICK_DIALOG_ALERT_CANCEL);
        var eventData = this.parent.activeEventData.event;
        if (target.classList.contains(cls.QUICK_DIALOG_OCCURRENCE_CLASS)) {
            this.parent.currentAction = (this.parent.currentAction === 'Delete') ? 'DeleteOccurrence' : 'EditOccurrence';
            switch (this.parent.currentAction) {
                case 'EditOccurrence':
                    this.parent.eventWindow.openEditor(eventData, this.parent.currentAction);
                    break;
                case 'DeleteOccurrence':
                    this.parent.crudModule.deleteEvent(eventData, this.parent.currentAction);
                    break;
            }
        }
        else if (target.classList.contains(cls.QUICK_DIALOG_FOLLOWING_EVENTS_CLASS)) {
            this.parent.currentAction = (this.parent.currentAction === 'Delete') ? 'DeleteFollowingEvents' : 'EditFollowingEvents';
            switch (this.parent.currentAction) {
                case 'EditFollowingEvents':
                    this.parent.eventWindow.openEditor(eventData, this.parent.currentAction);
                    break;
                case 'DeleteFollowingEvents':
                    this.parent.crudModule.deleteEvent(eventData, this.parent.currentAction);
                    break;
            }
        }
        else if (target.classList.contains(cls.QUICK_DIALOG_SERIES_CLASS)) {
            this.parent.currentAction = (this.parent.currentAction === 'Delete') ? 'DeleteSeries' : 'EditSeries';
            switch (this.parent.currentAction) {
                case 'EditSeries':
                    this.parent.eventWindow.openEditor(this.parent.eventBase.getParentEvent(eventData, true), this.parent.currentAction);
                    break;
                case 'DeleteSeries':
                    this.parent.crudModule.deleteEvent(eventData, this.parent.currentAction);
                    break;
            }
        }
        else if (target.classList.contains(cls.QUICK_DIALOG_DELETE_CLASS)) {
            this.parent.crudModule.deleteEvent(eventData, this.parent.currentAction);
        }
        else if (!cancelBtn.classList.contains(cls.DISABLE_CLASS) && (target.classList.contains(cls.QUICK_DIALOG_ALERT_OK) ||
            (target.classList.contains(cls.QUICK_DIALOG_ALERT_CANCEL) && !cancelBtn.classList.contains(cls.QUICK_DIALOG_CANCEL_CLASS)))) {
            this.parent.uiStateValues.isIgnoreOccurrence = target.classList.contains(cls.QUICK_DIALOG_ALERT_CANCEL);
            this.parent.eventWindow.eventSave(this.l10n.getConstant('ok'));
        }
    };
    QuickPopups.prototype.updateTapHoldEventPopup = function (target) {
        var selectedElements = this.parent.eventBase.getSelectedEventElements(target);
        this.parent.activeEventData = this.parent.eventBase.getSelectedEvents();
        if (selectedElements.length > 0) {
            var eventObj = this.parent.eventBase.getEventByGuid(selectedElements[0].getAttribute('data-guid'));
            var titleContent = (selectedElements.length === 1) ?
                (eventObj[this.parent.eventFields.subject] || this.l10n.getConstant('noTitle')) :
                '(' + selectedElements.length + ')' + '&nbsp;' + this.l10n.getConstant('selectedItems');
            this.quickPopup.element.querySelector('.' + cls.SUBJECT_CLASS).innerHTML = titleContent;
            if (selectedElements.length > 1) {
                addClass([this.quickPopup.element.querySelector('.' + cls.EDIT_ICON_CLASS)], cls.HIDDEN_CLASS);
            }
            else {
                removeClass([this.quickPopup.element.querySelector('.' + cls.EDIT_ICON_CLASS)], cls.HIDDEN_CLASS);
            }
        }
        else {
            this.parent.selectedElements = [];
            this.quickPopupHide();
        }
    };
    QuickPopups.prototype.getTimezone = function (event) {
        var zoneDetails = '';
        zoneDetails += event[this.parent.eventFields.startTimezone] || '';
        zoneDetails += zoneDetails === '' ? '' : ' - ';
        zoneDetails += event[this.parent.eventFields.endTimezone] || '';
        return zoneDetails;
    };
    QuickPopups.prototype.getRecurrenceSummary = function (event) {
        var recurrenceEditor = this.parent.eventWindow.getRecurrenceEditorInstance();
        if (recurrenceEditor) {
            var ruleSummary = recurrenceEditor.getRuleSummary(event[this.parent.eventFields.recurrenceRule]);
            return ruleSummary.charAt(0).toUpperCase() + ruleSummary.slice(1);
        }
        return '';
    };
    QuickPopups.prototype.getDateFormat = function (date, formatString) {
        return this.parent.globalize.formatDate(date, { skeleton: formatString, calendar: this.parent.getCalendarMode() });
    };
    QuickPopups.prototype.getDataFromTarget = function (target) {
        if (target.classList.contains(cls.APPOINTMENT_CLASS)) {
            return this.parent.activeEventData.event;
        }
        // Depricated cells data in quick popups
        var eventObj = {
            startTime: this.parent.activeCellsData.startTime,
            endTime: this.parent.activeCellsData.endTime,
            isAllDay: this.parent.activeCellsData.isAllDay,
            groupIndex: this.parent.activeCellsData.groupIndex
        };
        var cellsData = this.parent.activeCellsData;
        this.parent.eventWindow.convertToEventData(cellsData, eventObj);
        return eventObj;
    };
    QuickPopups.prototype.beforeQuickDialogClose = function () {
        var _this = this;
        var args = {
            type: (isNullOrUndefined(this.parent.activeEventData.event)) ? 'ValidationAlert' :
                !isNullOrUndefined(this.parent.activeEventData.event[this.parent.eventFields.recurrenceRule]) ? 'RecurrenceAlert' : 'DeleteAlert',
            cancel: false, data: this.parent.activeEventData.event, element: this.quickDialog.element
        };
        this.parent.trigger(event.popupClose, args, function (popupCloseArgs) {
            if (!popupCloseArgs.cancel) {
                _this.parent.eventBase.focusElement();
            }
        });
    };
    QuickPopups.prototype.beforeQuickPopupOpen = function (target) {
        var _this = this;
        this.updateQuickPopupTemplates();
        var isEventPopup = this.quickPopup.element.querySelector('.' + cls.EVENT_POPUP_CLASS);
        var popupType = this.parent.isAdaptive ? isEventPopup ? 'ViewEventInfo' : 'EditEventInfo' : 'QuickInfo';
        var eventProp = {
            type: popupType, cancel: false, data: this.getDataFromTarget(target),
            target: target, element: this.quickPopup.element
        };
        this.parent.trigger(event.popupOpen, eventProp, function (popupArgs) {
            if (popupArgs.cancel) {
                _this.destroyButtons();
                if (popupArgs.element.classList.contains(cls.POPUP_OPEN)) {
                    _this.quickPopupClose();
                }
                _this.resetQuickPopupTemplates();
                util.removeChildren(_this.quickPopup.element);
            }
            else {
                var display = _this.quickPopup.element.style.display;
                _this.quickPopup.element.style.display = 'block';
                if (_this.parent.isAdaptive) {
                    _this.quickPopup.element.removeAttribute('style');
                    _this.quickPopup.element.style.display = 'block';
                    _this.quickPopup.element.style.height = formatUnit((popupType === 'EditEventInfo') ? 65 : window.innerHeight);
                }
                else {
                    _this.quickPopup.offsetX = 10;
                    _this.quickPopup.collision = { X: _this.parent.enableRtl ? 'flip' : 'none', Y: 'fit' };
                    _this.quickPopup.position = { X: _this.parent.enableRtl ? 'left' : 'right', Y: 'top' };
                    _this.quickPopup.dataBind();
                    _this.quickPopup.refreshPosition(null, true);
                    var collide = isCollide(_this.quickPopup.element, _this.parent.element);
                    if (collide.indexOf(_this.parent.enableRtl ? 'left' : 'right') > -1) {
                        _this.quickPopup.offsetX = -target.offsetWidth - 10 - _this.quickPopup.element.offsetWidth;
                        _this.quickPopup.dataBind();
                        var leftCollide = isCollide(_this.quickPopup.element, _this.parent.element);
                        if (leftCollide.indexOf('left') > -1) {
                            _this.quickPopup.position = { X: 'center', Y: 'center' };
                            _this.quickPopup.collision = { X: 'fit', Y: 'fit' };
                            _this.quickPopup.offsetX = -(_this.quickPopup.element.offsetWidth / 2);
                            _this.quickPopup.dataBind();
                        }
                    }
                    if (_this.parent.virtualScrollModule && (collide.indexOf('top') > -1 || collide.indexOf('bottom') > -1)) {
                        var element = _this.parent.element.querySelector('.' + cls.CONTENT_WRAP_CLASS + ' table');
                        var translateY = util.getTranslateY(element);
                        _this.quickPopup.offsetY = translateY;
                        _this.quickPopup.dataBind();
                    }
                }
                if (isEventPopup) {
                    _this.applyEventColor();
                }
                _this.quickPopup.element.style.display = display;
                _this.quickPopup.dataBind();
                _this.quickPopup.show();
            }
        });
    };
    QuickPopups.prototype.applyEventColor = function () {
        var colorField = '';
        if (this.parent.currentView === 'Agenda' || this.parent.currentView === 'MonthAgenda') {
            colorField = this.parent.enableRtl ? 'border-right-color' : 'border-left-color';
        }
        else {
            colorField = 'background-color';
        }
        // tslint:disable-next-line:no-any
        var color = this.parent.activeEventData.element.style[colorField];
        if (color === '') {
            return;
        }
        var colorEle = this.quickPopup.element.querySelector('.' + cls.POPUP_HEADER_CLASS);
        var footerEle = this.quickPopup.element.querySelector('.' + cls.POPUP_FOOTER_CLASS);
        if (footerEle && footerEle.offsetParent) {
            colorEle = this.quickPopup.element.querySelector('.' + cls.SUBJECT_CLASS);
            if (colorEle) {
                colorEle.style.borderLeftColor = color;
                color = "rgba(" + color.match(/\d+/g).join() + ",0.3)";
            }
        }
        if (colorEle) {
            colorEle.style.backgroundColor = color;
        }
    };
    QuickPopups.prototype.quickPopupOpen = function () {
        if (this.parent.isAdaptive) {
            return;
        }
        if (this.quickPopup.element.querySelector('.' + cls.CELL_POPUP_CLASS)) {
            var subjectElement = this.quickPopup.element.querySelector('.' + cls.SUBJECT_CLASS);
            if (subjectElement) {
                subjectElement.focus();
            }
        }
        else {
            var editElement = this.quickPopup.element.querySelector('.' + cls.EDIT_EVENT_CLASS);
            if (editElement) {
                editElement.focus();
            }
            var editIcon = this.quickPopup.element.querySelector('.' + cls.EDIT_CLASS);
            if (editIcon) {
                editIcon.focus();
            }
        }
    };
    QuickPopups.prototype.updateQuickPopupTemplates = function () {
        if (this.parent.quickInfoTemplates.header) {
            updateBlazorTemplate(this.parent.element.id + '_headerTemplate', 'HeaderTemplate', this.parent.quickInfoTemplates);
        }
        if (this.parent.quickInfoTemplates.content) {
            updateBlazorTemplate(this.parent.element.id + '_contentTemplate', 'ContentTemplate', this.parent.quickInfoTemplates);
        }
        if (this.parent.quickInfoTemplates.footer) {
            updateBlazorTemplate(this.parent.element.id + '_footerTemplate', 'FooterTemplate', this.parent.quickInfoTemplates);
        }
    };
    QuickPopups.prototype.resetQuickPopupTemplates = function () {
        if (this.parent.quickInfoTemplates.header) {
            resetBlazorTemplate(this.parent.element.id + '_headerTemplate', 'HeaderTemplate');
        }
        if (this.parent.quickInfoTemplates.content) {
            resetBlazorTemplate(this.parent.element.id + '_contentTemplate', 'ContentTemplate');
        }
        if (this.parent.quickInfoTemplates.footer) {
            resetBlazorTemplate(this.parent.element.id + '_footerTemplate', 'FooterTemplate');
        }
    };
    QuickPopups.prototype.quickPopupClose = function () {
        this.resetQuickPopupTemplates();
        this.parent.eventBase.focusElement();
        this.quickPopup.relateTo = cls.WORK_CELLS_CLASS;
        this.fieldValidator.destroyToolTip();
        if (this.quickPopup.element.querySelectorAll('.e-formvalidator').length) {
            this.fieldValidator.destroy();
        }
        this.destroyButtons();
        util.removeChildren(this.quickPopup.element);
    };
    QuickPopups.prototype.morePopupOpen = function () {
        if (this.parent.isAdaptive) {
            return;
        }
        this.morePopup.element.querySelector('.' + cls.MORE_EVENT_HEADER_DATE_CLASS).focus();
        this.morePopup.refreshPosition();
    };
    QuickPopups.prototype.morePopupClose = function () {
        var moreWrapper = this.parent.element.querySelector('.' + cls.MORE_EVENT_WRAPPER_CLASS);
        if (moreWrapper) {
            remove(moreWrapper);
        }
    };
    QuickPopups.prototype.quickPopupHide = function (hideAnimation) {
        var _this = this;
        if (!this.quickPopup.element.classList.contains(cls.POPUP_OPEN)) {
            return;
        }
        var isCellPopup = this.quickPopup.element.querySelector('.' + cls.CELL_POPUP_CLASS);
        var popupData;
        if (isCellPopup) {
            var formvalidator = this.quickPopup.element.querySelector('.e-formvalidator');
            if (formvalidator && !formvalidator.ej2_instances[0].validate()) {
                return;
            }
            var fields = this.parent.eventFields;
            var saveObj = this.parent.eventWindow.getObjectFromFormData(cls.POPUP_WRAPPER_CLASS);
            this.parent.eventWindow.setDefaultValueToObject(saveObj);
            saveObj[fields.id] = this.parent.eventBase.getEventMaxID();
            saveObj[fields.startTime] = this.parent.activeCellsData.startTime;
            saveObj[fields.endTime] = this.parent.activeCellsData.endTime;
            saveObj[fields.isAllDay] = this.parent.activeCellsData.isAllDay;
            if (this.parent.resourceBase) {
                this.parent.resourceBase.setResourceValues(saveObj, true);
            }
            popupData = saveObj;
        }
        else {
            popupData = this.parent.activeEventData.event;
        }
        var isEventPopup = this.quickPopup.element.querySelector('.' + cls.EVENT_POPUP_CLASS);
        var args = {
            type: this.parent.isAdaptive ? isEventPopup ? 'ViewEventInfo' : 'EditEventInfo' : 'QuickInfo',
            cancel: false, data: popupData, element: this.quickPopup.element,
            target: (isCellPopup ? this.parent.activeCellsData.element : this.parent.activeEventData.element)
        };
        this.parent.trigger(event.popupClose, args, function (popupCloseArgs) {
            if (isBlazor()) {
                var eventFields = _this.parent.eventFields;
                if (popupCloseArgs.data) {
                    var eventObj = popupCloseArgs.data;
                    eventObj[eventFields.startTime] = _this.parent.getDateTime(eventObj[eventFields.startTime]);
                    eventObj[eventFields.endTime] = _this.parent.getDateTime(eventObj[eventFields.endTime]);
                }
                if (popupCloseArgs.element) {
                    popupCloseArgs.element = getElement(popupCloseArgs.element);
                }
                if (popupCloseArgs.target) {
                    popupCloseArgs.target = getElement(popupCloseArgs.target);
                }
            }
            if (!popupCloseArgs.cancel) {
                if (_this.quickPopup.element.classList.contains('e-popup-open')) {
                    if (isCellPopup && _this.isCrudAction) {
                        _this.parent.currentAction = 'Add';
                        _this.parent.crudModule.addEvent(popupCloseArgs.data);
                    }
                    if (hideAnimation) {
                        var animation = _this.quickPopup.hideAnimation;
                        _this.quickPopup.hideAnimation = null;
                        _this.quickPopup.hide();
                        _this.quickPopup.hideAnimation = animation;
                    }
                    else {
                        _this.quickPopup.hide();
                    }
                    _this.isMultipleEventSelect = false;
                    _this.isCrudAction = false;
                }
            }
        });
    };
    QuickPopups.prototype.navigationClick = function (e) {
        var navigateEle = closest(e.target, '.' + cls.NAVIGATE_CLASS);
        if (!isNullOrUndefined(navigateEle)) {
            var date = this.parent.getDateFromElement(e.currentTarget);
            if (!isNullOrUndefined(date)) {
                this.closeClick();
                this.parent.setProperties({ selectedDate: date }, true);
                this.parent.changeView(this.parent.getNavigateView(), e);
            }
        }
    };
    QuickPopups.prototype.documentClick = function (e) {
        var target = e.event.target;
        var classNames = '.' + cls.POPUP_WRAPPER_CLASS + ',.' + cls.HEADER_CELLS_CLASS + ',.' + cls.ALLDAY_CELLS_CLASS +
            ',.' + cls.WORK_CELLS_CLASS + ',.' + cls.APPOINTMENT_CLASS + ',.e-popup';
        if (closest(target, '.' + cls.APPOINTMENT_CLASS + ',.' + cls.HEADER_CELLS_CLASS)) {
            this.parent.removeNewEventElement();
        }
        if (!closest(target, classNames)) {
            this.quickPopupHide();
            this.parent.removeNewEventElement();
        }
        if (!closest(target, '.' + cls.MORE_POPUP_WRAPPER_CLASS) && !target.classList.contains(cls.MORE_INDICATOR_CLASS)
            && (!closest(target, '.' + cls.POPUP_OPEN)) && !closest(target, '.' + cls.WORK_CELLS_CLASS)) {
            this.morePopup.hide();
        }
    };
    QuickPopups.prototype.onClosePopup = function () {
        this.quickPopupHide();
        this.parent.eventBase.focusElement();
    };
    QuickPopups.prototype.addEventListener = function () {
        this.parent.on(event.cellClick, this.cellClick, this);
        this.parent.on(event.eventClick, this.eventClick, this);
        this.parent.on(event.documentClick, this.documentClick, this);
        this.parent.on(event.dataReady, this.updateMoreEventContent, this);
    };
    QuickPopups.prototype.removeEventListner = function () {
        this.parent.off(event.cellClick, this.cellClick);
        this.parent.off(event.eventClick, this.eventClick);
        this.parent.off(event.documentClick, this.documentClick);
        this.parent.off(event.dataReady, this.updateMoreEventContent);
    };
    QuickPopups.prototype.destroyButtons = function () {
        var buttonCollections = [].slice.call(this.quickPopup.element.querySelectorAll('.e-control.e-btn'));
        buttonCollections.forEach(function (button) {
            var instance = button.ej2_instances[0];
            if (instance) {
                instance.destroy();
            }
        });
    };
    QuickPopups.prototype.destroy = function () {
        if (this.quickPopup.element.querySelectorAll('.e-formvalidator').length) {
            this.fieldValidator.destroy();
        }
        this.removeEventListner();
        this.destroyButtons();
        this.quickPopup.destroy();
        remove(this.quickPopup.element);
        this.morePopup.destroy();
        remove(this.morePopup.element);
        if (this.quickDialog.element) {
            this.quickDialog.destroy();
            remove(this.quickDialog.element);
            this.quickDialog.element = null;
        }
    };
    return QuickPopups;
}());
export { QuickPopups };
