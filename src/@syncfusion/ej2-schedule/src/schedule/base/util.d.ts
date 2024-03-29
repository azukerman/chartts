import { EventFieldsMapping } from '../base/interface';
/**
 * Schedule common utilities
 */
export declare const WEEK_LENGTH: number;
export declare const MS_PER_DAY: number;
export declare const MS_PER_MINUTE: number;
export declare function getElementHeightFromClass(container: Element, elementClass: string): number;
export declare function getTranslateY(element: HTMLElement | Element): number;
export declare function getWeekFirstDate(date1: Date, firstDayOfWeek: number): Date;
export declare function getWeekLastDate(date: Date, firstDayOfWeek: number): Date;
export declare function firstDateOfMonth(date: Date): Date;
export declare function lastDateOfMonth(dt: Date): Date;
export declare function getWeekNumber(dt: Date): number;
export declare function setTime(date: Date, time: number): Date;
export declare function resetTime(date: Date): Date;
export declare function getDateInMs(date: Date): number;
export declare function getDateCount(startDate: Date, endDate: Date): number;
export declare function addDays(date: Date, i: number): Date;
export declare function addMonths(date: Date, i: number): Date;
export declare function addYears(date: Date, i: number): Date;
export declare function getStartEndHours(date: Date, startHour: Date, endHour: Date): {
    [key: string]: Date;
};
export declare function getMaxDays(d: Date): number;
export declare function getDaysCount(startDate: number, endDate: number): number;
export declare function getDateFromString(date: string): Date;
/** @hidden */
export declare function getScrollBarWidth(): number;
export declare function findIndexInData(data: {
    [key: string]: Object;
}[], property: string, value: string): number;
export declare function getOuterHeight(element: HTMLElement): number;
export declare function removeChildren(element: HTMLElement | Element): void;
export declare function addLocalOffset(date: Date): Date;
export declare function addLocalOffsetToEvent(event: {
    [key: string]: Object;
}, eventFields: EventFieldsMapping): {
    [key: string]: Object;
};
