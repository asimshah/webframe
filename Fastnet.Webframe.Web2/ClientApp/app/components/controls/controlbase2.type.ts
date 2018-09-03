import { ControlValueAccessor } from "@angular/forms";
import { Input, ViewChild, ElementRef, OnInit, AfterViewInit, OnChanges, SimpleChanges } from "@angular/core";
import { ValidationResult, ControlState, PropertyValidatorAsync, Validator, ValidationContext, EnumValue } from './controls.types';

export function isNullorUndefined(value: any): boolean {
    return value === null || typeof value === "undefined";
}
export function isWhitespaceOrEmpty(value: string): boolean {
    let t = value.trim();
    return t.length == 0;
}
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
export class ControlBase2 implements ControlValueAccessor, AfterViewInit  {
    @ViewChild('focushere') focusableElement: ElementRef;
    @Input() label?: string;
    @Input() placeHolderText: string = "";
    @Input() disabled: boolean = false;
    @Input('focus') isFocused: boolean;
    protected innerValue?: any;
    protected onChangeCallback: (_: any) => void = noop;
    protected onTouchedCallback: () => void = noop;
    protected isTouched: boolean = false;
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
        if (!(typeof this.innerValue === "undefined" && v === null)) {
            if (v !== this.innerValue) {
                //console.log(`innervalue changing from ${JSON.stringify(this.innerValue)} to ${JSON.stringify(v)}`);
                this.innerValue = v;
                this.isTouched = true;
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
    setPrevalidator(validator: (ctx: ValidationContext, value: any) => Promise<ValidationResult>) {
        this.preValidator = validator;// new PropertyValidatorAsync(validator);
    }
    public focus() {
        if (this.focusableElement) {
            this.focusableElement.nativeElement.focus();
        } else {
            console.log(`no focusable element present`);
        }
    }
    public async validate(context: ValidationContext = ValidationContext.UserCall): Promise<ValidationResult> {
        return new Promise<ValidationResult>(async resolve => {
            let vr = await this.doValidation(context);
            this.afterValidationCallBack();
            resolve(vr);
        });
    }
    onBlur() {
        this.onTouchedCallback();
    }
    isInError() {
        return this.vr && this.vr.valid === false;
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
                this.vr = new ValidationResult();
                if (this.isTouched === true || context === ValidationContext.UserCall) {
                    try {
                        if (this.preValidator) {
                            this.vr = await this.preValidator(context, this.value);//.validator(cs);
                        }
                        if (this.vr.valid === true && this.validator) {
                            console.log(`calling validator`);
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
}

export class InputControlBase extends ControlBase2 implements OnChanges, AfterViewInit {
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
    setReadOnly() {
        if (this.focusableElement) {
            let el = this.focusableElement.nativeElement as HTMLInputElement;
            el.readOnly = this.disabled;
        }
    }
}
export class EnumControlBase<T> extends ControlBase2 {
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