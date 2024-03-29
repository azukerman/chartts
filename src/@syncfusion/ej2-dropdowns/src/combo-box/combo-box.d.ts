/// <reference path="../drop-down-list/drop-down-list-model.d.ts" />
import { EmitType, KeyboardEventArgs } from '@syncfusion/ej2-base';
import { DropDownList } from '../drop-down-list/drop-down-list';
import { FilteringEventArgs } from '../drop-down-base/drop-down-base';
import { ComboBoxModel } from '../combo-box/combo-box-model';
import { InputObject, FloatLabelType } from '@syncfusion/ej2-inputs';
import { Query } from '@syncfusion/ej2-data';
/**
 * The ComboBox component allows the user to type a value or choose an option from the list of predefined options.
 * ```html
 * <select id="list">
 *      <option value='1'>Badminton</option>
 *      <option value='2'>Basketball</option>
 *      <option value='3'>Cricket</option>
 *      <option value='4'>Football</option>
 *      <option value='5'>Tennis</option>
 * </select>
 * ```
 * ```typescript
 *   let games:ComboBox = new ComboBox();
 *   games.appendTo("#list");
 * ```
 */
export declare class ComboBox extends DropDownList {
    /**
     * Specifies whether suggest a first matched item in input when searching. No action happens when no matches found.
     * @default false
     */
    autofill: boolean;
    /**
     * Specifies whether the component allows user defined value which does not exist in data source.
     * @default true
     */
    allowCustom: boolean;
    /**
     * Allows additional HTML attributes such as title, name, etc., and
     * accepts n number of attributes in a key-value pair format.
     *
     * {% codeBlock src="combobox/html-attributes-api/index.ts" %}{% endcodeBlock %}
     *
     * {% codeBlock src="combobox/html-attributes-api/index.html" %}{% endcodeBlock %}
     * @default {}
     */
    htmlAttributes: {
        [key: string]: string;
    };
    /**
     * When allowFiltering is set to true, show the filter bar (search box) of the component.
     * The filter action retrieves matched items through the `filtering` event based on
     * the characters typed in the search TextBox.
     * If no match is found, the value of the `noRecordsTemplate` property will be displayed.
     *
     * {% codeBlock src="combobox/allow-filtering-api/index.ts" %}{% endcodeBlock %}
     *
     * {% codeBlock src="combobox/allow-filtering-api/index.html" %}{% endcodeBlock %}
     * @default false
     */
    allowFiltering: boolean;
    /**
     * Accepts the external `Query`
     * that execute along with [`data processing`](../../combo-box/data-binding).
     *
     * {% codeBlock src="combobox/query-api/index.ts" %}{% endcodeBlock %}
     *
     * {% codeBlock src="combobox/query-api/index.html" %}{% endcodeBlock %}
     * @default null
     */
    query: Query;
    /**
     * Gets or sets the index of the selected item in the component.
     *
     * {% codeBlock src="combobox/index-api/index.ts" %}{% endcodeBlock %}
     *
     * {% codeBlock src="combobox/index-api/index.html" %}{% endcodeBlock %}
     *
     * @default null
     * @blazorType int
     * @isBlazorNullableType true
     * @blazorDefaultValue
     */
    index: number;
    /**
     * Specifies whether to show or hide the clear button.
     * When the clear button is clicked, `value`, `text`, and `index` properties are reset to null.
     * @default true
     */
    showClearButton: boolean;
    /**
     * Triggers on set a
     * [`custom value`](../../combo-box/getting-started#custom-values) to this component.
     * @event
     * @blazorProperty 'CustomValueSpecifier'
     */
    customValueSpecifier: EmitType<CustomValueSpecifierEventArgs>;
    /**
     * Triggers on typing a character in the component.
     * > For more details about the filtering refer to [`Filtering`](../../combo-box/filtering) documentation.
     * @event
     * @blazorProperty 'Filtering'
     */
    filtering: EmitType<FilteringEventArgs>;
    /**
     * Not applicable to this component.
     * @default null
     * @private
     */
    valueTemplate: string;
    /**
     * Specifies whether to display the floating label above the input element.
     * Possible values are:
     * * Never: The label will never float in the input when the placeholder is available.
     * * Always: The floating label will always float above the input.
     * * Auto: The floating label will float above the input after focusing or entering a value in the input.
     *
     * {% codeBlock src="combobox/float-label-type-api/index.ts" %}{% endcodeBlock %}
     *
     * {% codeBlock src="combobox/float-label-type-api/index.html" %}{% endcodeBlock %}
     *
     * @default Syncfusion.EJ2.Inputs.FloatLabelType.Never
     * @aspType Syncfusion.EJ2.Inputs.FloatLabelType
     * @isEnumeration true
     * @blazorType Syncfusion.EJ2.Inputs.FloatLabelType
     */
    floatLabelType: FloatLabelType;
    /**
     * Not applicable to this component.
     * @default null
     * @private
     */
    filterBarPlaceholder: string;
    /**
     * *Constructor for creating the component
     */
    constructor(options?: ComboBoxModel, element?: string | HTMLElement);
    /**
     * Initialize the event handler
     * @private
     */
    protected preRender(): void;
    protected getLocaleName(): string;
    protected wireEvent(): void;
    private preventBlur;
    protected onBlur(e: MouseEvent): void;
    protected targetElement(): HTMLElement | HTMLInputElement;
    protected setOldText(text: string): void;
    protected setOldValue(value: string | number): void;
    private valueMuteChange;
    protected updateValues(): void;
    protected updateIconState(): void;
    protected getAriaAttributes(): {
        [key: string]: string;
    };
    protected searchLists(e: KeyboardEventArgs): void;
    protected getNgDirective(): string;
    protected setSearchBox(): InputObject;
    protected onActionComplete(ulElement: HTMLElement, list: {
        [key: string]: Object;
    }[], e?: Object, isUpdated?: boolean): void;
    protected getFocusElement(): Element;
    protected setValue(e?: KeyboardEventArgs): boolean;
    protected checkCustomValue(): void;
    /**
     * Shows the spinner loader.
     * @returns void.
     */
    showSpinner(): void;
    /**
     * Hides the spinner loader.
     * @returns void.
     */
    hideSpinner(): void;
    protected setAutoFill(activeElement: Element, isHover?: boolean): void;
    private isAndroidAutoFill;
    protected clear(e?: MouseEvent | KeyboardEventArgs, property?: ComboBoxModel): void;
    protected isSelectFocusItem(element: Element): boolean;
    private inlineSearch;
    protected incrementalSearch(e: KeyboardEventArgs): void;
    private setAutoFillSelection;
    protected getValueByText(text: string): string | number | boolean;
    protected unWireEvent(): void;
    protected setSelection(li: Element, e: MouseEvent | KeyboardEventArgs | TouchEvent): void;
    protected selectCurrentItem(e: KeyboardEventArgs): void;
    protected setHoverList(li: Element): void;
    private targetFocus;
    protected dropDownClick(e: MouseEvent): void;
    private customValue;
    private updateCustomValueCallback;
    /**
     * Dynamically change the value of properties.
     * @private
     */
    onPropertyChanged(newProp: ComboBoxModel, oldProp: ComboBoxModel): void;
    /**
     * To initialize the control rendering.
     * @private
     */
    render(): void;
    /**
     * Return the module name of this component.
     * @private
     */
    getModuleName(): string;
    /**
     * Hides the popup if it is in open state.
     * @returns void.
     */
    hidePopup(): void;
    /**
     * Sets the focus to the component for interaction.
     * @returns void.
     */
    focusIn(): void;
}
export interface CustomValueSpecifierEventArgs {
    /**
     * Gets the typed custom text to make a own text format and assign it to `item` argument.
     */
    text: string;
    /**
     * Sets the text custom format data for set a `value` and `text`.
     * @blazorType object
     */
    item: {
        [key: string]: string | Object;
    };
}
