import { Schedule } from '../base/schedule';
import { TdData } from '../base/interface';
/**
 * view base
 */
export declare namespace ViewHelper {
    const getDayName: Function;
    const getDate: Function;
    const getTime: Function;
    const getTimelineDate: Function;
}
export declare class ViewBase {
    element: HTMLElement;
    parent: Schedule;
    renderDates: Date[];
    colLevels: TdData[][];
    /**
     * Constructor
     */
    constructor(parent: Schedule);
    isTimelineView(): boolean;
    getContentRows(): Element[];
    createEventTable(trCount: number): Element;
    getEventRows(trCount: number): Element[];
    collapseRows(wrap: Element): void;
    createTableLayout(className?: string): Element;
    createColGroup(table: Element, lastRow: TdData[]): void;
    getScrollXIndent(content: HTMLElement): number;
    scrollTopPanel(target: HTMLElement): void;
    scrollHeaderLabels(target: HTMLElement): void;
    addAttributes(td: TdData, element: Element): void;
    getHeaderBarHeight(): number;
    renderPanel(type: string): void;
    setPanel(panel: HTMLElement): void;
    getPanel(): HTMLElement;
    getDatesHeaderElement(): HTMLElement;
    getDateSlots(renderDates: Date[], workDays: number[]): TdData[];
    generateColumnLevels(): TdData[][];
    getColumnLevels(): TdData[][];
    highlightCurrentTime(): void;
    startDate(): Date;
    endDate(): Date;
    getStartHour(): Date;
    getEndHour(): Date;
    isCurrentDate(date: Date): boolean;
    isCurrentMonth(date: Date): boolean;
    isWorkDay(date: Date, workDays?: number[]): boolean;
    isWorkHour(date: Date, startHour: Date, endHour: Date, workDays: number[]): boolean;
    getRenderDates(workDays?: number[]): Date[];
    getNextPreviousDate(type: string): Date;
    getLabelText(view: string): string;
    getDateRangeText(): string;
    formatDateRange(startDate: Date, endDate?: Date): string;
    getMobileDateElement(date: Date, className?: string): Element;
    setResourceHeaderContent(tdElement: Element, tdData: TdData, className?: string): void;
    renderResourceMobileLayout(): void;
    addAutoHeightClass(element: Element): void;
    private getColElements;
    setColWidth(content: HTMLElement): void;
    resetColWidth(): void;
    getContentAreaElement(): HTMLElement;
}
