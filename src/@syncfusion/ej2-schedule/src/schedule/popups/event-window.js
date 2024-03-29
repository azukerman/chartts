import { createElement, isNullOrUndefined, addClass, remove, EventHandler, extend, append } from '@syncfusion/ej2-base';
import { cldrData, removeClass, getValue, getDefaultDateObject, closest, getElement } from '@syncfusion/ej2-base';
import { updateBlazorTemplate, resetBlazorTemplate, isBlazor } from '@syncfusion/ej2-base';
import { DataManager, Query, Deferred } from '@syncfusion/ej2-data';
import { CheckBox, Button } from '@syncfusion/ej2-buttons';
import { Dialog } from '@syncfusion/ej2-popups';
import { DropDownList, MultiSelect } from '@syncfusion/ej2-dropdowns';
import { Input } from '@syncfusion/ej2-inputs';
import { DateTimePicker } from '@syncfusion/ej2-calendars';
import { timezoneData } from '../timezone/timezone';
import { FieldValidator } from './form-validator';
import { RecurrenceEditor } from '../../recurrence-editor/recurrence-editor';
import * as cls from '../base/css-constant';
import * as event from '../base/constant';
import * as util from '../base/util';
var EVENT_FIELD = 'e-field';
var REPEAT_CONTAINER_CLASS = 'e-recurrence-container';
var REPEAT_BUTTON_ICON_CLASS = 'e-recurrence-edit';
var REPEAT_BUTTON_CLASS = 'e-recurrence-edit-button';
var REPEAT_DIALOG_CLASS = 'e-recurrence-dialog';
var HIDE_STYLE_CLASS = 'e-hide';
/**
 * Event editor window
 */
