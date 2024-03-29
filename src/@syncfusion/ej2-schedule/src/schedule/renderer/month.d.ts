import { IRenderer, TdData, NotifyEventArgs, CellClickEventArgs } from '../base/interface';
import { Schedule } from '../base/schedule';
import { ViewBase } from './view-base';
/**
 * month view
 */
export declare class Month extends ViewBase implements IRenderer {
    dayNameFormat: string;
    viewClass: string;
    isInverseTableSelect: boolean;
    private monthDates;
    /**
     * Constructor for month view
     */
    constructor(parent: Schedule);
    addEventListener(): void;
    removeEventListener(): void;
    onDataReady(args: NotifyEventArgs): void;
    onCellClick(event: CellClickEventArgs): void;
    onContentScroll(e: Event): void;
    scrollLeftPanel(target: HTMLElement): void;
    getLeftPanelElement(): HTMLElement;
    onScrollUIUpdate(args: NotifyEventArgs): void;
    setContentHeight(content: HTMLElement, leftPanelElement: HTMLElement, height: number): void;
    generateColumnLevels(): TdData[][];
    getDateSlots(renderDates: Date[], workDays: number[]): TdData[];
    getDayNameFormat(): string;
    renderLayout(type: string): void;
    private wireCellEvents;
    renderHeader(): void;
    renderLeftIndent(tr: Element): void;
    renderContent(): void;
    private renderWeekNumberContent;
    renderAppointmentContainer(): void;
    renderDatesHeader(): Element;
    private createHeaderCell;
    getContentSlots(): TdData[][];
    updateClassList(data: TdData): void;
    private isOtherMonth;
    renderContentArea(): Element;
    getContentRows(): Element[];
    createContentTd(data: TdData, td: Element): Element;
    private renderDateHeaderElement;
    getMonthStart(currentDate: Date): Date;
    getMonthEnd(currentDate: Date): Date;
    getRenderDates(workDays?: number[]): Date[];
    getNextPreviousDate(type: string): Date;
    getEndDateFromStartDate(start: Date): Date;
    getDateRangeText(): string;
    getLabelText(view: string): string;
    private createWeekNumberElement;
    unwireEvents(): void;
    /**
     * Get module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the month.
     * @return {void}
     * @private
     */
    destroy(): void;
}
