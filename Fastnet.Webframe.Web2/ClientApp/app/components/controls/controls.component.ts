import {
    ElementRef, Renderer2, Component, forwardRef,
    Input, Output, EventEmitter, ViewChild, ViewChildren, QueryList,
    ViewEncapsulation, OnInit
} from '@angular/core';
import {
    NG_VALUE_ACCESSOR, NG_VALIDATORS,
    ControlValueAccessor
} from "@angular/forms";
import { Dictionary} from '../shared/dictionary.types';

const noop = () => { };

//interface IDictionary<T> {
//    [Key: string]: T;
//}
//export class Dictionary<T> {
//    private items: IDictionary<T> = {};
//    private count: number = 0;
//    public add(key: string, item: T) {
//        if (!this.containsKey(key)) {
//            this.count++;
//        }
//        this.items[key] = item;
//    }
//    public item(key: string): T {
//        return this.items[key];
//    }
//    public remove(key: string): T | null {
//        if (this.containsKey(key)) {
//            let val = this.items[key];
//            delete this.items[key];
//            this.count++;
//            return val;
//        }
//        return null;
//    }
//    public containsKey(key: string) {
//        return this.items.hasOwnProperty(key);
//    }
//    public keys(): string[] {
//        var keySet: string[] = [];

//        for (var prop in this.items) {
//            if (this.items.hasOwnProperty(prop)) {
//                keySet.push(prop);
//            }
//        }

//        return keySet;
//    }

//    public values(): T[] {
//        var values: T[] = [];

//        for (var prop in this.items) {
//            if (this.items.hasOwnProperty(prop)) {
//                values.push(this.items[prop]);
//            }
//        }

//        return values;
//    }
//}
export class ControlState {
    touched: boolean;
    value: any;
    validationResult: ValidationResult;
    constructor() {
        this.validationResult = new ValidationResult();
        this.validationResult.valid = true;
        this.validationResult.message = "";
    }
}
export class ValidationResult {
    valid: boolean;
    message: string;
    constructor() {
        this.valid = true;
        this.message = '';
    }
}

export type Validator = (v: ControlState) => Promise<ValidationResult>;
export class PropertyValidatorAsync {
    validationResult: ValidationResult;
    validator: Validator;
    constructor(validator: Validator) {
        this.validator = validator;
        this.validationResult = new ValidationResult();
    }
}

