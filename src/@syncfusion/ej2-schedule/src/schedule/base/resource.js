import { extend, isNullOrUndefined, createElement, EventHandler, addClass, append, removeClass, remove, closest, classList } from '@syncfusion/ej2-base';
import { DataManager, Query } from '@syncfusion/ej2-data';
import { TreeView } from '@syncfusion/ej2-navigations';
import { Popup } from '@syncfusion/ej2-popups';
import { Data } from '../actions/data';
import * as cls from '../base/css-constant';
import * as events from '../base/constant';
import * as util from '../base/util';
var ResourceBase = /** @class */ (function () {
    function ResourceBase(parent) {
        this.resourceCollection = [];
        this.leftPixel = 25;
        this.parent = parent;
    }
    ResourceBase.prototype.renderResourceHeaderIndent = function (tr) {
        var resColTd = createElement('td', { className: cls.RESOURCE_LEFT_TD_CLASS });
        var resColDiv = createElement('div', { className: cls.RESOURCE_TEXT_CLASS });
        resColTd.appendChild(resColDiv);
        var args = { elementType: 'emptyCells', element: resColTd };
        this.parent.trigger(events.renderCell, args);
        tr.appendChild(resColTd);
    };
    ResourceBase.prototype.hideResourceRows = function (tBody) {
        if (this.resourceCollection.length <= 1 || this.parent.virtualScrollModule) {
            return;
        }
        var trCount = this.lastResourceLevel.length;
        for (var i = 0; i < trCount; i++) {
            var resData = this.lastResourceLevel[i].resourceData;
            var res = this.lastResourceLevel[i].resource;
            if (resData.ClassName === cls.RESOURCE_PARENT_CLASS && !resData[res.expandedField] &&
                !isNullOrUndefined(resData[res.expandedField])) {
                var trCollection = [].slice.call(tBody.children);
                var slicedCollection = trCollection.slice(i + 1, i + (parseInt(resData.Count, 0) + 1));
                addClass(slicedCollection, cls.HIDDEN_CLASS);
            }
        }
    };
    ResourceBase.prototype.createResourceColumn = function () {
        var resColl = this.resourceCollection;
        var resDiv = createElement('div', { className: cls.RESOURCE_COLUMN_WRAP_CLASS });
        var tbl = this.parent.activeView.createTableLayout(cls.RESOURCE_COLUMN_TABLE_CLASS);
        if (!this.parent.uiStateValues.isGroupAdaptive && this.parent.rowAutoHeight && this.parent.activeView.isTimelineView()
            && this.parent.activeViewOptions.group.resources.length > 0) {
            addClass([tbl], cls.AUTO_HEIGHT);
        }
        var tBody = tbl.querySelector('tbody');
        var resData = this.generateTreeData(true);
        this.countCalculation(resColl.slice(0, -2), resColl.slice(0, -1));
        this.renderedResources = this.lastResourceLevel;
        if (this.parent.virtualScrollModule) {
            var resourceCount = this.parent.virtualScrollModule.getRenderedCount();
            this.setExpandedResources();
            resData = this.expandedResources.slice(0, resourceCount);
            this.renderedResources = resData;
        }
        append(this.getContentRows(resData), tBody);
        this.hideResourceRows(tBody);
        tbl.appendChild(tBody);
        resDiv.appendChild(tbl);
        return resDiv;
    };
    ResourceBase.prototype.setExpandedResources = function () {
        var resources = [];
        for (var i = 0; i < this.lastResourceLevel.length; i++) {
            var resource = this.lastResourceLevel[i].resourceData;
            var count = resource.Count;
            resources.push(this.lastResourceLevel[i]);
            var isExpanded = resource[this.lastResourceLevel[i].resource.expandedField];
            if (!isNullOrUndefined(isExpanded) && !isExpanded && count > 0) {
                i = i + count;
            }
        }
        this.expandedResources = resources;
    };
    ResourceBase.prototype.getContentRows = function (resData) {
        var resRows = [];
        var left;
        var rIndex;
        var resColl = this.resourceCollection;
        var tr = createElement('tr');
        var td = createElement('td');
        for (var i = 0; i < resData.length; i++) {
            var ntd = td.cloneNode();
            rIndex = util.findIndexInData(resColl, 'name', resData[i].resource.name);
            if (rIndex === resColl.length - 1) {
                extend(resData[i].resourceData, { ClassName: cls.RESOURCE_CHILD_CLASS });
                this.renderedResources[i].className = [cls.RESOURCE_CHILD_CLASS];
            }
            else {
                extend(resData[i].resourceData, { ClassName: cls.RESOURCE_PARENT_CLASS });
                this.renderedResources[i].className = [cls.RESOURCE_PARENT_CLASS];
            }
            left = (rIndex * this.leftPixel) + 'px';
            if (resData[i].resourceData.ClassName === cls.RESOURCE_PARENT_CLASS
                && !isNullOrUndefined(resData[i].resourceData.Count) && (resData[i].resourceData.Count > 0)) {
                var iconClass = void 0;
                if (resData[i].resourceData[resColl[rIndex].expandedField] ||
                    isNullOrUndefined(resData[i].resourceData[resColl[rIndex].expandedField])) {
                    iconClass = cls.RESOURCE_COLLAPSE_CLASS;
                }
                else {
                    iconClass = cls.RESOURCE_EXPAND_CLASS;
                }
                var iconDiv = createElement('div');
                addClass([iconDiv], [cls.RESOURCE_TREE_ICON_CLASS, iconClass]);
                this.setMargin(iconDiv, left);
                ntd.appendChild(iconDiv);
                if (this.resourceCollection.length > 1) {
                    EventHandler.add(iconDiv, 'click', this.onTreeIconClick, this);
                }
            }
            this.parent.activeView.setResourceHeaderContent(ntd, resData[i], cls.RESOURCE_TEXT_CLASS);
            ntd.setAttribute('data-group-index', resData[i].groupIndex.toString());
            if (!this.parent.activeViewOptions.resourceHeaderTemplate) {
                this.setMargin(ntd.querySelector('.' + cls.RESOURCE_TEXT_CLASS), left);
            }
            var classCollection = [cls.RESOURCE_CELLS_CLASS, resData[i].resourceData.ClassName];
            addClass([ntd], classCollection);
            var args = { elementType: 'resourceHeader', element: ntd, groupIndex: resData[i].groupIndex };
            this.parent.trigger(events.renderCell, args);
            var ntr = tr.cloneNode();
            ntr.appendChild(ntd);
            resRows.push(ntr);
        }
        return resRows;
    };
    ResourceBase.prototype.setMargin = function (element, value) {
        if (!this.parent.enableRtl) {
            element.style.marginLeft = value;
        }
        else {
            element.style.marginRight = value;
        }
    };
    ResourceBase.prototype.countCalculation = function (parentCollection, wholeCollection) {
        var collection;
        for (var y = 0; y < parentCollection.length; y++) {
            var data = parentCollection[parentCollection.length - (y + 1)]
                .dataSource;
            for (var x = 0; x < data.length; x++) {
                var totalCount = 0;
                if (this.parent.activeViewOptions.group.byGroupID) {
                    collection = new DataManager(wholeCollection[wholeCollection.length - 1].dataSource)
                        .executeLocal(new Query().where(wholeCollection[wholeCollection.length - 1].groupIDField, 'equal', data[x][parentCollection[parentCollection.length - (y + 1)].idField]));
                }
                else {
                    collection = wholeCollection[wholeCollection.length - 1].dataSource;
                }
                for (var z = 0; z < collection.length; z++) {
                    totalCount = totalCount + parseInt(collection[z].Count, 0);
                }
                totalCount = totalCount + parseInt(data[x].Count, 0);
                extend(data[x], { Count: totalCount });
            }
            wholeCollection = wholeCollection.slice(0, -1);
        }
    };
    ResourceBase.prototype.onTreeIconClick = function (e) {
        var _this = this;
        if (this.parent.eventTooltip) {
            this.parent.eventTooltip.close();
        }
        var target = e.target;
        var hide;
        var trElement = closest(target, '.' + cls.RESOURCE_PARENT_CLASS)
            .parentElement;
        var index = parseInt(trElement.children[0].getAttribute('data-group-index'), 10);
        var args = {
            cancel: false, event: e, groupIndex: index,
            requestType: !target.classList.contains(cls.RESOURCE_COLLAPSE_CLASS) ? 'resourceExpand' : 'resourceCollapse',
        };
        this.parent.trigger(events.actionBegin, args, function (actionArgs) {
            if (!actionArgs.cancel) {
                if (target.classList.contains(cls.RESOURCE_COLLAPSE_CLASS)) {
                    classList(target, [cls.RESOURCE_EXPAND_CLASS], [cls.RESOURCE_COLLAPSE_CLASS]);
                    hide = true;
                }
                else {
                    classList(target, [cls.RESOURCE_COLLAPSE_CLASS], [cls.RESOURCE_EXPAND_CLASS]);
                    hide = false;
                }
                var eventElements = [].slice.call(_this.parent.element.querySelectorAll('.' + cls.APPOINTMENT_CLASS));
                eventElements.forEach(function (node) { return remove(node); });
                if (_this.parent.virtualScrollModule) {
                    _this.updateVirtualContent(index, hide);
                }
                else {
                    _this.updateContent(index, hide);
                }
                var data = { cssProperties: _this.parent.getCssProperties(), module: 'scroll' };
                _this.parent.notify(events.scrollUiUpdate, data);
                args = {
                    cancel: false, event: e, groupIndex: index,
                    requestType: target.classList.contains(cls.RESOURCE_COLLAPSE_CLASS) ? 'resourceExpanded' : 'resourceCollapsed',
                };
                _this.parent.notify(events.dataReady, {});
                _this.parent.trigger(events.actionComplete, args);
            }
        });
    };
    ResourceBase.prototype.updateContent = function (index, hide) {
        var rowCollection = [];
        var workCellCollection = [];
        var headerRowCollection = [];
        var pNode;
        var clickedRes = this.lastResourceLevel[index].resourceData;
        var resRows = [].slice.call(this.parent.element.querySelectorAll('.' + cls.RESOURCE_COLUMN_WRAP_CLASS + ' ' + 'tr'));
        var contentRows = [].slice.call(this.parent.element.querySelectorAll('.' + cls.CONTENT_WRAP_CLASS + ' ' + 'tbody tr'));
        var eventRows = [].slice.call(this.parent.element.querySelectorAll('.' + cls.CONTENT_WRAP_CLASS + ' .' + cls.APPOINTMENT_CONTAINER_CLASS));
        for (var j = 0; j < clickedRes.Count; j++) {
            rowCollection.push(resRows[index + j + 1]);
            workCellCollection.push(contentRows[index + j + 1]);
            headerRowCollection.push(eventRows[index + j + 1]);
        }
        var clonedCollection = this.lastResourceLevel;
        for (var i = 0; i < rowCollection.length; i++) {
            var expanded = true;
            pNode = rowCollection[i].children[0].classList.contains(cls.RESOURCE_PARENT_CLASS);
            clonedCollection[index].resourceData[clonedCollection[index].resource.expandedField] = !hide;
            if (hide) {
                if (pNode) {
                    var trElem = rowCollection[i].querySelector('.' + cls.RESOURCE_TREE_ICON_CLASS);
                    if (trElem) {
                        classList(trElem, [cls.RESOURCE_EXPAND_CLASS], [cls.RESOURCE_COLLAPSE_CLASS]);
                    }
                }
                if (!rowCollection[i].classList.contains(cls.HIDDEN_CLASS)) {
                    addClass([rowCollection[i], workCellCollection[i], headerRowCollection[i]], cls.HIDDEN_CLASS);
                }
            }
            else {
                if (pNode) {
                    var rowIndex = rowCollection[i].rowIndex;
                    if (!clonedCollection[rowIndex].resourceData[clonedCollection[rowIndex].resource.expandedField]
                        && !isNullOrUndefined(clonedCollection[rowIndex].resourceData[clonedCollection[rowIndex].resource.expandedField])) {
                        rowCollection.splice(i + 1, (parseInt(clonedCollection[rowIndex].resourceData.Count, 0)));
                        workCellCollection.splice(i + 1, (parseInt(clonedCollection[rowIndex].resourceData.Count, 0)));
                        headerRowCollection.splice(i + 1, (parseInt(clonedCollection[rowIndex].resourceData.Count, 0)));
                        expanded = false;
                    }
                    if (expanded) {
                        var trElem = rowCollection[i].querySelector('.' + cls.RESOURCE_TREE_ICON_CLASS);
                        if (trElem) {
                            classList(trElem, [cls.RESOURCE_COLLAPSE_CLASS], [cls.RESOURCE_EXPAND_CLASS]);
                        }
                    }
                }
                if (rowCollection[i].classList.contains(cls.HIDDEN_CLASS)) {
                    removeClass([rowCollection[i], workCellCollection[i], headerRowCollection[i]], cls.HIDDEN_CLASS);
                }
            }
        }
    };
    ResourceBase.prototype.updateVirtualContent = function (index, expand) {
        this.lastResourceLevel[index].resourceData[this.lastResourceLevel[index].resource.expandedField] = !expand;
        this.setExpandedResources();
        var resourceCount = this.parent.virtualScrollModule.getRenderedCount();
        var startIndex = this.expandedResources.indexOf(this.renderedResources[0]);
        this.renderedResources = this.expandedResources.slice(startIndex, startIndex + resourceCount);
        if (this.renderedResources.length < resourceCount) {
            var sIndex = this.expandedResources.length - resourceCount;
            sIndex = (sIndex > 0) ? sIndex : 0;
            this.renderedResources = this.expandedResources.slice(sIndex, this.expandedResources.length);
        }
        var virtualTrack = this.parent.element.querySelector('.' + cls.VIRTUAL_TRACK_CLASS);
        this.parent.virtualScrollModule.updateVirtualTrackHeight(virtualTrack);
        var resTable = this.parent.element.querySelector('.' + cls.RESOURCE_COLUMN_WRAP_CLASS + ' ' + 'table');
        var contentTable = this.parent.element.querySelector('.' + cls.CONTENT_WRAP_CLASS + ' ' + 'table');
        var eventTable = this.parent.element.querySelector('.' + cls.EVENT_TABLE_CLASS);
        this.parent.virtualScrollModule.updateContent(resTable, contentTable, eventTable, this.renderedResources);
        var timeIndicator = this.parent.element.querySelector('.' + cls.CURRENT_TIMELINE_CLASS);
        if (!isNullOrUndefined(timeIndicator)) {
            timeIndicator.style.height =
                this.parent.element.querySelector('.' + cls.CONTENT_TABLE_CLASS).offsetHeight + 'px';
        }
    };
    ResourceBase.prototype.renderResourceHeader = function () {
        var resourceWrapper = createElement('div', { className: cls.RESOURCE_TOOLBAR_CONTAINER });
        resourceWrapper.innerHTML = '<div class="' + cls.RESOURCE_HEADER_TOOLBAR + '"><div class="' + cls.RESOURCE_MENU + '">' +
            '<div class="e-icons ' + cls.RESOURCE_MENU_ICON + '"></div></div><div class="' + cls.RESOURCE_LEVEL_TITLE + '"></div></div>';
        if (this.parent.currentView === 'MonthAgenda') {
            var target = this.parent.activeView.getPanel().querySelector('.' + cls.CONTENT_WRAP_CLASS);
            target.insertBefore(resourceWrapper, target.children[1]);
        }
        else {
            this.parent.element.insertBefore(resourceWrapper, this.parent.element.children[2]);
        }
        this.renderResourceHeaderText();
        EventHandler.add(resourceWrapper.querySelector('.' + cls.RESOURCE_MENU_ICON), 'click', this.menuClick, this);
    };
    ResourceBase.prototype.renderResourceTree = function () {
        this.popupOverlay = createElement('div', { className: cls.RESOURCE_TREE_POPUP_OVERLAY });
        var treeWrapper = createElement('div', { className: cls.RESOURCE_TREE_POPUP + ' e-popup-close' });
        if (this.parent.currentView === 'MonthAgenda') {
            var target = this.parent.activeView.getPanel().querySelector('.' + cls.WRAPPER_CONTAINER_CLASS);
            target.insertBefore(treeWrapper, target.children[0]);
            target.appendChild(this.popupOverlay);
        }
        else {
            this.parent.element.querySelector('.' + cls.TABLE_CONTAINER_CLASS).appendChild(treeWrapper);
            this.parent.element.querySelector('.' + cls.TABLE_CONTAINER_CLASS).appendChild(this.popupOverlay);
        }
        var resourceTree = createElement('div', { className: cls.RESOURCE_TREE });
        treeWrapper.appendChild(resourceTree);
        this.treeViewObj = new TreeView({
            cssClass: this.parent.cssClass,
            enableRtl: this.parent.enableRtl,
            fields: {
                dataSource: this.generateTreeData(),
                id: 'resourceId',
                text: 'resourceName',
                child: 'resourceChild'
            },
            nodeTemplate: this.parent.resourceHeaderTemplate,
            nodeClicked: this.resourceClick.bind(this)
        });
        this.treeViewObj.appendTo(resourceTree);
        this.treeViewObj.expandAll();
        this.treePopup = new Popup(treeWrapper, {
            targetType: 'relative',
            actionOnScroll: 'none',
            content: this.treeViewObj.element,
            enableRtl: this.parent.enableRtl,
            hideAnimation: { name: 'SlideLeftOut', duration: 500 },
            showAnimation: { name: 'SlideLeftIn', duration: 500 },
            viewPortElement: this.parent.element.querySelector('.' + (this.parent.currentView === 'MonthAgenda' ?
                cls.WRAPPER_CONTAINER_CLASS : cls.TABLE_CONTAINER_CLASS))
        });
        this.parent.on(events.documentClick, this.documentClick, this);
    };
    ResourceBase.prototype.generateTreeData = function (isTimeLine) {
        var _this = this;
        var treeCollection = [];
        var resTreeColl = [];
        var groupIndex = 0;
        this.resourceTreeLevel.forEach(function (resTree, index) {
            var treeHandler = function (treeLevel, index, levelId) {
                var resource = _this.resourceCollection[index];
                var treeArgs;
                var resObj;
                if (!isTimeLine) {
                    treeArgs = {
                        resourceId: levelId,
                        resourceName: treeLevel.resourceData[resource.textField]
                    };
                }
                else {
                    resObj = {
                        type: 'resourceHeader', resource: treeLevel.resource,
                        resourceData: treeLevel.resourceData, groupIndex: groupIndex,
                        groupOrder: treeLevel.groupOrder
                    };
                    resTreeColl.push(resObj);
                    groupIndex++;
                }
                if (treeLevel.child.length > 0 && !isTimeLine) {
                    treeArgs.resourceChild = [];
                }
                var count = 1;
                for (var _i = 0, _a = treeLevel.child; _i < _a.length; _i++) {
                    var tree = _a[_i];
                    if (!isTimeLine) {
                        treeArgs.resourceChild.push(treeHandler(tree, index + 1, levelId + '-' + count));
                    }
                    else {
                        treeHandler(tree, index + 1, levelId + '-' + count);
                    }
                    count += 1;
                }
                if (isTimeLine) {
                    extend(resObj.resourceData, { Count: count - 1 });
                }
                return treeArgs;
            };
            if (!isTimeLine) {
                treeCollection.push(treeHandler(resTree, 0, (index + 1).toString()));
            }
            else {
                treeHandler(resTree, 0, (index + 1).toString());
            }
        });
        if (isTimeLine) {
            this.lastResourceLevel = resTreeColl;
            return resTreeColl;
        }
        else {
            return treeCollection;
        }
    };
    ResourceBase.prototype.renderResourceHeaderText = function () {
        var _this = this;
        var resource = this.lastResourceLevel[this.parent.uiStateValues.groupIndex];
        var headerCollection = [];
        resource.groupOrder.forEach(function (level, index) {
            var resourceLevel = _this.resourceCollection[index];
            var resourceText = resourceLevel.dataSource.filter(function (resData) {
                return resData[resourceLevel.idField] === level;
            });
            var resourceName = createElement('div', {
                className: cls.RESOURCE_NAME,
                innerHTML: resourceText[0][resourceLevel.textField]
            });
            headerCollection.push(resourceName);
            var levelIcon = createElement('div', { className: 'e-icons e-icon-next' });
            headerCollection.push(levelIcon);
        });
        headerCollection.pop();
        var target = (this.parent.currentView === 'MonthAgenda') ? this.parent.activeView.getPanel() : this.parent.element;
        var headerWrapper = target.querySelector('.' + cls.RESOURCE_LEVEL_TITLE);
        util.removeChildren(headerWrapper);
        headerCollection.forEach(function (element) { return headerWrapper.appendChild(element); });
        if (this.lastResourceLevel.length === 1) {
            addClass([this.parent.element.querySelector('.' + cls.RESOURCE_MENU)], cls.DISABLE_CLASS);
        }
    };
    ResourceBase.prototype.menuClick = function (event) {
        if (this.parent.element.querySelector('.' + cls.RESOURCE_TREE_POPUP).classList.contains('e-popup-open')) {
            this.treePopup.hide();
            removeClass([this.popupOverlay], 'e-enable');
        }
        else {
            var treeNodes = this.treeViewObj.element.querySelectorAll('.e-list-item:not(.e-has-child)');
            removeClass(treeNodes, 'e-active');
            addClass([treeNodes[this.parent.uiStateValues.groupIndex]], 'e-active');
            this.treePopup.show();
            addClass([this.popupOverlay], 'e-enable');
        }
    };
    ResourceBase.prototype.resourceClick = function (event) {
        if (!event.node.classList.contains('e-has-child')) {
            this.treePopup.hide();
            var treeNodes = [].slice.call(this.treeViewObj.element.querySelectorAll('.e-list-item:not(.e-has-child)'));
            this.parent.uiStateValues.groupIndex = treeNodes.indexOf(event.node);
            this.parent.renderModule.render(this.parent.currentView, false);
            var processed = this.parent.eventBase.processData(this.parent.eventsData);
            this.parent.notify(events.dataReady, { processedData: processed });
        }
        event.event.preventDefault();
    };
    ResourceBase.prototype.documentClick = function (args) {
        if (closest(args.event.target, '.' + cls.RESOURCE_TREE_POPUP)) {
            return;
        }
        var treeWrapper = this.parent.element.querySelector('.' + cls.RESOURCE_TREE_POPUP);
        if (treeWrapper && treeWrapper.classList.contains('e-popup-open')) {
            this.treePopup.hide();
            removeClass([this.popupOverlay], 'e-enable');
        }
    };
    ResourceBase.prototype.bindResourcesData = function (isSetModel) {
        var _this = this;
        this.parent.showSpinner();
        var promises = [];
        for (var i = 0; i < this.parent.resources.length; i++) {
            var dataModule = new Data(this.parent.resources[i].dataSource, this.parent.resources[i].query);
            promises.push(dataModule.getData(dataModule.generateQuery()));
        }
        Promise.all(promises).then(function (e) { return _this.dataManagerSuccess(e, isSetModel); })
            .catch(function (e) { return _this.dataManagerFailure(e); });
    };
    ResourceBase.prototype.dataManagerSuccess = function (e, isSetModel) {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.resourceCollection = [];
        for (var i = 0, length_1 = e.length; i < length_1; i++) {
            var resource = this.parent.resources[i];
            var resourceObj = this.getResourceModel(resource, e[i].result);
            this.parent.resourceCollection.push(resourceObj);
        }
        this.refreshLayout(isSetModel);
    };
    ResourceBase.prototype.getResourceModel = function (resource, resourceData) {
        var resourceObj = {
            field: resource.field,
            title: resource.title,
            name: resource.name,
            allowMultiple: resource.allowMultiple,
            dataSource: resourceData || resource.dataSource,
            idField: resource.idField,
            textField: resource.textField,
            groupIDField: resource.groupIDField,
            colorField: resource.colorField,
            startHourField: resource.startHourField,
            endHourField: resource.endHourField,
            workDaysField: resource.workDaysField,
            expandedField: resource.expandedField,
            cssClassField: resource.cssClassField
        };
        return resourceObj;
    };
    ResourceBase.prototype.refreshLayout = function (isSetModel) {
        this.parent.uiStateValues.groupIndex = 0;
        this.parent.renderElements(isSetModel);
        if (isSetModel) {
            this.parent.eventWindow.refresh();
        }
    };
    ResourceBase.prototype.setResourceCollection = function () {
        var requiredResources = [];
        this.resourceCollection = [];
        this.colorIndex = null;
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            for (var _i = 0, _a = this.parent.activeViewOptions.group.resources; _i < _a.length; _i++) {
                var resource = _a[_i];
                var index_1 = util.findIndexInData(this.parent.resourceCollection, 'name', resource);
                if (index_1 >= 0) {
                    requiredResources.push(this.parent.resourceCollection[index_1]);
                }
            }
        }
        else if (this.parent.resourceCollection.length > 0) {
            requiredResources = this.parent.resourceCollection;
        }
        var index = 0;
        for (var _b = 0, requiredResources_1 = requiredResources; _b < requiredResources_1.length; _b++) {
            var resource = requiredResources_1[_b];
            var resources = this.getResourceModel(resource);
            if (resource.name === this.parent.eventSettings.resourceColorField) {
                this.colorIndex = index;
            }
            index++;
            this.resourceCollection.push(resources);
        }
        if (isNullOrUndefined(this.colorIndex)) {
            this.colorIndex = this.resourceCollection.length - 1;
        }
    };
    ResourceBase.prototype.generateResourceLevels = function (innerDates, isTimeLine) {
        var _this = this;
        var resources = this.resourceCollection;
        var resTreeGroup = [];
        var lastColumnDates = [];
        var group = function (resources, index, prevResource, prevResourceData, prevOrder) {
            var resTree = [];
            var resource = resources[0];
            if (resource) {
                var data = void 0;
                if (prevResourceData && _this.parent.activeViewOptions.group.byGroupID) {
                    var id = prevResourceData[prevResource.idField];
                    data = new DataManager(resource.dataSource).executeLocal(new Query().where(resource.groupIDField, 'equal', id));
                }
                else {
                    data = resource.dataSource;
                }
                for (var i = 0; i < data.length; i++) {
                    var groupOrder = [];
                    if (prevOrder && prevOrder.length > 0) {
                        groupOrder = groupOrder.concat(prevOrder);
                    }
                    groupOrder.push(data[i][resource.idField]);
                    var items = group(resources.slice(1), index + 1, resource, data[i], groupOrder);
                    // Here validate child item empty top level resource only
                    if (index === 0 && items.length === 0 && _this.resourceCollection.length > 1) {
                        continue;
                    }
                    var dateCol = [];
                    var renderDates = _this.parent.activeView.renderDates;
                    var resWorkDays = void 0;
                    if (!_this.parent.activeViewOptions.group.byDate && index + 1 === _this.resourceCollection.length) {
                        var workDays = data[i][resource.workDaysField];
                        var resStartHour = data[i][resource.startHourField];
                        var resEndHour = data[i][resource.endHourField];
                        if (workDays && workDays.length > 0) {
                            renderDates = _this.parent.activeView.getRenderDates(workDays);
                            resWorkDays = workDays;
                            dateCol = _this.parent.activeView.getDateSlots(renderDates, workDays);
                        }
                        else {
                            resWorkDays = _this.parent.activeViewOptions.workDays;
                            dateCol = innerDates;
                        }
                        var dateSlots = _this.generateCustomHours(dateCol, resStartHour, resEndHour, groupOrder);
                        lastColumnDates = lastColumnDates.concat(dateSlots);
                    }
                    var resCssClass = data[i][resource.cssClassField];
                    var slotData = {
                        type: 'resourceHeader', className: ['e-resource-cells'],
                        resourceLevelIndex: index, groupOrder: groupOrder,
                        resource: resource, resourceData: data[i],
                        colSpan: _this.parent.activeViewOptions.group.byDate ? 1 : dateCol.length,
                        renderDates: renderDates, workDays: resWorkDays, cssClass: resCssClass,
                        child: items
                    };
                    resTree.push(slotData);
                }
                if (!resTreeGroup[index]) {
                    resTreeGroup[index] = [];
                }
                resTreeGroup[index].push(resTree);
                return resTree;
            }
            return [];
        };
        this.resourceTreeLevel = group(resources, 0);
        return (isTimeLine) ? [] : this.generateHeaderLevels(resTreeGroup, lastColumnDates, innerDates);
    };
    ResourceBase.prototype.generateCustomHours = function (renderDates, startHour, endHour, groupOrder) {
        var dateSlots = extend([], renderDates, null, true);
        for (var _i = 0, dateSlots_1 = dateSlots; _i < dateSlots_1.length; _i++) {
            var dateSlot = dateSlots_1[_i];
            if (startHour) {
                dateSlot.startHour = this.parent.getStartEndTime(startHour);
            }
            if (endHour) {
                dateSlot.endHour = this.parent.getStartEndTime(endHour);
            }
            if (groupOrder) {
                dateSlot.groupOrder = groupOrder;
            }
        }
        return dateSlots;
    };
    ResourceBase.prototype.generateHeaderLevels = function (resTreeGroup, lastColumnDates, headerDates) {
        var headerLevels = [];
        for (var i = resTreeGroup.length - 1; i >= 0; i--) {
            var temp = 0;
            for (var _i = 0, _a = resTreeGroup[i]; _i < _a.length; _i++) {
                var currentLevelChilds = _a[_i];
                for (var _b = 0, currentLevelChilds_1 = currentLevelChilds; _b < currentLevelChilds_1.length; _b++) {
                    var currentLevelChild = currentLevelChilds_1[_b];
                    if (resTreeGroup[i + 1]) {
                        var nextLevelChilds = resTreeGroup[i + 1][temp];
                        var colSpan = 0;
                        for (var _c = 0, nextLevelChilds_1 = nextLevelChilds; _c < nextLevelChilds_1.length; _c++) {
                            var nextLevelChild = nextLevelChilds_1[_c];
                            if (!this.parent.activeViewOptions.group.byGroupID || (this.parent.activeViewOptions.group.byGroupID &&
                                nextLevelChild.resourceData[nextLevelChild.resource.groupIDField] ===
                                    currentLevelChild.resourceData[currentLevelChild.resource.idField])) {
                                colSpan += nextLevelChild.colSpan;
                            }
                        }
                        currentLevelChild.colSpan = colSpan;
                    }
                    currentLevelChild.groupIndex = temp;
                    temp++;
                    headerLevels[currentLevelChild.resourceLevelIndex] = headerLevels[currentLevelChild.resourceLevelIndex] || [];
                    headerLevels[currentLevelChild.resourceLevelIndex].push(currentLevelChild);
                }
            }
        }
        this.lastResourceLevel = headerLevels.slice(-1)[0] || [];
        if (!this.parent.activeViewOptions.group.byDate) {
            var index = 0;
            for (var _d = 0, _e = this.lastResourceLevel; _d < _e.length; _d++) {
                var lastLevelResource = _e[_d];
                for (var i = 0; i < lastLevelResource.colSpan; i++) {
                    lastColumnDates[index].groupIndex = lastLevelResource.groupIndex;
                    index++;
                }
            }
            headerLevels.push(lastColumnDates);
            return headerLevels;
        }
        var dateHeaderLevels = [];
        var levels = extend([], headerLevels, null, true);
        var dateColSpan = 0;
        for (var _f = 0, _g = levels[0]; _f < _g.length; _f++) {
            var firstRowTd = _g[_f];
            dateColSpan += firstRowTd.colSpan;
        }
        var datesColumn = [];
        for (var _h = 0, headerDates_1 = headerDates; _h < headerDates_1.length; _h++) {
            var headerDate = headerDates_1[_h];
            headerDate.colSpan = dateColSpan;
            datesColumn.push(headerDate);
            var resGroup = extend([], levels, null, true);
            for (var k = 0, length_2 = resGroup.length; k < length_2; k++) {
                if (k === resGroup.length - 1) {
                    for (var _j = 0, _k = resGroup[k]; _j < _k.length; _j++) {
                        var resTd = _k[_j];
                        resTd.date = headerDate.date;
                        resTd.workDays = headerDate.workDays;
                        resTd.startHour = this.parent.getStartEndTime(resTd.resourceData[resTd.resource.startHourField]) ||
                            headerDate.startHour;
                        resTd.endHour = this.parent.getStartEndTime(resTd.resourceData[resTd.resource.endHourField]) ||
                            headerDate.endHour;
                    }
                }
                if (!dateHeaderLevels[k]) {
                    dateHeaderLevels[k] = [];
                }
                dateHeaderLevels[k] = dateHeaderLevels[k].concat(resGroup[k]);
            }
        }
        dateHeaderLevels.unshift(datesColumn);
        return dateHeaderLevels;
    };
    ResourceBase.prototype.setResourceValues = function (eventObj, isCrud, groupIndex) {
        var _this = this;
        var setValues = function (index, field, value) {
            if (_this.resourceCollection[index].allowMultiple && (!isCrud || isCrud && _this.parent.activeViewOptions.group.allowGroupEdit)) {
                eventObj[field] = [value];
            }
            else {
                eventObj[field] = value;
            }
        };
        if (groupIndex === void 0) {
            groupIndex = this.parent.uiStateValues.isGroupAdaptive ? this.parent.uiStateValues.groupIndex :
                this.parent.activeCellsData.groupIndex;
        }
        if (this.parent.activeViewOptions.group.resources.length > 0 && !isNullOrUndefined(groupIndex)) {
            var groupOrder = this.lastResourceLevel[groupIndex].groupOrder;
            for (var index = 0; index < this.resourceCollection.length; index++) {
                setValues(index, this.resourceCollection[index].field, groupOrder[index]);
            }
        }
        else if (this.parent.resourceCollection.length > 0) {
            for (var index = 0; index < this.resourceCollection.length; index++) {
                var data = this.resourceCollection[index].dataSource[0];
                if (data) {
                    setValues(index, this.resourceCollection[index].field, data[this.resourceCollection[index].idField]);
                }
            }
        }
    };
    ResourceBase.prototype.getResourceColor = function (eventObj, groupOrder) {
        var colorFieldIndex = (!isNullOrUndefined(groupOrder) &&
            this.colorIndex > groupOrder.length - 1) ? groupOrder.length - 1 : this.colorIndex;
        var resource = this.resourceCollection[colorFieldIndex];
        if (isNullOrUndefined(groupOrder) && this.parent.activeViewOptions.group.allowGroupEdit && resource.allowMultiple) {
            return undefined;
        }
        var id = isNullOrUndefined(groupOrder) ? eventObj[resource.field] : groupOrder[colorFieldIndex];
        var data = this.filterData(resource.dataSource, resource.idField, 'equal', id);
        if (data.length > 0) {
            return data[0][resource.colorField];
        }
        return undefined;
    };
    ResourceBase.prototype.getCssClass = function (eventObj) {
        var resource = this.resourceCollection.slice(-1)[0];
        if (this.parent.activeViewOptions.group.allowGroupEdit && resource.allowMultiple) {
            return undefined;
        }
        var data = this.filterData(resource.dataSource, resource.idField, 'equal', eventObj[resource.field]);
        if (data.length > 0) {
            return data[0][resource.cssClassField];
        }
        return undefined;
    };
    ResourceBase.prototype.filterData = function (dataSource, field, operator, value) {
        return new DataManager(dataSource).executeLocal(new Query().where(field, operator, value));
    };
    ResourceBase.prototype.dataManagerFailure = function (e) {
        var _this = this;
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.trigger(events.actionFailure, { error: e }, function () { return _this.parent.hideSpinner(); });
    };
    ResourceBase.prototype.getResourceData = function (eventObj, index, groupEditIndex) {
        if (this.parent.activeViewOptions.group.allowGroupEdit) {
            var resourceObj = {};
            for (var _i = 0, groupEditIndex_1 = groupEditIndex; _i < groupEditIndex_1.length; _i++) {
                var groupIndex = groupEditIndex_1[_i];
                var resourceLevel = this.lastResourceLevel[groupIndex].groupOrder;
                for (var level = 0, length_3 = resourceLevel.length; level < length_3; level++) {
                    var fieldName = this.resourceCollection[level].field;
                    if (isNullOrUndefined(resourceObj[fieldName])) {
                        resourceObj[fieldName] = [];
                    }
                    resourceObj[fieldName].push(resourceLevel[level]);
                }
            }
            eventObj = extend(eventObj, resourceObj);
        }
        else {
            for (var level = 0, length_4 = this.resourceCollection.length; level < length_4; level++) {
                eventObj[this.resourceCollection[level].field] = this.lastResourceLevel[index].groupOrder[level];
            }
        }
    };
    ResourceBase.prototype.addResource = function (resources, name, index) {
        var resourceCollection = (resources instanceof Array) ? resources : [resources];
        var _loop_1 = function (resource) {
            if (resource.name === name) {
                resourceCollection.forEach(function (addObj, i) {
                    return new DataManager({ json: resource.dataSource }).insert(addObj, null, null, index + i);
                });
                return "break";
            }
        };
        for (var _i = 0, _a = this.parent.resourceCollection; _i < _a.length; _i++) {
            var resource = _a[_i];
            var state_1 = _loop_1(resource);
            if (state_1 === "break")
                break;
        }
        this.refreshLayout(true);
    };
    ResourceBase.prototype.removeResource = function (resourceId, name) {
        var resourceCollection = (resourceId instanceof Array) ? resourceId : [resourceId];
        var _loop_2 = function (resource) {
            if (resource.name === name) {
                resourceCollection.forEach(function (removeObj) {
                    return new DataManager({ json: resource.dataSource }).remove(resource.idField, removeObj);
                });
                return "break";
            }
        };
        for (var _i = 0, _a = this.parent.resourceCollection; _i < _a.length; _i++) {
            var resource = _a[_i];
            var state_2 = _loop_2(resource);
            if (state_2 === "break")
                break;
        }
        this.refreshLayout(true);
    };
    ResourceBase.prototype.destroy = function () {
        this.parent.off(events.documentClick, this.documentClick);
        if (this.treeViewObj) {
            this.treeViewObj.destroy();
            this.treeViewObj = null;
        }
        if (this.treePopup) {
            this.treePopup.destroy();
            this.treePopup = null;
            remove(this.parent.element.querySelector('.' + cls.RESOURCE_TREE_POPUP));
            remove(this.parent.element.querySelector('.' + cls.RESOURCE_TREE_POPUP_OVERLAY));
        }
        var resToolBarEle = this.parent.element.querySelector('.' + cls.RESOURCE_TOOLBAR_CONTAINER);
        if (resToolBarEle) {
            remove(resToolBarEle);
        }
    };
    return ResourceBase;
}());
export { ResourceBase };
