import { ControlValueAccessor } from "@angular/forms";
import { Input, ViewChild, ElementRef, OnInit, AfterViewInit } from "@angular/core";
import { ValidationResult, ControlState, PropertyValidatorAsync, Validator, ValidationContext } from './controls.types';

export function isNullorUndefined(value: any): boolean {
    return value === null || typeof value === "undefined";
}
export function isWhitespaceOrEmpty(value: string): boolean {
    let t = value.trim();
    return t.length == 0;
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
    @Input() validator: Validator;// PropertyValidatorAsync;
    private preValidator: Validator;// PropertyValidatorAsync;
    vr: ValidationResult;
    constructor() {
        //console.log(`ctor(): inner value: ${JSON.stringify(this.innerValue, null, 2)}`);
    }
    ngAfterViewInit() {
        console.log(`ngOnInit()`);
        if (this.isFocused) {
            this.focus();
        }
    }
    get value(): any {
        return this.innerValue;
    }
    set value(v: any) {
        if (!(typeof this.innerValue === "undefined" && v === null)) {
            //console.log(`inner value: ${JSON.stringify(this.innerValue, null, 2)}, v: ${JSON.stringify(v, null, 2)}`);
            if (v !== this.innerValue) {
                this.innerValue = v;
                this.isTouched = true;
                this.onValueChanged();
            } else {
                //console.log(`2: ${JSON.stringify(this, null, 2)}`);
            }
        }
    }
    writeValue(obj: any): void {
        this.value = obj;
    }
    registerOnChange(fn: any): void {
        //console.log(`registerOnChange() called`);
        this.onChangeCallback = fn;
    }
    registerOnTouched(fn: any): void {
        //console.log(`registerOnTouched() called`);
        this.onTouchedCallback = () => {
            this.isTouched = true;
            //this.vr = await this.doValidation();
            fn();
        }
    }
    setPrevalidator(validator: Validator) {
        this.preValidator = validator;// new PropertyValidatorAsync(validator);
    }
    public focus() {
        //console.log(`focusing ..${JSON.stringify(this.element)}`);
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
            console.log(`1: ${JSON.stringify(this, null, 2)}`);
        }, 0);
    }
    private async doValidation(context: ValidationContext): Promise<ValidationResult> {
        console.log(`doValidation with context = ${context}`);
        return new Promise<ValidationResult>(async resolve => {
            try {
                let cs = new ControlState();
                cs.context = context;
                cs.value = this.value;
                cs.touched = this.isTouched;
                cs.validationResult = new ValidationResult();
                if (cs.touched === true || context === ValidationContext.UserCall) {

                    try {
                        if (this.preValidator) {
                            cs.validationResult = await this.preValidator(cs);//.validator(cs);
                        }
                        if (cs.validationResult.valid === true && this.validator) {
                            console.log(`calling validator`);
                            cs.validationResult = await this.validator(cs);//.validator(cs);
                        }
                    } catch (e) {
                        console.log(`error = ${e}`);
                        cs.validationResult.valid = false;
                        cs.validationResult.message = e;
                    } finally {
                        this.vr = cs.validationResult;
                        resolve(cs.validationResult);
                    }
                } else {
                    this.vr = cs.validationResult;
                    resolve(cs.validationResult);
                }
            } catch (e) {
                console.log(`error = ${e}`);
            }
        });
    }
}

export class InputControlBase extends ControlBase2 {
    onBlur() {
        super.onBlur();
        this.validate(ValidationContext.LostFocus);
    }
}