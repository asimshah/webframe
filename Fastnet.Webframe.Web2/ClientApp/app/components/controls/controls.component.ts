import {
    ElementRef, Renderer2, Component, forwardRef,
    Input, Output, EventEmitter, ViewChild, ViewChildren, QueryList,
    ViewEncapsulation, OnInit, AfterViewInit, OnDestroy
} from '@angular/core';
import {
    NG_VALUE_ACCESSOR, NG_VALIDATORS,
    ControlValueAccessor
} from "@angular/forms";
import { Dictionary } from '../types/dictionary.types';
import { ValidationResult, PropertyValidatorAsync, ControlState, Validator } from './controls.types';

const noop = () => { };

export class ControlBase implements ControlValueAccessor, AfterViewInit, OnDestroy {

    protected static allControls: Dictionary<ControlBase> = new Dictionary<ControlBase>();
    private trace: boolean = false;
    private _disabled: boolean = false;
    protected innerValue: string = '';
    protected isTouched: boolean = false;
    @Input() name: string;
    @ViewChild('focusable') focusableElement: ElementRef; // set this on the html element that should receive focus
    public vr: ValidationResult = { valid: true, message: '' };
    protected onTouchedCallback: () => void = noop;
    protected onChangeCallback: (_: any) => void = noop;
    protected localChangeCallBack: (_: any) => void = noop;
    protected afterValidationCallBack: () => void = noop;
    @Input() validator: PropertyValidatorAsync;
    protected preValidator: PropertyValidatorAsync;
    get value(): any {
        return this.innerValue;
    }
    set value(v: any) {
        //console.log(`v = ${JSON.stringify(v)}, innervalue = ${JSON.stringify(this.innerValue)}`);
        if (v !== this.innerValue) {
            this.innerValue = v;
            //this.tracelog(`set value call: innerValue = ${JSON.stringify(this.innerValue)}`);
            this.localChangeCallBack(v);
            this.onChangeCallback(v);
            this.doValidation();
            this.afterValidationCallBack();
        }
    }
    constructor() {
        //console.log(`ControlBase: constructor`);
    }
    ngOnDestroy(): void {
        //console.log(`ControlBase: ngOnDestroy(): name is ${this.name}`);
        //console.trace();
        ControlBase.allControls.remove(this.name);
    }
    ngAfterViewInit(): void {
        if (ControlBase.allControls.containsKey(this.name)) {
            throw new Error(`a control named ${this.name} already exists`);
            //alert(`a control named ${this.name} already exists - controls must have a unique name`);
            //ControlBase.allControls.remove(this.name);
        }
        ControlBase.allControls.add(this.name, this);
        //console.log(`ControlBase: name is ${this.name}, count is ${ControlBase.allControls.count}`);
    }
    focus() {
        //console.log(`focusing ..${JSON.stringify(this.element)}`);
        if (this.focusableElement) {
            this.focusableElement.nativeElement.focus();
        } else {
            console.log(`no focusable element present`);
        }
    }
    @Input() get disabled(): boolean {
        return this._disabled;
    }
    set disabled(v: boolean) {
        this._disabled = v;
    }
    writeValue(val: any): void {
        //console.log(`writeValue() with ${JSON.stringify(val)}`);
        this.value = val;
    }
    registerOnChange(fn: any): void {
        this.onChangeCallback = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouchedCallback = async () => {
            this.isTouched = true;
            await this.doValidation();
            fn();
        }
    }
    enableTrace(v: boolean) {
        this.trace = v;
    }
    private async doValidation() {
        //console.log("doValidation() 1");
        let cs = new ControlState();
        cs.value = this.value;
        cs.touched = this.isTouched;
        if (cs.touched) {
            setTimeout(async () => {
                try {
                    if (this.preValidator) {
                        this.vr = await this.preValidator.validator(cs);
                    }
                    if (this.validator) {
                        //console.log(`calling property validator with ${JSON.stringify(cs)}`);
                        this.vr = await this.validator.validator(cs);
                        //console.log(`${JSON.stringify(this.vr)}`);
                    }
                } catch (e) {
                    //console.log(`Exception in doValidation()`);
                    throw e;
                }
            }, 0);
        }
    }
    /**
     * Add a validator that validates before calling any template assigned validator
     * (this is primarily of value when developing new controls)
     * @param validator - ensure validator is a lambda such as  (cs) => this.validateSomethingAsync(cs)
     */
    setPrevalidator(validator: Validator) {
        this.preValidator = new PropertyValidatorAsync(validator);
    }
    get isInvalid(): boolean {
        if (this.vr) {
            //console.log(`vr is ${JSON.stringify(this.vr)}`);
            return !this.vr.valid;
        }
        //console.log(`vr not found`);
        return false;
    }

    public validate(): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            if (this.validator) {
                let cs = new ControlState();
                cs.value = this.value;
                this.validator.validator(cs).then((r) => {
                    this.vr = r;
                    //console.log(`${JSON.stringify(this.vr)}`);
                    resolve(r);
                });
            } else {
                resolve(new ValidationResult());
            }
        });
    }
    private reset() {
        this.vr = new ValidationResult();
    }
    static async areAllValid(): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            let badCount = await ControlBase.validateAll();
            resolve(badCount.length === 0);
        });
    }
    /**
     * returns a count of invalid controls 
     */
    static async validateAll(): Promise<ControlBase[]> {
        let arr = ControlBase.allControls.values();
        //console.log(`control count is ${arr.length}`);
        let invalidCount = 0;
        let i = 0;
        let invalidControls: ControlBase[] = [];
        let promises: Promise<ValidationResult>[] = [];
        for (let c of arr) {
            await c.validate();
            if (!c.vr.valid) {
                invalidControls.push(c);
                invalidCount++;
            }
        }
        //console.log(`all promises complete`);
        return invalidControls;
    }
    /**
     * resets all controls
     */
    static resetAll() {
        let arr = ControlBase.allControls.values();
        for (let c of arr) {
            c.reset();
        }
    }
    static focus(name: string) {
        if (ControlBase.allControls.containsKey(name)) {
            let c = ControlBase.allControls.item(name);
            c.focus();
        } else {
            throw `control with name ${name} not found`;
        }

    }
    static async isValid(name: string): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            if (ControlBase.allControls.containsKey(name)) {
                let c = ControlBase.allControls.item(name);
                let vr = await c.validate();
                resolve(vr.valid);
            } else {
                throw `No control with name ${name} found`;
            }

        });
    }
    private tracelog(t: string) {
        if (this.trace) {
            console.log(t);
        }
    }
}