export class ControlBase implements ControlValueAccessor {
    private trace: boolean = false;
    private _disabled: boolean = false;
    protected innerValue: string = '';
    protected isTouched: boolean = false;
    protected vr: ValidationResult = { valid: true, message: '' };
    protected onTouchedCallback: () => void = noop;
    protected onChangeCallback: (_: any) => void = noop;
    protected localChangeCallBack: (_: any) => void = noop;
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
        this.onTouchedCallback = () => {
            this.isTouched = true;
            this.doValidation();
            fn();
        }
    }
    enableTrace(v: boolean) {
        this.trace = v;
    }
    private async doValidation() {
        //console.log("doValidation() called");
        let cs = new ControlState();
        cs.value = this.value;
        cs.touched = this.isTouched;
        if (cs.touched) {
            if (this.preValidator) {
                this.vr = await this.preValidator.validator(cs);
            }
            if (this.validator) {
                //console.log(`calling property validator with ${JSON.stringify(cs)}`);
                this.vr = await this.validator.validator(cs);
                //console.log(`${JSON.stringify(this.vr)}`);
            }
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
    private async validate(): Promise<ValidationResult> {
        if (this.validator) {
            let cs = new ControlState();
            cs.value = this.value;
            //console.log(`calling property validator using route 2 with ${JSON.stringify(cs)}`);
            return await this.validator.validator(cs);
            //console.log(`${JSON.stringify(this.vr)}`);
        }
        return new Promise<ValidationResult>((resolve) => resolve(new ValidationResult()));
    }
    /**
     * validate all the controls in the QueryList provided
     * @param controls - pass a list of controls obtained using ViewChildren
     */
    static async validateAll(controls: QueryList<ControlBase>): Promise<boolean> {
        let invalidCount = 0;
        controls.forEach(async c => {            
            c.vr = await c.validate();
            if (!c.vr.valid) {
                invalidCount++;
            }
            //console.log(`found ${JSON.stringify(c)}`);
        });
        return new Promise<boolean>((resolve) => resolve(invalidCount > 0));
    }
    
    private tracelog(t: string) {
        if (this.trace) {
            console.log(t);
        }
    }
}

@Component({
    selector: 'text-input',
    template: `<div class="text-input" [ngClass]="{'not-valid': isInvalid}" >
            <label>
                <span>{{label}}</span>
            <input type="text" [(ngModel)]="value" (blur)="onBlur()" (input)="onInput()"/>
            </label>
            <div class="validation-text">
                <span *ngIf="vr && vr.valid === false" class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls: ['./controls.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => TextInputControl)
        }
    ]
})
export class TextInputControl extends ControlBase {
    @Input() label: string = '';
    constructor() {
        super();
    }
    onBlur() {
        this.onTouchedCallback();
    }
    onInput() {
        this.onTouchedCallback();
    }
}

@Component({
    selector: 'email-input',
    template: `<div class="text-input" [ngClass]="{'not-valid': vr && vr.valid === false}" >
            <label>
                <span>{{label}}</span>
            <input type="email" [(ngModel)]="value" (blur)="onBlur()" (input)="onInput()"/>
            </label>
            <div class="validation-text">
                <span *ngIf="vr && vr.valid === false" class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls: ['./controls.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EmailInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => EmailInputControl)
        }
    ]
})
export class EmailInputControl extends TextInputControl {
    private defaultEmailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    @Input() label: string = '';
    constructor() {
        super();
        this.setPrevalidator((cs) => this.validateEmailAsync(cs));
    }
    private validateEmailAsync(cs: ControlState): Promise<ValidationResult>
    {
        return new Promise<ValidationResult>((resolve) => {
            let text: string = cs.value || "";
            if (text.length > 0) {
                if (!this.defaultEmailPattern.test(cs.value)) {
                    cs.validationResult.valid = false;
                    cs.validationResult.message = "This is not a valid email address";
                }
            }
            resolve(cs.validationResult);
        });
    }
}

@Component({
    selector: 'password-input',
    template: `<div class="password-input" [ngClass]="{'not-valid': vr.valid === false}" >
            <label>
                <span>{{label}}</span>
            <input type="password" [(ngModel)]="value" (blur)="onBlur()" (input)="onInput()"/>
            </label>
            <div class="validation-text">
                <span *ngIf="vr.valid === false" class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls: ['./controls.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PasswordInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => PasswordInputControl)
        }
    ]
})
export class PasswordInputControl extends TextInputControl {
    constructor() {
        super();
    }
}

@Component({
    selector: 'number-input',
    template: `<div class="number-input" [ngClass]="{'not-valid': vr.valid === false}" >
            <label>
                <span>{{label}}</span>
            <input type="number" [(ngModel)]=value [min]=minNumber [max]=maxNumber (blur)="onBlur()" (input)="onInput()"/>
            </label>
            <div class="validation-text">
                <span *ngIf="vr.valid === false" class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls: ['./controls.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NumberInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => NumberInputControl)
        }
    ]
})
export class NumberInputControl extends TextInputControl {
    @Input() minNumber: number;
    @Input() maxNumber: number;
    constructor() {
        super();        
        this.setPrevalidator((cs) => this.validateNumberAsync(cs));
    }
    private validateNumberAsync(cs: ControlState): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            cs = this.validateNumber(cs);
            resolve(cs.validationResult);
        });
    }
    private validateNumber(cs: ControlState): ControlState {
        let n: number = cs.value;
        if (n !== NaN) {
            if (this.minNumber && n < this.minNumber) {
                cs.validationResult.valid = false;
                cs.validationResult.message = "This number is too small";
            } else if (this.maxNumber && n > this.maxNumber) {
                cs.validationResult.valid = false;
                cs.validationResult.message = "This number is too large";
            }
        }
        return cs;
    }
}

