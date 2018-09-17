import { ControlValueAccessor } from "@angular/forms";
import { Input, ViewChild, ElementRef, OnInit, AfterViewInit, OnChanges, SimpleChanges } from "@angular/core";
import { ValidationResult, ValidationContext, EnumValue } from './controls.types';

/** a method that returns a Promise<ValidationResult>, used for custom control validations */
export type ValidationMethod = (ctx: ValidationContext, val: any) => Promise<ValidationResult>;


export function isNullorUndefinedorWhitespaceOrEmpty(value: any): boolean {
    return isNullorUndefined(value) || isWhitespaceOrEmpty(value);
}
/**
 * Tests that value is either null or defined
 * primarily used in validation methods
 * @param value value to test
 */
export function isNullorUndefined(value: any): boolean {
    return value === null || typeof value === "undefined";
}
/**
 * Tests if value is empty or all whitespace
 * primarily used in validation methods
 * @param value value to test
 */
export function isWhitespaceOrEmpty(value: string): boolean {
    let t = value.trim();
    return t.length == 0;
}
/**
 * Builds an array of EnumValue from an enum (for number enums only)
 * Used to generate EnumValue pairs for enum style controls
 * @param val
 */
export function toEnumValues(val: any): EnumValue[] {
    let list: EnumValue[] = [];
    const keys = Object.keys(val).filter(k => typeof val[k as any] === "number");
    const values = keys.map(k => val[k as any]);
    for (let i = 0; i < keys.length; ++i) {
        list.push({ name: keys[i], value: values[i] });
    }
    //console.log(`val is: ${JSON.stringify(list, null, 2)}`)
    return list;
}
const noop = () => { };

/**
 * base class for all custom html components used in fastnet forms
 * adds the following @Input() attributes:
 * [label] optional control label text - can be html
 * [placeholder] placeholder within html <input> element, default ""
 * [disabled] set to true or false, use this to detect and set custom control as disabled, default is false
 * [focus] if true, sets initial focus to this control, use only on one control within the dialog
 * */
export class ControlBase implements ControlValueAccessor, AfterViewInit  {
    private static counter = 0;
    private static _trace: boolean = false;
    private reference: string = "";
    @ViewChild('focushere') focusableElement: ElementRef;
    @Input() label?: string;
    @Input() placeHolderText: string = "";
    @Input() disabled: boolean = false;
    @Input('focus') isFocused: boolean;
    
    protected innerValue?: any;
    protected onChangeCallback: (_: any) => void = noop;
    protected onTouchedCallback: () => void = noop;
    protected _isTouched: boolean = false;
    protected get isTouched(): boolean {
        return   this._isTouched;
    }
    protected set isTouched(val: boolean) {
        //console.log(`${this.getReference()}: changing isTouched from ${this._isTouched} to ${val}`);
        this._isTouched = val;
    }
    protected localChangeCallBack: (_: any) => void = noop;
    protected afterValidationCallBack: () => void = noop;
    @Input() validator: (ctx: ValidationContext, value: any) => Promise<ValidationResult>;// Validator;
    private preValidator: (ctx: ValidationContext, value: any) => Promise<ValidationResult>;// Validator;
    vr: ValidationResult;