var EventWindow = /** @class */ (function () {
    /**
     * Constructor for event window
     */
    function EventWindow(parent) {
        this.parent = parent;
        this.l10n = this.parent.localeObj;
        this.fields = this.parent.eventFields;
        this.eventWindowTime = { startTime: new Date(), endTime: new Date() };
        this.fieldValidator = new FieldValidator();
        this.renderEventWindow();
    }
    EventWindow.prototype.renderEventWindow = function () {
        this.element = createElement('div', { id: this.parent.element.id + '_dialog_wrapper' });
        this.parent.element.appendChild(this.element);
        var dialogModel = {
            animationSettings: { effect: 'Zoom' },
            content: this.getEventWindowContent(),
            cssClass: cls.EVENT_WINDOW_DIALOG_CLASS,
            enableRtl: this.parent.enableRtl,
            height: this.parent.isAdaptive ? '100%' : 'auto',
            isModal: true,
            showCloseIcon: this.parent.isAdaptive ? false : true,
            target: document.body,
            visible: false,
            width: '500px',
            beforeOpen: this.onBeforeOpen.bind(this),
            beforeClose: this.onBeforeClose.bind(this)
        };
        if (this.parent.isAdaptive) {
            dialogModel.cssClass = cls.EVENT_WINDOW_DIALOG_CLASS + ' ' + cls.DEVICE_CLASS;
            dialogModel.header = '<div class="e-title-header"><div class="e-back-icon e-icons"></div><div class="e-title-text">' +
                this.l10n.getConstant('newEvent') + '</div><div class="e-save-icon e-icons"></div></div>';
        }
        else {
            dialogModel.buttons = [{
                    buttonModel: {
                        content: this.l10n.getConstant('deleteButton'), cssClass: cls.DELETE_EVENT_CLASS,
                        disabled: !this.parent.eventSettings.allowDeleting || this.parent.readonly
                    },
                    click: this.eventDelete.bind(this)
                }, {
                    buttonModel: {
                        content: this.l10n.getConstant('saveButton'), cssClass: 'e-primary ' + cls.EVENT_WINDOW_SAVE_BUTTON_CLASS,
                        isPrimary: true, disabled: !this.parent.eventSettings.allowAdding || this.parent.readonly
                    },
                    click: this.eventSave.bind(this)
                }, {
                    buttonModel: { cssClass: cls.EVENT_WINDOW_CANCEL_BUTTON_CLASS, content: this.l10n.getConstant('cancelButton') },
                    click: this.dialogClose.bind(this)
                }];
            dialogModel.header = '<div class="e-title-text">' + this.l10n.getConstant('newEvent') + '</div>';
        }
        this.dialogObject = new Dialog(dialogModel, this.element);
        this.dialogObject.isStringTemplate = true;
        this.updateEditorTemplate();
        addClass([this.element.parentElement], cls.EVENT_WINDOW_DIALOG_CLASS + '-container');
        if (this.parent.isAdaptive) {
            EventHandler.add(this.element.querySelector('.' + cls.EVENT_WINDOW_BACK_ICON_CLASS), 'click', this.dialogClose, this);
            EventHandler.add(this.element.querySelector('.' + cls.EVENT_WINDOW_SAVE_ICON_CLASS), 'click', this.eventSave, this);
        }
        this.applyFormValidation();
    };
    EventWindow.prototype.updateEditorTemplate = function () {
        if (this.parent.editorTemplate) {
            updateBlazorTemplate(this.parent.element.id + '_editorTemplate', 'EditorTemplate', this.parent);
        }
    };
    EventWindow.prototype.resetEditorTemplate = function () {
        if (this.parent.editorTemplate) {
            resetBlazorTemplate(this.parent.element.id + '_editorTemplate', 'EditorTemplate');
        }
    };
    EventWindow.prototype.refresh = function () {
        this.destroy();
        this.renderEventWindow();
    };
    EventWindow.prototype.refreshRecurrenceEditor = function () {
        if (this.recurrenceEditor) {
            var recurrenceEditor = this.recurrenceEditor.element;
            this.recurrenceEditor.destroy();
            this.createRecurrenceEditor(recurrenceEditor);
        }
    };
    EventWindow.prototype.setRecurrenceEditor = function (recurrenceEditor) {
        if (this.parent.editorTemplate) {
            this.recurrenceEditor = recurrenceEditor;
        }
    };
    EventWindow.prototype.openEditor = function (data, type, isEventData, repeatType) {
        this.parent.currentAction = type;
        this.parent.removeNewEventElement();
        this.parent.quickPopup.quickPopupHide(true);
        if (type === 'Add') {
            var eventObj = {};
            this.cellClickAction = !isEventData;
            this.parent.activeCellsData = data;
            var event_1 = data;
            if (this.cellClickAction) {
                this.convertToEventData(event_1, eventObj);
            }
            else {
                this.parent.activeCellsData = {
                    startTime: (event_1.startTime || event_1[this.fields.startTime]),
                    endTime: (event_1.endTime || event_1[this.fields.endTime]),
                    isAllDay: (event_1.isAllDay || event_1[this.fields.isAllDay]),
                    element: event_1.element,
                    groupIndex: event_1.groupIndex
                };
                eventObj = event_1;
            }
            data = eventObj;
        }
        if (!isNullOrUndefined(this.parent.editorTemplate)) {
            this.renderFormElements(this.element.querySelector('.e-schedule-form'), data);
            this.updateEditorTemplate();
        }
        if (!this.parent.isAdaptive && isNullOrUndefined(this.parent.editorTemplate)) {
            removeClass([this.dialogObject.element.querySelector('.e-recurrenceeditor')], cls.DISABLE_CLASS);
        }
        if (this.recurrenceEditor) {
            this.recurrenceEditor.firstDayOfWeek = this.parent.activeViewOptions.firstDayOfWeek;
        }
        switch (type) {
            case 'Add':
                this.onCellDetailsUpdate(data, repeatType);
                break;
            case 'Save':
            case 'EditOccurrence':
            case 'EditSeries':
            case 'EditFollowingEvents':
                if (type === 'EditOccurrence' && !this.parent.isAdaptive && isNullOrUndefined(this.parent.editorTemplate)) {
                    addClass([this.dialogObject.element.querySelector('.e-recurrenceeditor')], cls.DISABLE_CLASS);
                }
                this.cellClickAction = false;
                this.onEventDetailsUpdate(data);
                break;
        }
    };
    EventWindow.prototype.setDialogContent = function () {
        this.resetEditorTemplate();
        this.dialogObject.content = this.getEventWindowContent();
        this.dialogObject.dataBind();
        this.updateEditorTemplate();
    };
    EventWindow.prototype.onBeforeOpen = function (args) {
        var _this = this;
        var eventProp = {
            type: 'Editor',
            data: this.eventData,
            cancel: false,
            element: this.element,
            target: (this.cellClickAction ? this.parent.activeCellsData.element : this.parent.activeEventData.element)
        };
        if (this.cellClickAction) {
            eventProp.duration = this.getSlotDuration();
        }
        var saveObj = this.getInstance(cls.EVENT_WINDOW_SAVE_BUTTON_CLASS);
        if (saveObj) {
            saveObj.disabled = !(this.cellClickAction ? this.parent.eventSettings.allowAdding : this.parent.eventSettings.allowEditing);
            saveObj.dataBind();
        }
        var deleteObj = this.getInstance(cls.DELETE_EVENT_CLASS);
        if (deleteObj) {
            deleteObj.disabled = !this.parent.eventSettings.allowDeleting;
            deleteObj.dataBind();
        }
        var callBackPromise = new Deferred();
        this.parent.trigger(event.popupOpen, eventProp, function (popupArgs) {
            args.cancel = popupArgs.cancel;
            _this.duration = _this.cellClickAction ? popupArgs.duration : null;
            _this.refreshDateTimePicker(_this.duration);
            if (_this.cellClickAction && popupArgs.duration !== _this.getSlotDuration() && isNullOrUndefined(_this.parent.editorTemplate)) {
                var startObj = _this.getInstance(cls.EVENT_WINDOW_START_CLASS);
                var endObj = _this.getInstance(cls.EVENT_WINDOW_END_CLASS);
                endObj.value = new Date(startObj.value.getTime() + (util.MS_PER_MINUTE * popupArgs.duration));
                endObj.dataBind();
            }
            if (_this.parent.editorTemplate && _this.element.querySelector('.e-recurrenceeditor') && !_this.recurrenceEditor) {
                _this.recurrenceEditor = _this.getInstance('e-recurrenceeditor');
            }
            callBackPromise.resolve(args);
        });
        return callBackPromise;
    };
    EventWindow.prototype.onBeforeClose = function (args) {
        var _this = this;
        if (args.isInteracted) {
            this.isCrudAction = false;
        }
        var eventProp = {
            type: 'Editor',
            data: this.eventCrudData,
            cancel: false,
            element: this.element,
            target: (this.cellClickAction ? this.parent.activeCellsData.element : this.parent.activeEventData.element)
        };
        var callBackPromise = new Deferred();
        this.parent.trigger(event.popupClose, eventProp, function (popupArgs) {
            if (isBlazor()) {
                var eventFields = _this.parent.eventFields;
                if (popupArgs.data) {
                    var eventObj = popupArgs.data;
                    eventObj[eventFields.startTime] = _this.parent.getDateTime(eventObj[eventFields.startTime]);
                    eventObj[eventFields.endTime] = _this.parent.getDateTime(eventObj[eventFields.endTime]);
                }
                if (popupArgs.element) {
                    popupArgs.element = getElement(popupArgs.element);
                }
                if (popupArgs.target) {
                    popupArgs.target = getElement(popupArgs.target);
                }
            }
            args.cancel = popupArgs.cancel;
            if (!popupArgs.cancel) {
                if (_this.isCrudAction) {
                    args.cancel = _this.processCrudActions(popupArgs.data);
                    _this.isCrudAction = args.cancel;
                }
                if (!_this.isCrudAction) {
                    _this.resetForm();
                    _this.parent.eventBase.focusElement();
                    _this.eventCrudData = null;
                }
            }
            callBackPromise.resolve(args);
        });
        return callBackPromise;
    };
    EventWindow.prototype.getEventWindowContent = function () {
        var container = createElement('div', { className: cls.FORM_CONTAINER_CLASS });
        var form = createElement('form', {
            id: this.parent.element.id + 'EditForm',
            className: cls.FORM_CLASS,
            attrs: { onsubmit: 'return false;' }
        });
        this.renderFormElements(form);
        container.appendChild(form);
        return container;
    };
    EventWindow.prototype.renderFormElements = function (form, args) {
        if (!isNullOrUndefined(this.parent.editorTemplate)) {
            if (args) {
                this.resetEditorTemplate();
                if (this.recurrenceEditor) {
                    this.recurrenceEditor.destroy();
                    this.recurrenceEditor = null;
                }
                this.destroyComponents();
                [].slice.call(form.childNodes).forEach(function (node) { return remove(node); });
            }
            var templateId = this.parent.element.id + '_editorTemplate';
            var editorTemplate = this.parent.getEditorTemplate()(args || {}, this.parent, 'editorTemplate', templateId, false);
            append(editorTemplate, form);
        }
        else {
            form.appendChild(this.getDefaultEventWindowContent());
        }
    };
    EventWindow.prototype.getDefaultEventWindowContent = function () {
        var parentDiv = this.createDivElement(cls.EVENT_WINDOW_DIALOG_PARENT_CLASS);
        var titleLocationDiv = this.createDivElement(cls.EVENT_WINDOW_TITLE_LOCATION_DIV_CLASS);
        parentDiv.appendChild(titleLocationDiv);
        titleLocationDiv.appendChild(this.renderTextBox(cls.SUBJECT_CLASS));
        titleLocationDiv.appendChild(this.renderTextBox(cls.LOCATION_CLASS));
        var startEndDateTimeDiv = this.createDivElement(cls.EVENT_WINDOW_START_END_DIV_CLASS);
        parentDiv.appendChild(startEndDateTimeDiv);
        startEndDateTimeDiv.appendChild(this.renderDateTimePicker(cls.EVENT_WINDOW_START_CLASS, this.onTimeChange.bind(this)));
        startEndDateTimeDiv.appendChild(this.renderDateTimePicker(cls.EVENT_WINDOW_END_CLASS));
        var allDayTimezoneDiv = this.createDivElement(cls.EVENT_WINDOW_ALLDAY_TZ_DIV_CLASS);
        parentDiv.appendChild(allDayTimezoneDiv);
        allDayTimezoneDiv.appendChild(this.renderCheckBox(cls.EVENT_WINDOW_ALL_DAY_CLASS));
        allDayTimezoneDiv.appendChild(this.renderCheckBox(cls.TIME_ZONE_CLASS));
        var timezoneParentDiv = this.createDivElement(cls.EVENT_WINDOW_TIME_ZONE_DIV_CLASS);
        parentDiv.appendChild(timezoneParentDiv);
        timezoneParentDiv.appendChild(this.renderDropDown(cls.EVENT_WINDOW_START_TZ_CLASS));
        timezoneParentDiv.appendChild(this.renderDropDown(cls.EVENT_WINDOW_END_TZ_CLASS));
        var repeatParentDiv = this.createDivElement(cls.EVENT_WINDOW_REPEAT_DIV_CLASS);
        parentDiv.appendChild(repeatParentDiv);
        var repeatDiv = this.renderCheckBox(cls.EVENT_WINDOW_REPEAT_CLASS);
        var repeatEditConainer = createElement('span', { className: REPEAT_CONTAINER_CLASS });
        var button = createElement('button', {
            className: REPEAT_BUTTON_CLASS,
            attrs: { type: 'button', 'title': this.l10n.getConstant('editRecurrence') }
        });
        this.buttonObj = new Button({ iconCss: REPEAT_BUTTON_ICON_CLASS + ' e-icons', cssClass: 'e-medium ' + this.parent.cssClass });
        repeatEditConainer.appendChild(button);
        this.buttonObj.appendTo(button);
        this.buttonObj.isStringTemplate = true;
        repeatDiv.appendChild(repeatEditConainer);
        repeatParentDiv.appendChild(repeatDiv);
        if (this.parent.isAdaptive) {
            EventHandler.add(button, 'click', this.loadRecurrenceEditor, this);
        }
        else {
            this.createRecurrenceEditor(parentDiv);
        }
        if (this.parent.resourceCollection.length > 0) {
            var resourceParentDiv = this.createDivElement(cls.EVENT_WINDOW_RESOURCES_DIV_CLASS);
            for (var _i = 0, _a = this.parent.resourceBase.resourceCollection; _i < _a.length; _i++) {
                var resource = _a[_i];
                resourceParentDiv.appendChild(this.renderResourceDetails(resource));
            }
            parentDiv.appendChild(resourceParentDiv);
        }
        var description = this.createDivElement(cls.DESCRIPTION_CLASS + '-row');
        description.appendChild(this.renderTextBox(cls.DESCRIPTION_CLASS));
        parentDiv.appendChild(description);
        var submit = createElement('button', { attrs: { type: 'hidden', title: 'submit', style: 'display:none' } });
        parentDiv.appendChild(submit);
        return parentDiv;
    };
    EventWindow.prototype.createRecurrenceEditor = function (parentDiv) {
        var recurrenceEditor = this.createDivElement();
        parentDiv.appendChild(recurrenceEditor);
        this.recurrenceEditor = this.renderRecurrenceEditor();
        this.recurrenceEditor.appendTo(recurrenceEditor);
    };
    EventWindow.prototype.createDivElement = function (className) {
        return createElement('div', { className: className });
    };
    EventWindow.prototype.createInputElement = function (className, fieldName, type) {
        return createElement(type || 'input', {
            className: className, attrs: {
                type: 'text', name: fieldName, value: '',
                title: ((this.l10n.getConstant(fieldName.charAt(0).toLowerCase() + fieldName.slice(1))) === '') ?
                    fieldName : this.l10n.getConstant(fieldName.charAt(0).toLowerCase() + fieldName.slice(1))
            }
        });
    };
    EventWindow.prototype.getSlotDuration = function () {
        return this.parent.activeViewOptions.timeScale.interval / this.parent.activeViewOptions.timeScale.slotCount;
    };
    EventWindow.prototype.renderDateTimePicker = function (value, changeEvent) {
        var dateTimeDiv = this.createDivElement(value + '-container');
        var fieldName = this.getFieldName(value);
        var dateTimeInput = this.createInputElement(value + ' ' + EVENT_FIELD, fieldName);
        dateTimeDiv.appendChild(dateTimeInput);
        var dateTimePicker = new DateTimePicker({
            change: changeEvent,
            firstDayOfWeek: this.parent.activeViewOptions.firstDayOfWeek,
            calendarMode: this.parent.calendarMode,
            cssClass: this.parent.cssClass,
            enableRtl: this.parent.enableRtl,
            locale: this.parent.locale,
            floatLabelType: 'Always',
            format: (isNullOrUndefined(this.parent.dateFormat) ?
                this.getFormat('dateFormats') : this.parent.dateFormat) + ' ' + this.getFormat('timeFormats'),
            placeholder: this.getFieldLabel(value),
            step: this.getSlotDuration(),
            value: this.parent.getCurrentTime(), width: '100%'
        });
        dateTimePicker.isStringTemplate = true;
        dateTimePicker.appendTo(dateTimeInput);
        return dateTimeDiv;
    };
    EventWindow.prototype.refreshDateTimePicker = function (duration) {
        var _this = this;
        var startEndElement = [].slice.call(this.element.querySelectorAll('.' + cls.EVENT_WINDOW_START_CLASS + ',.' +
            cls.EVENT_WINDOW_END_CLASS));
        startEndElement.forEach(function (element) {
            var instance = element.ej2_instances[0];
            instance.firstDayOfWeek = _this.parent.activeViewOptions.firstDayOfWeek;
            instance.step = duration || _this.getSlotDuration();
            instance.dataBind();
        });
    };
    EventWindow.prototype.onTimeChange = function () {
        var startObj = this.getInstance(cls.EVENT_WINDOW_START_CLASS);
        if (startObj.element.parentElement.classList.contains('e-input-focus')) {
            var endObj = this.getInstance(cls.EVENT_WINDOW_END_CLASS);
            var duration = 0;
            if (this.cellClickAction) {
                duration = util.MS_PER_MINUTE * this.duration;
                this.eventWindowTime.startTime = startObj.value;
            }
            else {
                duration = this.eventData[this.fields.endTime].getTime() - this.eventData[this.fields.startTime].getTime();
            }
            var endDate = new Date(startObj.value.getTime() + duration);
            if (this.cellClickAction) {
                this.eventWindowTime.endTime = endDate;
            }
            endObj.value = endDate;
            endObj.dataBind();
        }
    };
    EventWindow.prototype.renderResourceDetails = function (resourceData) {
        var fieldName = resourceData.field;
        var value = 'e-' + fieldName;
        var labelValue = resourceData.title;
        var resourceDiv = this.createDivElement(value + '-container' + ' ' + 'e-resources');
        var resourceInput = this.createInputElement(value + ' ' + EVENT_FIELD, fieldName);
        resourceDiv.appendChild(resourceInput);
        var resourceTemplate = '<div class="e-resource-template"><div class="e-resource-color" style="background-color:${' +
            resourceData.colorField + '}"></div><div class="e-resource-text">${' + resourceData.textField + '}</div></div>';
        if (resourceData.allowMultiple) {
            var listObj = new MultiSelect({
                cssClass: this.parent.cssClass || '',
                dataSource: resourceData.dataSource,
                change: this.onMultiselectResourceChange.bind(this),
                itemTemplate: resourceTemplate,
                fields: {
                    text: resourceData.textField,
                    value: resourceData.idField
                },
                htmlAttributes: { 'title': labelValue, 'name': fieldName },
                floatLabelType: 'Always',
                placeholder: labelValue,
                popupHeight: '230px',
                popupWidth: '447px',
                mode: 'Box'
            });
            listObj.appendTo(resourceInput);
            listObj.isStringTemplate = true;
        }
        else {
            var drowDownList = new DropDownList({
                cssClass: this.parent.cssClass || '',
                change: this.onDropdownResourceChange.bind(this),
                dataSource: resourceData.dataSource,
                enableRtl: this.parent.enableRtl,
                fields: {
                    text: resourceData.textField,
                    value: resourceData.idField
                },
                htmlAttributes: { 'title': labelValue, 'name': fieldName },
                floatLabelType: 'Always',
                placeholder: labelValue,
                popupHeight: '230px',
                popupWidth: '447px',
                itemTemplate: resourceTemplate
            });
            drowDownList.appendTo(resourceInput);
            drowDownList.isStringTemplate = true;
        }
        return resourceDiv;
    };
    EventWindow.prototype.renderDropDown = function (value) {
        var fieldName = this.getFieldName(value);
        var timezoneDiv = this.createDivElement(value + '-container');
        var timezoneInput = this.createInputElement(value + ' ' + EVENT_FIELD, fieldName);
        timezoneDiv.appendChild(timezoneInput);
        var drowDownList = new DropDownList({
            allowFiltering: true,
            change: this.onTimezoneChange.bind(this),
            cssClass: this.parent.cssClass || '',
            dataSource: timezoneData,
            enableRtl: this.parent.enableRtl,
            fields: { text: 'Text', value: 'Value' },
            filterBarPlaceholder: 'Search Timezone',
            filtering: function (e) {
                var query = new Query();
                query = (e.text !== '') ? query.where('Text', 'contains', e.text, true) : query;
                e.updateData(timezoneData, query);
            },
            htmlAttributes: { 'title': this.getFieldLabel(value), 'name': fieldName },
            floatLabelType: 'Always',
            placeholder: this.getFieldLabel(value),
            popupHeight: '230px',
        });
        drowDownList.appendTo(timezoneInput);
        drowDownList.isStringTemplate = true;
        return timezoneDiv;
    };
    EventWindow.prototype.onMultiselectResourceChange = function (args) {
        if (!args.value || !this.parent.activeViewOptions.group.byGroupID || this.parent.resourceCollection.length <= 1) {
            return;
        }
        var resourceCollection = this.parent.resourceBase.resourceCollection;
        var fieldName = args.element.getAttribute('name') || this.getColumnName(args.element);
        for (var i = 0; i < resourceCollection.length; i++) {
            if (resourceCollection[i].field === fieldName && i < resourceCollection.length - 1) {
                var resObject = this.createInstance(i);
                var datasource = [];
                for (var j = 0; j < args.value.length; j++) {
                    var resourceData = resourceCollection[i + 1].dataSource;
                    var query = new Query().where(resourceCollection[i + 1].groupIDField, 'equal', args.value[j]);
                    var filter = new DataManager({ json: resourceData }).executeLocal(query)[0];
                    var groupId = filter[resourceCollection[i + 1].idField];
                    var filterRes = this.filterDatasource(i, groupId);
                    datasource = datasource.concat(filterRes);
                }
                resObject.dataSource = datasource;
                resObject.dataBind();
            }
        }
    };
    EventWindow.prototype.createInstance = function (index) {
        var resourceData = this.parent.resourceBase.resourceCollection[index + 1];
        var resObject = this.element.querySelector('.e-' + resourceData.field).
            ej2_instances[0];
        return resObject;
    };
    EventWindow.prototype.onDropdownResourceChange = function (args) {
        if (!args.value || this.parent.resourceCollection.length <= 1 || !this.parent.activeViewOptions.group.byGroupID) {
            return;
        }
        var fieldName = args.element.getAttribute('name') || this.getColumnName(args.element);
        var resourceCollection = this.parent.resourceBase.resourceCollection;
        for (var i = 0; i < resourceCollection.length; i++) {
            if ((i < resourceCollection.length - 1) && resourceCollection[i].field === fieldName) {
                var resObj = this.createInstance(i);
                var groupId = args.itemData[resourceCollection[i].idField];
                resObj.dataSource = this.filterDatasource(i, groupId);
                resObj.dataBind();
                var resValue = resObj.dataSource[0][resourceCollection[i + 1].idField];
                resObj.value = (resourceCollection[i + 1].allowMultiple) ? [resValue] : resValue;
                resObj.dataBind();
            }
        }
    };
    EventWindow.prototype.filterDatasource = function (index, groupId) {
        var resourceData = this.parent.resourceBase.resourceCollection[index + 1];
        var query = new Query().where(resourceData.groupIDField, 'equal', groupId);
        var filter = new DataManager({ json: resourceData.dataSource }).executeLocal(query);
        return filter;
    };
    EventWindow.prototype.onTimezoneChange = function (args) {
        var fieldName = args.element.getAttribute('name') || this.getColumnName(args.element);
        if (fieldName === this.parent.eventFields.startTimezone) {
            var startTimezoneObj = this.getInstance(cls.EVENT_WINDOW_START_TZ_CLASS);
            var endTimezoneObj = this.getInstance(cls.EVENT_WINDOW_END_TZ_CLASS);
            endTimezoneObj.value = startTimezoneObj.value;
            endTimezoneObj.dataBind();
        }
    };
    EventWindow.prototype.renderCheckBox = function (value) {
        var checkBoxDiv = this.createDivElement(value + '-container');
        var fieldName = this.getFieldName(value);
        var checkBoxInput = this.createInputElement(value + ' ' + EVENT_FIELD, fieldName);
        checkBoxDiv.appendChild(checkBoxInput);
        var checkBox = new CheckBox({
            change: this.onChange.bind(this),
            cssClass: value + ' ' + this.parent.cssClass,
            enableRtl: this.parent.enableRtl,
            label: this.getFieldLabel(value)
        });
        checkBox.appendTo(checkBoxInput);
        checkBox.isStringTemplate = true;
        checkBoxInput.setAttribute('name', fieldName);
        if (fieldName === 'Repeat') {
            this.repeatStatus = checkBox;
        }
        return checkBoxDiv;
    };
    EventWindow.prototype.renderTextBox = function (value) {
        var textBoxDiv = this.createDivElement(value + '-container');
        var fieldName = this.getFieldName(value);
        var elementType = (value === cls.DESCRIPTION_CLASS) ? 'textarea' : 'input';
        var textBoxInput = this.createInputElement(value + ' ' + EVENT_FIELD, fieldName, elementType);
        textBoxDiv.appendChild(textBoxInput);
        Input.createInput({
            element: textBoxInput,
            floatLabelType: 'Always',
            properties: {
                enableRtl: this.parent.enableRtl,
                placeholder: this.getFieldLabel(value)
            }
        });
        return textBoxDiv;
    };
    EventWindow.prototype.getFieldName = function (name) {
        var fieldName = '';
        switch (name) {
            case cls.SUBJECT_CLASS:
                fieldName = this.fields.subject;
                break;
            case cls.LOCATION_CLASS:
                fieldName = this.fields.location;
                break;
            case cls.EVENT_WINDOW_START_CLASS:
                fieldName = this.fields.startTime;
                break;
            case cls.EVENT_WINDOW_END_CLASS:
                fieldName = this.fields.endTime;
                break;
            case cls.DESCRIPTION_CLASS:
                fieldName = this.fields.description;
                break;
            case cls.EVENT_WINDOW_ALL_DAY_CLASS:
                fieldName = this.fields.isAllDay;
                break;
            case cls.EVENT_WINDOW_START_TZ_CLASS:
                fieldName = this.fields.startTimezone;
                break;
            case cls.EVENT_WINDOW_END_TZ_CLASS:
                fieldName = this.fields.endTimezone;
                break;
            case cls.TIME_ZONE_CLASS:
                fieldName = 'Timezone';
                break;
            case cls.EVENT_WINDOW_REPEAT_CLASS:
                fieldName = 'Repeat';
                break;
        }
        return fieldName;
    };
    EventWindow.prototype.getFieldLabel = function (fieldName) {
        var labelText = '';
        switch (fieldName) {
            case cls.SUBJECT_CLASS:
                labelText = this.parent.editorTitles.subject;
                break;
            case cls.LOCATION_CLASS:
                labelText = this.parent.editorTitles.location;
                break;
            case cls.DESCRIPTION_CLASS:
                labelText = this.parent.editorTitles.description;
                break;
            case cls.EVENT_WINDOW_START_CLASS:
                labelText = this.parent.editorTitles.startTime;
                break;
            case cls.EVENT_WINDOW_END_CLASS:
                labelText = this.parent.editorTitles.endTime;
                break;
            case cls.EVENT_WINDOW_START_TZ_CLASS:
                labelText = this.parent.editorTitles.startTimezone;
                break;
            case cls.EVENT_WINDOW_END_TZ_CLASS:
                labelText = this.parent.editorTitles.endTimezone;
                break;
            case cls.EVENT_WINDOW_REPEAT_CLASS:
                labelText = this.parent.editorTitles.recurrenceRule;
                break;
            case cls.EVENT_WINDOW_ALL_DAY_CLASS:
                labelText = this.parent.editorTitles.isAllDay;
                break;
            case cls.TIME_ZONE_CLASS:
                labelText = this.l10n.getConstant('timezone');
                break;
        }
        return labelText;
    };
    EventWindow.prototype.onChange = function (args) {
        var target = (args.event.target);
        if (target.classList.contains(cls.EVENT_WINDOW_ALL_DAY_CLASS)) {
            this.onAllDayChange(args.checked);
        }
        else if (target.classList.contains(cls.TIME_ZONE_CLASS)) {
            this.timezoneChangeStyle(args.checked);
        }
        else if (target.classList.contains(cls.EVENT_WINDOW_REPEAT_CLASS)) {
            this.onRepeatChange(args.checked);
        }
    };
    EventWindow.prototype.renderRepeatDialog = function () {
        var element = createElement('div');
        this.repeatDialogObject = new Dialog({
            header: this.l10n.getConstant('recurrence'),
            visible: false,
            content: '<div class="e-rec-editor"></div>',
            closeOnEscape: true,
            width: '90%',
            buttons: [{
                    click: this.repeatSaveDialog.bind(this),
                    buttonModel: { content: this.l10n.getConstant('save'), cssClass: 'e-save', isPrimary: true }
                },
                { click: this.repeatCancelDialog.bind(this), buttonModel: { cssClass: 'e-cancel', content: this.l10n.getConstant('cancel') } }],
            target: this.element,
            animationSettings: { effect: 'Zoom' },
            enableRtl: this.parent.enableRtl,
            isModal: true,
            cssClass: REPEAT_DIALOG_CLASS,
            open: this.repeatOpenDialog.bind(this)
        });
        this.element.appendChild(element);
        this.repeatDialogObject.appendTo(element);
        this.repeatDialogObject.isStringTemplate = true;
        this.createRecurrenceEditor(this.repeatDialogObject.element.querySelector('.e-rec-editor'));
    };
    EventWindow.prototype.loadRecurrenceEditor = function () {
        this.repeatDialogObject.show();
        if (this.recurrenceEditor && this.repeatRule) {
            this.recurrenceEditor.setRecurrenceRule(this.repeatRule);
        }
    };
    EventWindow.prototype.onRepeatChange = function (state) {
        if (state) {
            if (!this.repeatDialogObject) {
                this.renderRepeatDialog();
            }
            this.recurrenceEditor.setProperties({ startDate: this.repeatStartDate, selectedType: 0 });
            this.loadRecurrenceEditor();
        }
        else {
            if (this.repeatDialogObject) {
                this.repeatDialogObject.hide();
            }
            this.repeatRule = '';
            if (this.recurrenceEditor) {
                this.recurrenceEditor.setRecurrenceRule(this.repeatRule);
                this.updateRepeatLabel(this.repeatRule);
            }
            var element = this.element.querySelector('.' + REPEAT_CONTAINER_CLASS);
            addClass([element], HIDE_STYLE_CLASS);
        }
    };
    EventWindow.prototype.repeatSaveDialog = function () {
        this.repeatRule = this.recurrenceEditor.getRecurrenceRule();
        var element = this.element.querySelector('.' + REPEAT_CONTAINER_CLASS);
        if (this.recurrenceEditor.getRecurrenceRule()) {
            removeClass([element], HIDE_STYLE_CLASS);
        }
        else {
            addClass([element], HIDE_STYLE_CLASS);
            this.repeatStatus.setProperties({ checked: false });
        }
        this.updateRepeatLabel(this.repeatRule);
        this.closeRepeatDialog();
    };
    EventWindow.prototype.closeRepeatDialog = function () {
        this.repeatDialogObject.hide();
    };
    EventWindow.prototype.repeatCancelDialog = function () {
        this.closeRepeatDialog();
        if (this.recurrenceEditor) {
            this.recurrenceEditor.setRecurrenceRule(this.repeatTempRule);
        }
        if (!this.repeatTempRule) {
            this.repeatStatus.setProperties({ checked: false });
        }
    };
    EventWindow.prototype.repeatOpenDialog = function () {
        this.repeatTempRule = this.recurrenceEditor.getRecurrenceRule();
    };
    EventWindow.prototype.onCellDetailsUpdate = function (eventObj, repeatType) {
        if (!this.parent.eventSettings.allowAdding) {
            return;
        }
        this.element.querySelector('.' + cls.FORM_CLASS).removeAttribute('data-id');
        this.element.querySelector('.' + cls.EVENT_WINDOW_TITLE_TEXT_CLASS).innerHTML = this.l10n.getConstant('newEvent');
        eventObj.Timezone = false;
        this.repeatStartDate = eventObj[this.fields.startTime];
        this.repeatRule = '';
        this.showDetails(eventObj);
        if (eventObj[this.fields.recurrenceRule] && this.recurrenceEditor) {
            this.recurrenceEditor.setRecurrenceRule(eventObj[this.fields.recurrenceRule], eventObj[this.fields.startTime]);
            this.repeatRule = eventObj[this.fields.recurrenceRule];
        }
        var deleteButton = this.element.querySelector('.' + cls.DELETE_EVENT_CLASS);
        if (deleteButton) {
            addClass([deleteButton], cls.DISABLE_CLASS);
        }
        if (this.recurrenceEditor) {
            this.recurrenceEditor.setProperties({
                startDate: eventObj[this.fields.startTime],
                selectedType: !isNullOrUndefined(repeatType) ? repeatType : !isNullOrUndefined(eventObj[this.fields.recurrenceRule]) ?
                    this.recurrenceEditor.selectedType : 0
            });
        }
        if (this.parent.isAdaptive && isNullOrUndefined(this.parent.editorTemplate)) {
            var element = this.element.querySelector('.' + REPEAT_CONTAINER_CLASS);
            addClass([element], HIDE_STYLE_CLASS);
            this.updateRepeatLabel(this.repeatRule);
        }
        else {
            var saveButton = this.element.querySelector('.' + cls.EVENT_WINDOW_SAVE_BUTTON_CLASS);
            this.disableButton(saveButton, false);
        }
        this.dialogObject.show();
    };
    EventWindow.prototype.convertToEventData = function (cellsData, eventObj) {
        if (cellsData.subject) {
            eventObj[this.fields.subject] = cellsData.subject;
        }
        eventObj[this.fields.startTime] = cellsData.startTime;
        eventObj[this.fields.endTime] = cellsData.endTime;
        eventObj[this.fields.isAllDay] = cellsData.isAllDay;
        if (cellsData.RecurrenceRule) {
            eventObj[this.fields.recurrenceRule] = cellsData.RecurrenceRule;
        }
        if (this.parent.resourceCollection.length > 0 || this.parent.activeViewOptions.group.resources.length > 0) {
            this.parent.resourceBase.setResourceValues(eventObj, false);
        }
    };
    EventWindow.prototype.applyFormValidation = function () {
        var getValidationRule = function (rules) { return (rules && Object.keys(rules).length > 0) ? rules : undefined; };
        var form = this.element.querySelector('.' + cls.FORM_CLASS);
        var rules = {};
        rules[this.parent.eventSettings.fields.subject.name] = getValidationRule(this.parent.eventSettings.fields.subject.validation);
        rules[this.parent.eventSettings.fields.location.name] = getValidationRule(this.parent.eventSettings.fields.location.validation);
        rules[this.parent.eventSettings.fields.startTime.name] = getValidationRule(this.parent.eventSettings.fields.startTime.validation);
        rules[this.parent.eventSettings.fields.endTime.name] = getValidationRule(this.parent.eventSettings.fields.endTime.validation);
        rules[this.parent.eventSettings.fields.description.name] =
            getValidationRule(this.parent.eventSettings.fields.description.validation);
        this.fieldValidator.renderFormValidator(form, rules, this.element);
    };
    EventWindow.prototype.showDetails = function (eventData) {
        var eventObj = extend({}, eventData, null, true);
        if (eventObj[this.fields.endTime].getHours() === 0 && eventObj[this.fields.endTime].getMinutes() === 0) {
            this.trimAllDay(eventObj);
        }
        this.eventData = eventObj;
        var formelement = this.getFormElements(cls.EVENT_WINDOW_DIALOG_CLASS);
        var keyNames = Object.keys(eventObj);
        for (var _i = 0, formelement_1 = formelement; _i < formelement_1.length; _i++) {
            var curElement = formelement_1[_i];
            var columnName = curElement.name || this.getColumnName(curElement);
            if (!isNullOrUndefined(columnName) && columnName !== '') {
                if (keyNames.indexOf(columnName) !== -1) {
                    this.setValueToElement(curElement, eventObj[columnName]);
                }
                else {
                    this.setDefaultValueToElement(curElement);
                }
            }
        }
        if (isNullOrUndefined(this.parent.editorTemplate)) {
            this.onAllDayChange(eventObj[this.fields.isAllDay]);
            var timezoneObj = this.getInstance(cls.TIME_ZONE_CLASS + '.' + EVENT_FIELD);
            if (!(isNullOrUndefined(eventObj[this.fields.startTimezone]) && isNullOrUndefined(eventObj[this.fields.endTimezone]))) {
                timezoneObj.checked = true;
                timezoneObj.dataBind();
            }
            this.timezoneChangeStyle(timezoneObj.checked);
            delete eventObj.Timezone;
        }
    };
    EventWindow.prototype.getColumnName = function (element) {
        var attrName = element.getAttribute('data-name') || '';
        if (attrName === '') {
            var isDropDowns = false;
            var fieldSelector = '';
            if (element.classList.contains('e-dropdownlist')) {
                fieldSelector = 'e-ddl';
                isDropDowns = true;
            }
            else if (element.classList.contains('e-multiselect')) {
                fieldSelector = 'e-multiselect';
                isDropDowns = true;
            }
            else if (element.classList.contains('e-datetimepicker')) {
                fieldSelector = 'e-datetimepicker';
            }
            else if (element.classList.contains('e-datepicker')) {
                fieldSelector = 'e-datepicker';
            }
            else if (element.classList.contains('e-checkbox')) {
                fieldSelector = 'e-checkbox';
            }
            var classSelector = isDropDowns ? "." + fieldSelector + ":not(.e-control)" : "." + fieldSelector;
            var control = closest(element, classSelector) || element.querySelector("." + fieldSelector);
            if (control) {
                var attrEle = control.querySelector('[name]');
                if (attrEle) {
                    attrName = attrEle.name;
                }
            }
        }
        return attrName;
    };
    EventWindow.prototype.onAllDayChange = function (allDayStatus) {
        var startObj = this.getInstance(cls.EVENT_WINDOW_START_CLASS);
        var endObj = this.getInstance(cls.EVENT_WINDOW_END_CLASS);
        var timezoneDiv = this.element.querySelector('.e-time-zone-container');
        var format;
        if (allDayStatus) {
            format = (isNullOrUndefined(this.parent.dateFormat)) ? this.getFormat('dateFormats') : this.parent.dateFormat;
            addClass(this.element.querySelectorAll('.e-time-icon'), cls.EVENT_WINDOW_ICON_DISABLE_CLASS);
            addClass([timezoneDiv], cls.DISABLE_CLASS);
            if (this.element.querySelector('.' + cls.EVENT_WINDOW_TIME_ZONE_DIV_CLASS)) {
                removeClass([this.element.querySelector('.' + cls.EVENT_WINDOW_TIME_ZONE_DIV_CLASS)], cls.ENABLE_CLASS);
            }
            startObj.format = endObj.format = format;
        }
        else {
            format = (isNullOrUndefined(this.parent.dateFormat)) ? this.getFormat('dateFormats') + ' ' + this.getFormat('timeFormats') :
                this.parent.dateFormat + ' ' + this.getFormat('timeFormats');
            removeClass(this.element.querySelectorAll('.e-time-icon'), cls.EVENT_WINDOW_ICON_DISABLE_CLASS);
            removeClass([timezoneDiv], cls.DISABLE_CLASS);
            if (this.element.querySelector('.e-checkbox-wrapper .e-time-zone').checked) {
                addClass([this.element.querySelector('.' + cls.EVENT_WINDOW_TIME_ZONE_DIV_CLASS)], cls.ENABLE_CLASS);
            }
            startObj.format = endObj.format = format;
        }
        if (this.cellClickAction) {
            this.updateDateTime(allDayStatus, startObj, endObj);
        }
        startObj.dataBind();
        endObj.dataBind();
    };
    EventWindow.prototype.updateDateTime = function (allDayStatus, startObj, endObj) {
        var startDate;
        var endDate;
        if (allDayStatus) {
            startDate = util.resetTime(new Date(this.eventWindowTime.startTime.getTime()));
            if (this.parent.activeCellsData.isAllDay) {
                var temp = util.addDays(new Date(this.eventWindowTime.endTime.getTime()), -1).getTime();
                endDate = (+this.eventWindowTime.startTime > temp) ? this.eventWindowTime.endTime : new Date(temp);
            }
            else {
                endDate = util.resetTime(new Date(this.eventWindowTime.endTime.getTime()));
            }
        }
        else {
            var start = this.parent.activeCellsData.startTime;
            startDate = new Date(this.eventWindowTime.startTime.getTime());
            startDate.setHours(start.getHours(), start.getMinutes(), start.getSeconds());
            if (this.parent.activeCellsData.isAllDay) {
                var startHour = this.parent.getStartEndTime(this.parent.workHours.start);
                startDate.setHours(startHour.getHours(), startHour.getMinutes(), startHour.getSeconds());
                endDate = new Date(startDate.getTime());
                endDate.setMilliseconds(util.MS_PER_MINUTE * this.getSlotDuration());
            }
            else {
                endDate = new Date(startDate.getTime());
                endDate.setMilliseconds(this.parent.activeCellsData.endTime.getTime() - this.parent.activeCellsData.startTime.getTime());
            }
        }
        this.eventWindowTime = { startTime: new Date(startDate.getTime()), endTime: new Date(endDate.getTime()) };
        startObj.value = startDate;
        endObj.value = endDate;
        startObj.dataBind();
        endObj.dataBind();
    };
    EventWindow.prototype.getFormat = function (formatType) {
        var format;
        if (this.parent.locale === 'en' || this.parent.locale === 'en-US') {
            format = getValue(formatType + '.short', getDefaultDateObject(this.parent.getCalendarMode()));
        }
        else {
            format = getValue(
            // tslint:disable-next-line:max-line-length
            'main.' + '' + this.parent.locale + '.dates.calendars.' + this.parent.getCalendarMode() + '.' + formatType + '.short', cldrData);
        }
        return format;
    };
    EventWindow.prototype.onEventDetailsUpdate = function (eventObj) {
        if (!this.parent.eventSettings.allowEditing) {
            return;
        }
        if (!this.parent.isAdaptive) {
            removeClass([this.element.querySelector('.' + cls.DELETE_EVENT_CLASS)], cls.DISABLE_CLASS);
        }
        this.element.querySelector('.' + cls.EVENT_WINDOW_TITLE_TEXT_CLASS).innerHTML = this.l10n.getConstant('editEvent');
        this.element.querySelector('.' + cls.FORM_CLASS).setAttribute('data-id', eventObj[this.fields.id].toString());
        if (isNullOrUndefined(this.parent.editorTemplate)) {
            eventObj = extend({}, eventObj, null, true);
            var timezoneObj = this.getInstance(cls.TIME_ZONE_CLASS + '.' + EVENT_FIELD);
            var timezoneValue = void 0;
            if (eventObj[this.fields.startTimezone] || eventObj[this.fields.endTimezone]) {
                timezoneValue = true;
                this.parent.eventBase.timezoneConvert(eventObj);
            }
            else {
                timezoneValue = false;
            }
            eventObj.Timezone = timezoneValue;
            timezoneObj.checked = timezoneValue;
            timezoneObj.dataBind();
        }
        this.showDetails(eventObj);
        if (eventObj[this.fields.recurrenceRule] && this.recurrenceEditor) {
            this.recurrenceEditor.setRecurrenceRule(eventObj[this.fields.recurrenceRule], eventObj[this.fields.startTime]);
        }
        else if (!this.parent.isAdaptive && this.recurrenceEditor) {
            this.recurrenceEditor.setProperties({ startDate: eventObj[this.fields.startTime] });
            this.recurrenceEditor.setRecurrenceRule('');
        }
        this.repeatStartDate = eventObj[this.fields.startTime];
        this.repeatRule = '';
        if (eventObj[this.fields.recurrenceRule]) {
            if (this.recurrenceEditor) {
                this.recurrenceEditor.setRecurrenceRule(eventObj[this.fields.recurrenceRule], eventObj[this.fields.startTime]);
            }
            this.repeatRule = eventObj[this.fields.recurrenceRule];
        }
        if (this.parent.isAdaptive && isNullOrUndefined(this.parent.editorTemplate)) {
            var element = this.element.querySelector('.' + REPEAT_CONTAINER_CLASS);
            if (eventObj[this.fields.recurrenceRule]) {
                removeClass([element], HIDE_STYLE_CLASS);
                this.repeatStatus.setProperties({ checked: true });
            }
            else {
                addClass([element], HIDE_STYLE_CLASS);
                this.repeatStatus.setProperties({ checked: false });
            }
            this.updateRepeatLabel(this.repeatRule);
        }
        var isDisable = (this.parent.readonly || eventObj[this.fields.isReadonly]);
        if (!this.parent.isAdaptive) {
            var saveButton = this.element.querySelector('.' + cls.EVENT_WINDOW_SAVE_BUTTON_CLASS);
            var deleteButton = this.element.querySelector('.' + cls.DELETE_EVENT_CLASS);
            this.disableButton(saveButton, isDisable);
            this.disableButton(deleteButton, isDisable);
        }
        else {
            var saveIcon = this.element.querySelector('.' + cls.EVENT_WINDOW_SAVE_ICON_CLASS);
            if (saveIcon) {
                if (isDisable) {
                    addClass([saveIcon], cls.ICON_DISABLE_CLASS);
                }
                else {
                    removeClass([saveIcon], cls.ICON_DISABLE_CLASS);
                }
            }
        }
        this.dialogObject.show();
    };
    EventWindow.prototype.disableButton = function (element, value) {
        if (element) {
            element.ej2_instances[0].disabled = value;
        }
    };
    EventWindow.prototype.renderRecurrenceEditor = function () {
        return new RecurrenceEditor({
            calendarMode: this.parent.calendarMode,
            cssClass: this.parent.cssClass,
            dateFormat: this.parent.dateFormat,
            enableRtl: this.parent.enableRtl,
            firstDayOfWeek: this.parent.activeViewOptions.firstDayOfWeek,
            locale: this.parent.locale
        });
    };
    EventWindow.prototype.updateRepeatLabel = function (repeatRule) {
        if (this.parent.isAdaptive && !this.repeatDialogObject) {
            this.renderRepeatDialog();
        }
        var data = repeatRule ?
            (this.l10n.getConstant('repeats') + ' ' + this.recurrenceEditor.getRuleSummary(repeatRule)) : this.l10n.getConstant('repeat');
        this.repeatStatus.setProperties({ label: data });
    };
    EventWindow.prototype.dialogClose = function () {
        this.isCrudAction = false;
        this.parent.activeEventData = { event: undefined, element: undefined };
        this.parent.currentAction = null;
        this.dialogObject.hide();
    };
    EventWindow.prototype.resetForm = function () {
        this.fieldValidator.destroyToolTip();
        this.resetFormFields();
        if (!this.parent.isAdaptive && this.recurrenceEditor) {
            this.recurrenceEditor.resetFields();
        }
    };
    EventWindow.prototype.timezoneChangeStyle = function (value) {
        var timezoneDiv = this.element.querySelector('.' + cls.EVENT_WINDOW_TIME_ZONE_DIV_CLASS);
        var localTimezoneName = this.parent.tzModule.getLocalTimezoneName();
        if (value) {
            addClass([timezoneDiv], cls.ENABLE_CLASS);
            var startTimezoneObj = this.getInstance(cls.EVENT_WINDOW_START_TZ_CLASS);
            var endTimezoneObj = this.getInstance(cls.EVENT_WINDOW_END_TZ_CLASS);
            var timezone = startTimezoneObj.dataSource;
            if (!startTimezoneObj.value || !this.parent.timezone) {
                var found = timezone.some(function (tz) { return tz.Value === localTimezoneName; });
                if (!found) {
                    timezone.push({ Value: localTimezoneName, Text: localTimezoneName });
                    startTimezoneObj.dataSource = timezone;
                    endTimezoneObj.dataSource = timezone;
                    startTimezoneObj.dataBind();
                    endTimezoneObj.dataBind();
                }
            }
            startTimezoneObj.value = startTimezoneObj.value || this.parent.timezone || localTimezoneName;
            endTimezoneObj.value = endTimezoneObj.value || this.parent.timezone || localTimezoneName;
            startTimezoneObj.dataBind();
            endTimezoneObj.dataBind();
        }
        else {
            removeClass([timezoneDiv], cls.ENABLE_CLASS);
        }
    };
    EventWindow.prototype.resetFormFields = function () {
        var formElement = this.getFormElements(cls.EVENT_WINDOW_DIALOG_CLASS);
        for (var _i = 0, formElement_1 = formElement; _i < formElement_1.length; _i++) {
            var currentElement = formElement_1[_i];
            var columnName = currentElement.name || this.getColumnName(currentElement);
            if (!isNullOrUndefined(columnName) && columnName !== '') {
                this.setDefaultValueToElement(currentElement);
            }
        }
    };
    EventWindow.prototype.eventSave = function (alert) {
        var formElement = this.element.querySelector('.' + cls.FORM_CLASS);
        if (formElement && formElement.classList.contains('e-formvalidator') &&
            !formElement.ej2_instances[0].validate()) {
            return;
        }
        var dataCollection = this.getEventDataFromEditor();
        if (this.processEventValidation(dataCollection.tempData, alert)) {
            return;
        }
        this.eventCrudData = dataCollection.eventData;
        this.isCrudAction = true;
        this.dialogObject.hide();
    };
    EventWindow.prototype.getEventDataFromEditor = function () {
        var eventObj = extend({}, this.getObjectFromFormData(cls.EVENT_WINDOW_DIALOG_CLASS));
        if (!eventObj.Timezone) {
            eventObj[this.fields.startTimezone] = null;
            eventObj[this.fields.endTimezone] = null;
        }
        delete eventObj.Timezone;
        delete eventObj.Repeat;
        this.setDefaultValueToObject(eventObj);
        eventObj[this.fields.recurrenceRule] = this.recurrenceEditor ? this.recurrenceEditor.getRecurrenceRule() || null : undefined;
        var tempObj = extend({}, eventObj, null, true);
        if (eventObj[this.fields.isAllDay]) {
            eventObj[this.fields.startTime] = util.resetTime(new Date(eventObj[this.fields.startTime].getTime()));
            eventObj[this.fields.endTime] = util.addDays(util.resetTime(new Date(eventObj[this.fields.endTime].getTime())), 1);
        }
        return { eventData: eventObj, tempData: tempObj };
    };
    EventWindow.prototype.processEventValidation = function (eventObj, alert) {
        var alertType;
        if (isNullOrUndefined(this.parent.editorTemplate)) {
            if (!eventObj[this.fields.startTime] || !eventObj[this.fields.endTime]) {
                this.parent.quickPopup.openValidationError('invalidDateError');
                return true;
            }
            if (eventObj[this.fields.startTime] > eventObj[this.fields.endTime]) {
                this.parent.quickPopup.openValidationError('startEndError');
                return true;
            }
        }
        if (this.recurrenceEditor && this.recurrenceEditor.value && this.recurrenceEditor.value !== '') {
            alertType = this.recurrenceValidation(eventObj[this.fields.startTime], eventObj[this.fields.endTime], alert);
            var isShowAlert = true;
            if (alertType === 'seriesChangeAlert' && this.parent.uiStateValues.isIgnoreOccurrence) {
                isShowAlert = false;
            }
            if (!isNullOrUndefined(alertType) && isShowAlert
                && ((!this.parent.enableRecurrenceValidation && alertType === 'wrongPattern') || this.parent.enableRecurrenceValidation)) {
                this.parent.quickPopup.openRecurrenceValidationAlert(alertType);
                return true;
            }
        }
        return false;
    };
    EventWindow.prototype.processCrudActions = function (eventObj) {
        this.parent.uiStateValues.isBlock = false;
        var resourceData = this.getResourceData(eventObj);
        var isResourceEventExpand = (this.parent.activeViewOptions.group.resources.length > 0 ||
            this.parent.resourceCollection.length > 0) && !this.parent.activeViewOptions.group.allowGroupEdit
            && !isNullOrUndefined(resourceData);
        var eventId = this.getEventIdFromForm();
        if (!isNullOrUndefined(eventId)) {
            var eveId = this.parent.eventBase.getEventIDType() === 'string' ? eventId : parseInt(eventId, 10);
            var editedData = new DataManager({ json: this.parent.eventsData }).executeLocal(new Query().
                where(this.fields.id, 'equal', eveId))[0];
            eventObj = extend({}, editedData, eventObj);
            if (eventObj[this.fields.isReadonly]) {
                return false;
            }
            var currentAction = void 0;
            if (!isNullOrUndefined(editedData[this.fields.recurrenceRule])) {
                currentAction = this.parent.currentAction;
                eventObj.Guid = this.parent.activeEventData.event.Guid;
                if (this.parent.currentAction === 'EditOccurrence') {
                    if (!eventObj[this.fields.recurrenceID]) {
                        eventObj[this.fields.id] = this.parent.eventBase.getEventMaxID();
                        eventObj.Guid = this.parent.activeEventData.event.Guid;
                    }
                    else {
                        eveId = eventObj[this.fields.recurrenceID];
                        currentAction = null;
                    }
                    if (this.parent.enableRecurrenceValidation && this.editOccurrenceValidation(eveId, eventObj)) {
                        this.parent.quickPopup.openRecurrenceValidationAlert('sameDayAlert');
                        return true;
                    }
                }
                if (this.parent.currentAction === 'EditSeries' || eventObj[this.fields.id] !== editedData[this.fields.id]) {
                    eventObj[this.fields.recurrenceID] = editedData[this.fields.id];
                }
                else if (this.parent.currentAction === 'EditFollowingEvents') {
                    eventObj[this.fields.id] = this.parent.eventBase.getEventMaxID();
                    eventObj[this.fields.followingID] = editedData[this.fields.id];
                }
            }
            if (isResourceEventExpand) {
                this.resourceSaveEvent(eventObj, 'Save', currentAction);
            }
            else {
                this.parent.saveEvent(eventObj, currentAction);
            }
        }
        else {
            this.parent.currentAction = 'Add';
            if (isResourceEventExpand) {
                this.resourceSaveEvent(eventObj, this.parent.currentAction);
            }
            else {
                eventObj[this.fields.id] = this.parent.eventBase.getEventMaxID();
                this.parent.addEvent(eventObj);
            }
        }
        return this.parent.uiStateValues.isBlock;
    };
    EventWindow.prototype.getResourceData = function (eventObj) {
        var resourceData = null;
        if (!isNullOrUndefined(this.parent.resourceBase) && !isNullOrUndefined(this.parent.resourceBase.resourceCollection)
            && this.parent.resourceBase.resourceCollection.length > 0) {
            var lastResouceData = this.parent.resourceBase.resourceCollection.slice(-1)[0];
            resourceData = eventObj[lastResouceData.field];
        }
        return resourceData;
    };
    EventWindow.prototype.getObjectFromFormData = function (className) {
        var formElement = this.getFormElements(className);
        var eventObj = {};
        for (var _i = 0, formElement_2 = formElement; _i < formElement_2.length; _i++) {
            var currentElement = formElement_2[_i];
            var columnName = currentElement.name || this.getColumnName(currentElement);
            if (!isNullOrUndefined(columnName) && columnName !== '') {
                eventObj[columnName] = this.getValueFromElement(currentElement);
            }
        }
        return eventObj;
    };
    EventWindow.prototype.setDefaultValueToObject = function (eventObj) {
        if (!isNullOrUndefined(eventObj[this.fields.subject])) {
            eventObj[this.fields.subject] = eventObj[this.fields.subject] || this.parent.eventSettings.fields.subject.default;
        }
        if (!isNullOrUndefined(eventObj[this.fields.location])) {
            eventObj[this.fields.location] = eventObj[this.fields.location] || this.parent.eventSettings.fields.location.default;
        }
        if (!isNullOrUndefined(eventObj[this.fields.description])) {
            eventObj[this.fields.description] = eventObj[this.fields.description] || this.parent.eventSettings.fields.description.default;
        }
    };
    EventWindow.prototype.recurrenceValidation = function (startDate, endDate, alert) {
        var alertMessage;
        var recEditor = this.recurrenceEditor;
        var interval = this.getInstance('e-repeat-interval.e-numerictextbox').value;
        if (alert !== this.l10n.getConstant('ok')) {
            var activeEvent = this.parent.activeEventData.event;
            var excludedEvents = [];
            if ((this.parent.currentAction === 'EditSeries' || this.parent.currentAction === 'EditFollowingEvents')
                && !isNullOrUndefined(activeEvent)) {
                var eventStartTime = activeEvent[this.parent.eventFields.startTime];
                var seriesEvents = this.parent.eventBase.getSeriesEvents(this.eventData, eventStartTime);
                if (seriesEvents.length > 0) {
                    excludedEvents = this.parent.eventBase.getEditedOccurrences(seriesEvents, eventStartTime);
                }
                else {
                    var event_2 = this.parent.eventBase.getEventById(activeEvent[this.parent.eventFields.id]);
                    excludedEvents = this.parent.eventBase.getEditedOccurrences([event_2], eventStartTime);
                }
                if (this.parent.currentAction === 'EditSeries'
                    && !isNullOrUndefined(this.eventData[this.parent.eventFields.recurrenceException])) {
                    excludedEvents.push(this.eventData);
                }
            }
            if (excludedEvents.length > 0) {
                alertMessage = 'seriesChangeAlert';
            }
            if (this.getInstance('e-end-on-left .e-ddl .e-dropdownlist').value === 'until' &&
                this.getInstance('e-end-on-date .e-datepicker').value < startDate) {
                alertMessage = 'wrongPattern';
            }
            if (isNullOrUndefined(alertMessage)) {
                switch (recEditor.value.split(';')[0].split('=')[1]) {
                    case 'DAILY':
                        if ((((endDate.getTime() - startDate.getTime()) / (1000 * 3600)) >= (interval * 24))) {
                            alertMessage = 'createError';
                        }
                        break;
                    case 'WEEKLY':
                        var types = recEditor.value.split(';')[1].split('=')[1].split(',');
                        var obj = { 'SU': 0, 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6 };
                        var temp = [];
                        var tempDiff = [];
                        for (var index = 0; index < types.length * (interval + 1); index++) {
                            temp[index] = (types.length > index) ? obj[types[index]] : temp[index - types.length] + (7 * interval);
                        }
                        var tempvalue = temp.sort(function (a, b) { return a - b; });
                        for (var index = 1; index < tempvalue.length; index++) {
                            tempDiff.push(tempvalue[index] - tempvalue[index - 1]);
                        }
                        if ((((endDate.getTime() - startDate.getTime()) / (1000 * 3600)) >= Math.min.apply(Math, tempDiff) * 24)
                            || isNullOrUndefined(interval)) {
                            alertMessage = 'createError';
                        }
                        break;
                    case 'MONTHLY':
                        if (endDate.getTime() >= new Date(+startDate).setMonth(startDate.getMonth() + interval)) {
                            alertMessage = 'createError';
                        }
                        break;
                    case 'YEARLY':
                        if (endDate.getTime() >= new Date(+startDate).setFullYear(startDate.getFullYear() + interval)) {
                            alertMessage = 'createError';
                        }
                        break;
                }
            }
        }
        else {
            if (endDate.getTime() >= new Date(+startDate).setMonth(startDate.getMonth() + interval)) {
                alertMessage = 'createError';
            }
            if (isNullOrUndefined(alertMessage)) {
                this.parent.quickPopup.quickDialog.hide();
            }
        }
        return alertMessage;
    };
    EventWindow.prototype.getRecurrenceIndex = function (recColl, event) {
        var recIndex;
        for (var index = 0; index < recColl.length; index++) {
            if (event[this.fields.startTime].valueOf() === recColl[index][this.fields.startTime].valueOf()) {
                recIndex = index;
                break;
            }
        }
        return recIndex;
    };
    EventWindow.prototype.trimAllDay = function (data) {
        if (data[this.fields.isAllDay]) {
            var temp = util.addDays(new Date(+data[this.fields.endTime]), -1).getTime();
            data[this.fields.endTime] = (+data[this.fields.startTime] > temp) ? data[this.fields.endTime] : new Date(temp);
        }
    };
    EventWindow.prototype.editOccurrenceValidation = function (eventId, currentData, editData) {
        if (editData === void 0) {
            editData = this.eventData;
        }
        var recurColl = this.parent.getOccurrencesByID(eventId);
        var excludedDatas = new DataManager({ json: this.parent.eventsData }).executeLocal(new Query().
            where(this.fields.recurrenceID, 'equal', eventId));
        excludedDatas.map(function (data) { return recurColl.push(extend({}, data)); });
        currentData = extend({}, currentData);
        this.trimAllDay(currentData);
        for (var _i = 0, recurColl_1 = recurColl; _i < recurColl_1.length; _i++) {
            var data = recurColl_1[_i];
            this.trimAllDay(data);
        }
        this.parent.eventBase.sortByTime(recurColl);
        var index = this.getRecurrenceIndex(recurColl, editData);
        if (isNullOrUndefined(index)) {
            return false;
        }
        if (index === 0) {
            if (!isNullOrUndefined(recurColl[index + 1])) {
                return (!(new Date(+recurColl[index + 1][this.fields.startTime]).setHours(0, 0, 0, 0) >
                    new Date(+currentData[this.fields.endTime]).setHours(0, 0, 0, 0)));
            }
            return false;
        }
        else {
            if (index === recurColl.length - 1) {
                if (!(new Date(+recurColl[index - 1][this.fields.endTime]).setHours(0, 0, 0, 0) <
                    new Date(+currentData[this.fields.startTime]).setHours(0, 0, 0, 0))) {
                    return true;
                }
            }
            else if (!((new Date(+recurColl[index - 1][this.fields.endTime]).setHours(0, 0, 0, 0) <
                new Date(+currentData[this.fields.startTime]).setHours(0, 0, 0, 0)) &&
                (new Date(+recurColl[index + 1][this.fields.startTime]).setHours(0, 0, 0, 0) >
                    new Date(+currentData[this.fields.endTime]).setHours(0, 0, 0, 0)))) {
                return true;
            }
        }
        return false;
    };
    EventWindow.prototype.resourceSaveEvent = function (eventObj, action, currentAction) {
        var _this = this;
        var lastResouceData = this.parent.resourceBase.resourceCollection.slice(-1)[0];
        var resourceData = eventObj[lastResouceData.field];
        resourceData = (resourceData instanceof Array) ? resourceData : [resourceData];
        var lastlevel = this.parent.resourceBase.lastResourceLevel;
        var eventList = [];
        var _loop_1 = function (i) {
            var events = extend({}, eventObj, null, true);
            events[this_1.fields.id] = this_1.parent.eventBase.getEventMaxID();
            var temp = [];
            var addValues = function () {
                if (action === 'Save' && i === resourceData.length - 1) {
                    if (temp.length > 0) {
                        temp[0][_this.fields.id] = eventObj[_this.fields.id];
                        for (var k = 1; k < temp.length; k++) {
                            temp[k][_this.fields.id] = _this.parent.eventBase.getEventMaxID(i);
                            eventList.push(temp[k]);
                            _this.parent.saveEvent(temp[0], currentAction);
                        }
                    }
                    else {
                        events[_this.fields.id] = eventObj[_this.fields.id];
                        _this.parent.saveEvent(events, currentAction);
                    }
                }
                else {
                    if (temp.length > 0) {
                        for (var j = 0; j < temp.length; j++) {
                            temp[j][_this.fields.id] = _this.parent.eventBase.getEventMaxID(j);
                            eventList.push(temp[j]);
                        }
                    }
                    else {
                        events[_this.fields.id] = _this.parent.eventBase.getEventMaxID(i);
                        eventList.push(events);
                    }
                }
            };
            if (this_1.parent.activeViewOptions.group.byGroupID && (!isNullOrUndefined(lastlevel))) {
                var lastResource = lastResouceData.dataSource;
                var index = util.findIndexInData(lastResource, lastResouceData.idField, resourceData[i]);
                if (index < 0) {
                    return { value: void 0 };
                }
                var groupId_1 = lastResource[index][lastResouceData.groupIDField];
                var filter = lastlevel.filter(function (obj) { return obj.resourceData[lastResouceData.idField] === resourceData[i]; }).
                    filter(function (obj) { return obj.resourceData[lastResouceData.groupIDField] === groupId_1; })[0];
                var groupOrder = filter.groupOrder;
                for (var index_1 = 0; index_1 < this_1.parent.resourceBase.resourceCollection.length; index_1++) {
                    var field = this_1.parent.resourceBase.resourceCollection[index_1].field;
                    events[field] = (groupOrder[index_1] instanceof Array) ? groupOrder[index_1][0] : groupOrder[index_1];
                }
                addValues();
            }
            else {
                for (var index = 0; index < this_1.parent.resourceBase.resourceCollection.length - 1; index++) {
                    var field = this_1.parent.resourceBase.resourceCollection[index].field;
                    if (events[field] instanceof Array && events[field].length > 1) {
                        for (var k = 0; k < events[field].length; k++) {
                            var event_3 = extend({}, events, null, true);
                            event_3[field] = eventObj[field][k];
                            event_3[lastResouceData.field] = resourceData[i];
                            temp.push(event_3);
                        }
                    }
                    else {
                        if (temp.length === 0) {
                            events[field] = (eventObj[field] instanceof Array) ?
                                eventObj[field][0] : eventObj[field];
                            events[lastResouceData.field] = resourceData[i];
                        }
                        else {
                            for (var l = 0; l < temp.length; l++) {
                                temp[l][field] = (eventObj[field] instanceof Array) ?
                                    eventObj[field][0] : eventObj[field];
                            }
                        }
                    }
                }
                events[lastResouceData.field] = resourceData[i];
                addValues();
            }
        };
        var this_1 = this;
        for (var i = 0; i < resourceData.length; i++) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        if (eventList.length > 0) {
            for (var _i = 0, eventList_1 = eventList; _i < eventList_1.length; _i++) {
                var event_4 = eventList_1[_i];
                event_4[this.fields.recurrenceException] = null;
                event_4[this.fields.recurrenceID] = null;
            }
            this.parent.addEvent(eventList);
        }
    };
    EventWindow.prototype.getEventIdFromForm = function () {
        return this.element.querySelector('.' + cls.FORM_CLASS).getAttribute('data-id');
    };
    EventWindow.prototype.getFormElements = function (className) {
        var elements = [];
        if (className === cls.EVENT_WINDOW_DIALOG_CLASS) {
            elements = [].slice.call(this.element.querySelectorAll('.' + EVENT_FIELD));
        }
        else {
            elements = [].slice.call(this.parent.element.querySelectorAll('.' + className + ' .' + EVENT_FIELD));
        }
        if (!isBlazor()) {
            return elements;
        }
        var validElements = [];
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var element = elements_1[_i];
            if (element.classList.contains('e-control')) {
                validElements.push(element);
            }
            else if (element.querySelector('.e-control')) {
                validElements.push(element.querySelector('.e-control'));
            }
            else {
                validElements.push(element);
            }
        }
        return validElements;
    };
    EventWindow.prototype.getValueFromElement = function (element) {
        var value;
        if (element.classList.contains('e-datepicker')) {
            value = element.ej2_instances[0].value;
        }
        else if (element.classList.contains('e-datetimepicker')) {
            value = element.ej2_instances[0].value;
        }
        else if (element.classList.contains('e-dropdownlist')) {
            value = element.ej2_instances[0].value;
        }
        else if (element.classList.contains('e-multiselect')) {
            value = element.ej2_instances[0].value;
        }
        else if (element.classList.contains('e-checkbox')) {
            value = element.ej2_instances[0].checked;
        }
        else {
            if (element.type === 'checkbox') {
                value = element.checked;
            }
            else {
                value = element.value;
            }
        }
        return value;
    };
    EventWindow.prototype.setValueToElement = function (element, value) {
        if (element.classList.contains('e-datepicker')) {
            var instance = element.ej2_instances[0];
            instance.value = value;
            instance.dataBind();
        }
        else if (element.classList.contains('e-datetimepicker')) {
            var instance = element.ej2_instances[0];
            if (instance.element.classList.contains(cls.EVENT_WINDOW_START_CLASS)) {
                this.eventWindowTime.startTime = new Date('' + value);
            }
            else {
                this.eventWindowTime.endTime = new Date('' + value);
            }
            instance.value = value;
            instance.dataBind();
        }
        else if (element.classList.contains('e-dropdownlist')) {
            var instance = element.ej2_instances[0];
            instance.value = value;
            instance.dataBind();
        }
        else if (element.classList.contains('e-multiselect')) {
            var instance = element.ej2_instances[0];
            instance.value = [];
            instance.value = ((value instanceof Array) ? value : [value]);
            instance.dataBind();
        }
        else if (element.classList.contains('e-checkbox')) {
            var instance = element.ej2_instances[0];
            instance.checked = value;
            instance.dataBind();
        }
        else {
            if (element.type !== 'checkbox') {
                element.value = value || '';
            }
            else {
                element.checked = value;
            }
        }
    };
    EventWindow.prototype.setDefaultValueToElement = function (element) {
        if (element.classList.contains('e-datepicker')) {
            var instance = element.ej2_instances[0];
            instance.value = this.parent.getCurrentTime();
            instance.dataBind();
        }
        else if (element.classList.contains('e-datetimepicker')) {
            var instance = element.ej2_instances[0];
            var dateValue = this.parent.getCurrentTime();
            this.eventWindowTime = { startTime: dateValue, endTime: dateValue };
            instance.value = dateValue;
            instance.dataBind();
        }
        else if (element.classList.contains('e-dropdownlist')) {
            var instance = element.ej2_instances[0];
            instance.value = null;
            instance.dataBind();
        }
        else if (element.classList.contains('e-multiselect')) {
            var instance = element.ej2_instances[0];
            instance.value = [];
            instance.dataBind();
        }
        else if (element.classList.contains('e-checkbox')) {
            var instance = element.ej2_instances[0];
            instance.checked = false;
            instance.dataBind();
        }
        else {
            if (element.type === 'checkbox') {
                element.checked = false;
            }
            else {
                element.value = '';
            }
        }
    };
    EventWindow.prototype.getInstance = function (className) {
        var element = this.element.querySelector('.' + className);
        return element ? element.ej2_instances[0] : null;
    };
    EventWindow.prototype.eventDelete = function () {
        switch (this.parent.currentAction) {
            case 'EditOccurrence':
                var fields = this.parent.eventFields;
                if (!isNullOrUndefined(this.parent.activeEventData.event[fields.recurrenceRule])) {
                    this.parent.currentAction = 'DeleteOccurrence';
                }
                else {
                    this.parent.currentAction = 'Delete';
                }
                break;
            case 'EditSeries':
                this.parent.currentAction = 'DeleteSeries';
                break;
            case 'Save':
                this.parent.currentAction = 'Delete';
                break;
        }
        this.isCrudAction = false;
        this.dialogObject.hide();
        this.parent.quickPopup.openDeleteAlert();
    };
    EventWindow.prototype.getRecurrenceEditorInstance = function () {
        if (this.parent.isAdaptive && !this.repeatDialogObject) {
            this.renderRepeatDialog();
        }
        return this.recurrenceEditor;
    };
    EventWindow.prototype.destroyComponents = function () {
        var formelement = this.getFormElements(cls.EVENT_WINDOW_DIALOG_CLASS);
        for (var _i = 0, formelement_2 = formelement; _i < formelement_2.length; _i++) {
            var element = formelement_2[_i];
            var instance = void 0;
            if (element.classList.contains('e-datetimepicker')) {
                instance = element.ej2_instances;
            }
            else if (element.classList.contains('e-datepicker')) {
                instance = element.ej2_instances;
            }
            else if (element.classList.contains('e-checkbox')) {
                instance = element.ej2_instances;
            }
            else if (element.classList.contains('e-dropdownlist')) {
                instance = element.ej2_instances;
            }
            else if (element.classList.contains('e-multiselect')) {
                instance = element.ej2_instances;
            }
            if (instance && instance[0]) {
                instance[0].destroy();
            }
        }
        if (this.buttonObj) {
            this.buttonObj.destroy();
        }
    };
    /**
     * To destroy the event window.
     * @return {void}
     * @private
     */
    EventWindow.prototype.destroy = function () {
        this.resetEditorTemplate();
        if (this.recurrenceEditor) {
            this.recurrenceEditor.destroy();
        }
        this.destroyComponents();
        this.fieldValidator.destroy();
        if (this.repeatDialogObject) {
            this.repeatDialogObject.destroy();
            remove(this.repeatDialogObject.element);
        }
        if (this.dialogObject) {
            this.dialogObject.destroy();
            this.dialogObject = null;
        }
        if (this.element) {
            remove(this.element);
            this.element = null;
        }
    };
    return EventWindow;
}());
export { EventWindow };
