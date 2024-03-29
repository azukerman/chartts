import { Predicate } from '@syncfusion/ej2-data';
import { EventClickArgs, TdData } from '../base/interface';
import { Schedule } from '../base/schedule';
/**
 * EventBase for appointment rendering
 */
export declare class EventBase {
    parent: Schedule;
    slots: Object[];
    cssClass: string;
    groupOrder: string[];
    private isDoubleTapped;
    /**
     * Constructor for EventBase
     */
    constructor(parent: Schedule);
    processData(events: {
        [key: string]: Object;
    }[], timeZonePropChanged?: boolean, oldTimezone?: string): Object[];
    getProcessedEvents(eventCollection?: Object[]): Object[];
    timezonePropertyChange(oldTimezone: string): void;
    /** @private */
    timezoneConvert(eventData: {
        [key: string]: Object;
    }): void;
    private processTimezoneChange;
    processTimezone(event: {
        [key: string]: Object;
    }, isReverse?: boolean): {
        [key: string]: Object;
    };
    filterBlockEvents(eventObj: {
        [key: string]: Object;
    }): Object[];
    filterEvents(startDate: Date, endDate: Date, appointments?: Object[], resourceTdData?: TdData): Object[];
    filterEventsByRange(eventCollection: Object[], startDate?: Date, endDate?: Date): Object[];
    filterEventsByResource(resourceTdData: TdData, appointments?: Object[]): Object[];
    sortByTime(appointments: Object[]): Object[];
    sortByDateTime(appointments: Object[]): Object[];
    getSmallestMissingNumber(array: Object[]): number;
    splitEventByDay(event: {
        [key: string]: Object;
    }): Object[];
    splitEvent(event: {
        [key: string]: Object;
    }, dateRender: Date[]): {
        [key: string]: Object;
    }[];
    private cloneEventObject;
    private dateInRange;
    getSelectedEventElements(target: Element): Element[];
    getSelectedEvents(): EventClickArgs;
    removeSelectedAppointmentClass(): void;
    addSelectedAppointments(cells: Element[]): void;
    getSelectedAppointments(): Element[];
    focusElement(): void;
    selectWorkCellByTime(eventsData: Object[]): Element;
    getGroupIndexFromEvent(eventData: {
        [key: string]: Object;
    }): number;
    isAllDayAppointment(event: {
        [key: string]: Object;
    }): boolean;
    addEventListener(): void;
    private appointmentBorderRemove;
    wireAppointmentEvents(element: HTMLElement, event?: {
        [key: string]: Object;
    }, isPreventCrud?: Boolean): void;
    private eventTouch;
    renderResizeHandler(element: HTMLElement, spanEvent: {
        [key: string]: Object;
    }, isReadOnly: boolean): void;
    private eventClick;
    private eventDoubleClick;
    getEventByGuid(guid: string): Object;
    getEventById(id: number | string): {
        [key: string]: Object;
    };
    generateGuid(): string;
    getEventIDType(): string;
    getEventMaxID(resourceId?: number): number | string;
    private activeEventData;
    generateOccurrence(event: {
        [key: string]: Object;
    }, viewDate?: Date, oldTimezone?: string, isMaxCount?: boolean): Object[];
    getRecurrenceEvent(eventData: {
        [key: string]: Object;
    }): {
        [key: string]: Object;
    };
    getParentEvent(eventObj: {
        [key: string]: Object;
    }, isParent?: boolean): {
        [key: string]: Object;
    };
    getEventCollections(parentObj: {
        [key: string]: Object;
    }, childObj?: {
        [key: string]: Object;
    }): {
        [key: string]: Object[];
    };
    getFollowingEvent(parentObj: {
        [key: string]: Object;
    }, isReverse?: boolean): {
        [key: string]: Object;
    };
    isFollowingEvent(parentObj: {
        [key: string]: Object;
    }, childObj: {
        [key: string]: Object;
    }): boolean;
    getOccurrenceEvent(eventObj: {
        [key: string]: Object;
    }, isGuid?: boolean, isFollowing?: boolean): Object[];
    getOccurrencesByID(id: number | string): Object[];
    getOccurrencesByRange(startTime: Date, endTime: Date): Object[];
    getDeletedOccurrences(recurrenceData: string | number | {
        [key: string]: Object;
    }): Object[];
    applyResourceColor(element: HTMLElement, data: {
        [key: string]: Object;
    }, type: string, index?: string[], alpha?: string): void;
    createBlockAppointmentElement(record: {
        [key: string]: Object;
    }, resIndex: number): HTMLElement;
    setWrapperAttributes(appointmentWrapper: HTMLElement, resIndex: number): void;
    getReadonlyAttribute(event: {
        [key: string]: Object;
    }): string;
    isBlockRange(eventData: Object | Object[]): boolean;
    getFilterEventsList(dataSource: Object[], query: Predicate): {
        [key: string]: Object;
    }[];
    getSeriesEvents(parentEvent: {
        [key: string]: Object;
    }, startTime?: string): {
        [key: string]: Object;
    }[];
    getEditedOccurrences(deleteFutureEditEventList: {
        [key: string]: Object;
    }[], startTime?: string): {
        [key: string]: Object;
    }[];
}