    constructor() {
        
    }
    ngAfterViewInit() {
        //console.log(`ngAfterViewInit()`);
        if (this.isFocused) {
            this.focus();
        }
    }
    get value(): any {
        return this.innerValue;
    }
    set value(v: any) {
        let iv_untouched = this.innerValue === "undefined" || this.innerValue === null;
        let v_untouched = v === "undefined" || v === null;
        if (iv_untouched === false && v_untouched === false) {
        //if (!(typeof this.innerValue === "undefined" && v === null)) {
            if (v !== this.innerValue) {
                //console.log(`innervalue changing from ${JSON.stringify(this.innerValue)} to ${JSON.stringify(v)}`);
                this.innerValue = v;
                //this.isTouched = true;
                this.onValueChanged();
            }
        }
    }
    writeValue(obj: any): void {
        this.value = obj;
    }
    registerOnChange(fn: any): void {
        this.onChangeCallback = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouchedCallback = () => {
            this.isTouched = true;
            fn();
        }
    }
    /**
     * sets an 'internal' validator for a custom control (e.g, see email input)
     * this validator, if set,  is called before any user provided validators.
     * user provided validators only execute if the prevalidor returns a valid condition
     * @param validator
     */
    setPrevalidator(validator: (ctx: ValidationContext, value: any) => Promise<ValidationResult>) {
        this.preValidator = validator;// new PropertyValidatorAsync(validator);
    }
    get traceReferences(): boolean {
        return ControlBase._trace;
    }
    /** set focus on the control
     *  the html for the control must have an element marked with #focushere */
    public focus() {
        if (this.focusableElement) {
            this.focusableElement.nativeElement.focus();
        } else {
            console.log(`no focusable element present`);
        }
    }
    /**
     * Validate this control.
     * (1) this method is called internally using ValidationContext.LostFocus
     * (2) it can be called directly using ValidationContext.UserCall (which is the default)
     * @param context default is ValidationContext.UserCall
     */
    public async validate(context: ValidationContext = ValidationContext.UserCall): Promise<ValidationResult> {
        return new Promise<ValidationResult>(async resolve => {
            let vr = await this.doValidation(context);
            this.afterValidationCallBack();
            resolve(vr);
        });
    }
    onBlur() {
        //console.log(`${this.getReference()}: onBlur() called`);
        //this.onTouchedCallback();
    }
    /** returns true or false based on whether the control is valid or not
     * use this method in custom control templates
     * */
    isInError() {
        return this.vr && this.vr.valid === false;
    }
    /** returns the (internal) reference string for this instance
     * Note that references must be set in the constructor of the derived custom control component */
    getReference(): string {
        return this.reference;
    }
    protected setReference(prefix: string) {
        this.reference = `${prefix}-${ControlBase.counter++}`;
    }
    private onValueChanged() {
        this.localChangeCallBack(this.innerValue);
        this.onChangeCallback(this.innerValue);
        setTimeout(async () => {
            await this.doValidation(ValidationContext.ValueChanged);
            this.afterValidationCallBack();
            //console.log(`1: ${JSON.stringify(this, null, 2)}`);
        }, 0);
    }
    private async doValidation(context: ValidationContext): Promise<ValidationResult> {
        //console.log(`doValidation with context = ${context}`);
        return new Promise<ValidationResult>(async resolve => {
            try {
                //console.log(`${this.getReference()}: starting validation: touched =  ${this.isTouched}, context = ${context}`);
                this.vr = new ValidationResult();
                if (this.isTouched === true || context !== ValidationContext.ValueChanged) {
                    try {
                        if (this.preValidator) {
                            this.vr = await this.preValidator(context, this.value);//.validator(cs);
                        }
                        if (this.vr.valid === true && this.validator) {
                            //console.log(`${this.getReference()}: calling validator using value = ${this.value}`);
                            this.vr = await this.validator(context, this.value);//.validator(cs);
                        }
                    } catch (e) {
                        console.log(`error = ${e}`);
                        this.vr.valid = false;
                        this.vr.message = e;
                    } finally {
                        resolve(this.vr);
                    }
                } else {
                    resolve(this.vr);
                }
            } catch (e) {
                console.log(`error = ${e}`);
            }
        });
    }
    public static enableTrace(tf: boolean) {
        ControlBase._trace = tf;
        console.log(`custom control trace enabled = ${ControlBase._trace}`);
    }
}
/** Use this as a base for any control based on the HTML <input> element
 * Note that (1) all input events are caught and used to set isTouched to true
 * and (2) lostfocus event will cause validation with ValidationContext.LostFocus
 */
export class InputControlBase extends ControlBase implements OnChanges, AfterViewInit {
    onBlur() {
        super.onBlur();
        this.validate(ValidationContext.LostFocus);
    }
    ngAfterViewInit() {
        this.setReadOnly();
    }
    ngOnChanges(changes: SimpleChanges) {
        this.setReadOnly();
    }
    onInput() {
        // why do we need this?
        //  because we need to differentiate between users entering something in an input element and
        //  the value being set in other ways. 
        this.isTouched = true;
    }
    setReadOnly() {
        if (this.focusableElement) {
            let el = this.focusableElement.nativeElement as HTMLInputElement;
            el.readOnly = this.disabled;
        }
    }
}
/**
 * Use this as a base for controls using radio buttons for enums
 * generic T is one of number or boolean - this is the value type of the enum
 * boolean allows the use of enum style layout for a boolean
 * adds the following @Input() attributes:
 * [columns]   number of columns in which to layout radio buttons, default 1
 * [enumType]  the typescript enum type to layout
 * [items]     internal use only (can this be removed as an @Input()?)
 * [names]     user friendly names to use for each enum value
 * */
export class EnumControlBase<T> extends ControlBase {
    /**
     * Number of columns in which to layout the radio buttons
     */
    @Input() columns: number = 1;
    @Input() enumType: any; // make sure this is the enum type
    @Input() items: EnumValue[] = [];
    @Input() names: string[];
    selectedValue: T | null;
    constructor() {
        super();
        this.localChangeCallBack = (v) => { this.selectedValue = v };
    }
    gridColumns(): string {

        return "auto ".repeat(this.columns);
    }
}