@Component({
    selector: 'date-input',
    template: `<div class="date-input" [ngClass]="{'not-valid': vr.valid === false}" >
            <label>
                <span>{{label}}</span>
            <input type="date" [min]="standardDate(minDate)" [max]="standardDate(maxDate)" [ngModel]="value | date:'yyyy-MM-dd'" (blur)="onBlur()" (input)="onInput()" (ngModelChange)="value = $event"/>
            </label>
            <div class="validation-text">
                <span *ngIf="vr.valid === false" class="text-error">{{vr.message}}</span>
            </div>
            <div>{{debug}}</div>
        </div>`,
    styleUrls: ['./controls.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DateInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => DateInputControl)
        }
    ]
})
export class DateInputControl extends TextInputControl {
    @Input() minDate: Date;
    @Input() maxDate: Date;
    constructor() {
        super();
        this.enableTrace(true);
    }
    standardDate(d: Date): string {
        if (d) {
            let t = d.toISOString();
            return t.substr(0, t.indexOf('T'));
        }
        return "";
    }
    get debug() { return JSON.stringify(this.value, null, 2); }
}

@Component({
    selector: 'bool-input',
    template: `<div class="bool-input" >
            <label>                
            <input type="checkbox" [(ngModel)]="value" (blur)="onBlur()"/>
                <span>{{label}}</span>
            </label>
        </div>`,
    styleUrls: ['./controls.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BoolInputControl),
            multi: true
        }
    ]
})
export class BoolInputControl extends TextInputControl {
    constructor() {
        super();
    }
}

export class EnumValue {
    value: number;
    name: string;
}

@Component({
    selector: 'enum-input',
    template: `<div class="enum-border" >
        <div class="enum-label">{{label}}</div>  
            <div class="enum-group" >
                <div class="enum-item" *ngFor="let item of items">
                    <label [ngClass]="{selected: isSelected(item)}" >
                        <span></span><span></span>
                        <input #rbx name="{{groupName}}" type="radio" (click)="onRadioClick(item)" [checked]="isSelected(item)" />
                    <span >{{item.name}}</span></label>
                </div>
            </div>
        </div>`,
    styleUrls: ['./controls.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EnumInputControl),
            multi: true
        }
    ],
    encapsulation: ViewEncapsulation.None
})
export class EnumInputControl extends TextInputControl {
    private static index: number = 0;
    private reference: number;
    groupName: string = "";
    @Input() items: EnumValue[] = [];
    selectedValue: number | null = null;
    constructor() {
        super();
        this.reference = EnumInputControl.index++;
        this.groupName = `enum-group-${this.reference}`;
        this.localChangeCallBack = (v) => { this.selectedValue = v };
    }
    onRadioClick(item: EnumValue) {
        this.selectedValue = item.value;
        this.writeValue(item.value);
    }
    isSelected(item: EnumValue): boolean {
        if (this.selectedValue != null) {
            return this.selectedValue === item.value;
        }
        return false;
    }
    get debug() { return JSON.stringify(this, null, 2); }
}


export class ListItem {
    value: any;
    name: string;
}

@Component({
    selector: 'dropdown-input',
    template: `<div class="dropdown-input">
            <label>
                <span>{{label}}</span>
            </label>
            <select #sl1 [(ngModel)]="value" (ngModelChange)="modelChange($event)" >
                <option *ngFor="let item of items" label="{{item.name}}" [value]="item.value" [attr.selected]="item.value === selectedValue? '': null"  >
            </select>
        </div>`,
    styleUrls: ['./controls.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DropDownControl),
            multi: true
        }
    ],
})
export class DropDownControl extends TextInputControl {
    @Input() items: ListItem[] = [];
    @Input() label: string = '';
    selectedValue: number;
    constructor() {
        super();
        this.localChangeCallBack = (v) => {
            if (v !== null) {
                this.selectedValue = v;// this.items[i];
                //console.log(`found index = ${i}, item ${JSON.stringify(this.selectedValue)}`);
            } else {
                //console.log("localChangeCallBack() called with null");
            }
        };
    }
    modelChange(val: any) {
        this.value = +this.value;
        //console.log(`modelChange(): ${JSON.stringify(this.value)} (called with ${JSON.stringify(val)}`);
    }
    get debug() { return JSON.stringify(this, null, 2); }
}