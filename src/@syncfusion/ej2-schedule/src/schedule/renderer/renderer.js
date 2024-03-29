import { isNullOrUndefined, extend, addClass, removeClass } from '@syncfusion/ej2-base';
import { EventTooltip } from '../popups/event-tooltip';
import * as events from '../base/constant';
import * as cls from '../base/css-constant';
import { VirtualScroll } from '../actions/virtual-scroll';
/**
 * Schedule DOM rendering
 */
var Render = /** @class */ (function () {
    /**
     * Constructor for render
     */
    function Render(parent) {
        this.parent = parent;
    }
    Render.prototype.render = function (viewName, isDataRefresh) {
        if (isDataRefresh === void 0) { isDataRefresh = true; }
        this.initializeLayout(viewName);
        if (isDataRefresh) {
            this.refreshDataManager();
        }
    };
    Render.prototype.initializeLayout = function (viewName) {
        if (this.parent.activeView) {
            this.parent.resetLayoutTemplates();
            this.parent.resetEventTemplates();
            this.parent.activeView.removeEventListener();
            this.parent.activeView.destroy();
        }
        switch (viewName) {
            case 'Day':
                this.parent.activeView = this.parent.dayModule;
                break;
            case 'Week':
                this.parent.activeView = this.parent.weekModule;
                break;
            case 'WorkWeek':
                this.parent.activeView = this.parent.workWeekModule;
                break;
            case 'Month':
                this.parent.activeView = this.parent.monthModule;
                break;
            // case 'Year':
            //     this.parent.activeView = this.parent.yearModule;
            //     break;
            case 'Agenda':
                this.parent.activeView = this.parent.agendaModule;
                break;
            case 'MonthAgenda':
                this.parent.activeView = this.parent.monthAgendaModule;
                break;
            case 'TimelineDay':
                this.parent.activeView = this.parent.timelineViewsModule;
                this.parent.activeView.viewClass = 'e-timeline-day-view';
                break;
            case 'TimelineWorkWeek':
                this.parent.activeView = this.parent.timelineViewsModule;
                this.parent.activeView.viewClass = 'e-timeline-work-week-view';
                break;
            case 'TimelineWeek':
                this.parent.activeView = this.parent.timelineViewsModule;
                this.parent.activeView.viewClass = 'e-timeline-week-view';
                break;
            case 'TimelineMonth':
                this.parent.activeView = this.parent.timelineMonthModule;
                break;
            case 'TimelineYear':
                this.parent.activeView = this.parent.timelineYearModule;
                break;
        }
        if (isNullOrUndefined(this.parent.activeView)) {
            var firstView = this.parent.viewCollections[0].option;
            if (firstView) {
                this.parent.setProperties({ currentView: firstView }, true);
                if (this.parent.headerModule) {
                    this.parent.headerModule.updateActiveView();
                    this.parent.headerModule.setCalendarView();
                }
                return this.initializeLayout(firstView);
            }
            throw Error('Inject required modules');
        }
        this.updateLabelText(viewName);
        this.parent.activeView.addEventListener();
        this.parent.activeView.getRenderDates();
        this.parent.uiStateValues.isGroupAdaptive = this.parent.isAdaptive && this.parent.activeViewOptions.group.resources.length > 0 &&
            this.parent.activeViewOptions.group.enableCompactView;
        if (this.parent.virtualScrollModule) {
            this.parent.virtualScrollModule.destroy();
            this.parent.virtualScrollModule = null;
        }
        if (this.parent.currentView.indexOf('Timeline') !== -1 && this.parent.activeViewOptions.allowVirtualScrolling
            && this.parent.activeViewOptions.group.resources.length > 0 && !this.parent.uiStateValues.isGroupAdaptive) {
            this.parent.virtualScrollModule = new VirtualScroll(this.parent);
            this.parent.uiStateValues.top = 0;
        }
        if (this.parent.headerModule) {
            this.parent.headerModule.setDayOfWeek(this.parent.activeViewOptions.firstDayOfWeek);
            if (this.parent.activeViewOptions.readonly) {
                addClass([this.parent.element], cls.READ_ONLY);
            }
            else if (this.parent.element.classList.contains(cls.READ_ONLY)) {
                removeClass([this.parent.element], cls.READ_ONLY);
            }
            this.parent.headerModule.updateDateRange(this.parent.activeView.getDateRangeText());
            this.parent.headerModule.updateHeaderItems('remove');
        }
        this.parent.activeView.renderLayout(cls.CURRENT_PANEL_CLASS);
        if (this.parent.eventTooltip) {
            this.parent.eventTooltip.destroy();
            this.parent.eventTooltip = null;
        }
        if (this.parent.eventSettings.enableTooltip || (this.parent.activeViewOptions.group.resources.length > 0
            && this.parent.activeViewOptions.group.headerTooltipTemplate)) {
            this.parent.eventTooltip = new EventTooltip(this.parent);
        }
    };
    Render.prototype.updateLabelText = function (view) {
        var content = this.parent.activeView.getLabelText(view);
        this.parent.element.setAttribute('role', 'main');
        this.parent.element.setAttribute('aria-label', content);
    };
    Render.prototype.refreshDataManager = function () {
        var _this = this;
        var start = this.parent.activeView.startDate();
        var end = this.parent.activeView.endDate();
        var dataManager = this.parent.dataModule.getData(this.parent.dataModule.generateQuery(start, end));
        dataManager.then(function (e) { return _this.dataManagerSuccess(e); }).catch(function (e) { return _this.dataManagerFailure(e); });
    };
    Render.prototype.dataManagerSuccess = function (e) {
        var _this = this;
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.trigger(events.dataBinding, e, function (args) {
            var resultData = extend([], args.result, null, true);
            _this.parent.eventsData = resultData.filter(function (data) { return !data[_this.parent.eventFields.isBlock]; });
            _this.parent.blockData = resultData.filter(function (data) { return data[_this.parent.eventFields.isBlock]; });
            var processed = _this.parent.eventBase.processData(resultData);
            _this.parent.notify(events.dataReady, { processedData: processed });
            if (_this.parent.dragAndDropModule && _this.parent.dragAndDropModule.actionObj.action === 'drag') {
                _this.parent.dragAndDropModule.navigationWrapper();
            }
            _this.parent.renderCompleted();
            _this.parent.trigger(events.dataBound, null, function () { return _this.parent.hideSpinner(); });
        });
    };
    Render.prototype.dataManagerFailure = function (e) {
        var _this = this;
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.trigger(events.actionFailure, { error: e }, function () { return _this.parent.hideSpinner(); });
    };
    return Render;
}());
export { Render };
