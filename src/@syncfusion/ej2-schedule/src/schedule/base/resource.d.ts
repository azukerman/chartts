import { Schedule } from '../base/schedule';
import { TdData } from '../base/interface';
import { ResourcesModel } from '../models/resources-model';
export declare class ResourceBase {
    private parent;
    resourceCollection: ResourcesModel[];
    lastResourceLevel: TdData[];
    renderedResources: TdData[];
    expandedResources: TdData[];
    private colorIndex;
    private resourceTreeLevel;
    private treeViewObj;
    private treePopup;
    private popupOverlay;
    private leftPixel;
    constructor(parent: Schedule);
    renderResourceHeaderIndent(tr: Element): void;
    hideResourceRows(tBody: Element): void;
    createResourceColumn(): Element;
    setExpandedResources(): void;
    getContentRows(resData: TdData[]): Element[];
    private setMargin;
    private countCalculation;
    onTreeIconClick(e: Event): void;
    updateContent(index: number, hide: boolean): void;
    updateVirtualContent(index: number, expand: boolean): void;
    renderResourceHeader(): void;
    renderResourceTree(): void;
    private generateTreeData;
    private renderResourceHeaderText;
    private menuClick;
    private resourceClick;
    private documentClick;
    bindResourcesData(isSetModel: boolean): void;
    private dataManagerSuccess;
    private getResourceModel;
    private refreshLayout;
    setResourceCollection(): void;
    generateResourceLevels(innerDates: TdData[], isTimeLine?: boolean): TdData[][];
    generateCustomHours(renderDates: TdData[], startHour: string, endHour: string, groupOrder?: string[]): TdData[];
    private generateHeaderLevels;
    setResourceValues(eventObj: {
        [key: string]: Object;
    }, isCrud: boolean, groupIndex?: number): void;
    getResourceColor(eventObj: {
        [key: string]: Object;
    }, groupOrder?: string[]): string;
    getCssClass(eventObj: {
        [key: string]: Object;
    }): string;
    private filterData;
    private dataManagerFailure;
    getResourceData(eventObj: {
        [key: string]: Object;
    }, index: number, groupEditIndex: number[]): void;
    addResource(resources: Object | Object[], name: string, index: number): void;
    removeResource(resourceId: string | string[] | number | number[], name: string): void;
    destroy(): void;
}
