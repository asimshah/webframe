import {
    ElementRef, Renderer2, Component, forwardRef,
    Input, Output, EventEmitter, ViewChild, ViewChildren, QueryList,
    ViewEncapsulation, OnInit, AfterViewInit
} from '@angular/core';
import {
    NG_VALUE_ACCESSOR, NG_VALIDATORS,
    ControlValueAccessor
} from "@angular/forms";
import { Dictionary } from '../types/dictionary.types';
//import { Dictionary} from '../shared/dictionary.types';


const noop = () => { };

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

export class ControlBase implements ControlValueAccessor, AfterViewInit {
    private static allControls: Dictionary<ControlBase> = new Dictionary<ControlBase>();
    private trace: boolean = false;
    private _disabled: boolean = false;
    protected innerValue: string = '';
    protected isTouched: boolean = false;
    //@Input() focus: any | undefined;
    @Input() name: string;
    @ViewChild('focusable') focusableElement: ElementRef; // set this on the html element that should receive focus
    public vr: ValidationResult = { valid: true, message: '' };
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
    constructor() {

    }
    ngAfterViewInit(): void {
        if (ControlBase.allControls.containsKey(this.name)) {
            //alert(`a control named ${this.name} already exists`);
            ControlBase.allControls.remove(this.name);
        }
        ControlBase.allControls.add(this.name, this);
        //console.log(`name is ${this.name}`);

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

    private validate(): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            if (this.validator) {
                let cs = new ControlState();
                cs.value = this.value;
                this.validator.validator(cs).then((r) => {
                    this.vr = r;
                    console.log(`${JSON.stringify(this.vr)}`);
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
            console.log(`control with name ${name} not found`)
        }

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
            <input #focusable type="text" [placeholder]=placeHolderText [(ngModel)]="value" (blur)="onBlur()" (input)="onInput()"/>
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
    
    @Input() placeHolderText: string = '';
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
    selector: 'multiline-input',
    template: `<div class="multiline-input" [ngClass]="{'not-valid': vr && vr.valid === false}" >
            <label>  
                <span>{{label}}</span>
            <textarea #focusable type="text" [(ngModel)]="value" [rows]=rows  (blur)="onBlur()"></textarea>
            </label>
            <div class="validation-text">
                <span *ngIf="vr && vr.valid === false" class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls: ['./controls.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultilineTextInput),
            multi: true
        }
    ]
})
export class MultilineTextInput extends TextInputControl {
    @Input() rows: number;
    constructor() {
        super();
    }
}

@Component({
    selector: 'email-input',
    template: `<div class="text-input" [ngClass]="{'not-valid': vr && vr.valid === false}" >
            <label>
                <span>{{label}}</span>
            <input #focusable type="email" [(ngModel)]="value" (blur)="onBlur()" (input)="onInput()"/>
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
    //@ViewChild('focusable') focusableElement: ElementRef;
    constructor() {
        super();
        this.setPrevalidator((cs) => this.validateEmailAsync(cs));
    }
    //focus() {
    //    //console.log(`focusing ..${JSON.stringify(this.element)}`);
    //    this.element.nativeElement.focus();
    //}
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
            <input #focusable type="password" [(ngModel)]="value" (blur)="onBlur()" (input)="onInput()"/>
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
    selector: 'search-input',
    template: `<div class="search-input" [ngClass]="{'not-valid': isInvalid}" >               
            <label>
                <span>{{label}}</span>
            <input #focusable type="text" [placeholder]=placeHolderText [(ngModel)]="value" (blur)="onBlur()" (ngModelChange)="onTextChanged($event)" (input)="onInput()" (keyup)="onKeyUp($event)"/>
            
            </label>
                <button class="clear-button" [ngClass]="{'not-visible': value?.length === 0}" (click)="clearSearchText()">
                    <span class="fa fa-remove"></span>
                </button>
                <button class="search-button"(click)="onSearchClick($event)">
                    <span class="fa fa-search"></span>
                </button>
            <div class="validation-text">
                <span *ngIf="vr && vr.valid === false" class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls: ['./search-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SearchInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => SearchInputControl)
        }
    ]
})
export class SearchInputControl extends TextInputControl {
    @Output() searchClick = new EventEmitter();
    @Output() clearClick = new EventEmitter();
    constructor() {
        super();
    }
    clearSearchText() {
        this.writeValue("");
        this.onTextChanged(null);
    }
    onSearchClick(event: any) {
        //console.log("SearchInputControl: onSearchClick()");
        this.searchClick.emit(event);
    }
    onKeyUp(event: any) {
        //console.log(JSON.stringify(event));
        if (event.keyCode === 13) {
            this.searchClick.emit(event);
        }
    }
    onTextChanged(event: any) {
        //console.log(`SearchInputControl: ${this.value}`);
        if (this.value == "") {
            this.clearClick.emit();
        }
    }
}
@Component({
    selector: 'number-input',
    template: `<div class="number-input" [ngClass]="{'not-valid': vr.valid === false}" >
            <label>
                <span>{{label}}</span>
            <input class="focus-able" type="number" [(ngModel)]=value [min]=minNumber [max]=maxNumber (blur)="onBlur()" (input)="onInput()"/>
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
            <input #focusable type="date" [min]="standardDate(minDate)" [max]="standardDate(maxDate)" [ngModel]="value | date:'yyyy-MM-dd'" (blur)="onBlur()" (input)="onInput()" (ngModelChange)="value = $event"/>
            </label>
            <div class="validation-text">
                <span *ngIf="vr.valid === false" class="text-error">{{vr.message}}</span>
            </div>
           
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
    ],
    encapsulation: ViewEncapsulation.None
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
    //focus() {
    //    //console.log(`focusing ..${JSON.stringify(this.element)}`);
    //    this.element.nativeElement.focus();
    //}
    get debug() { return JSON.stringify(this.value, null, 2); }
}

@Component({
    selector: 'bool-input',
    template: `<div class="bool-input" >
            <label>                
            <input class="focus-able" type="checkbox" [(ngModel)]="value" (blur)="onBlur()"/>
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
            <div class="enum-group"   >
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
    protected reference: number;
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
        if (item && this.selectedValue != null) {
            return this.selectedValue === item.value;
        }
        return false;
    }
    get debug() { return JSON.stringify(this, null, 2); }
}

@Component({
    selector: 'bool-enum-input',
    template: `<div class="enum-border" >
        <div class="enum-label">{{label}}</div>  
            <div class="enum-group"    >
                <div class="enum-item" >
                    <label [ngClass]="{selected: value}" >
                        <span></span><span></span>
                        <input #rbx name="{{groupName}}" type="radio" (click)="onTrue()" [checked]="this.value" />
                    <span >{{trueLabel}}</span></label>
                </div>
                <div class="enum-item">
                    <label [ngClass]="{selected: !value}" >
                        <span></span><span></span>
                        <input #rbx name="{{groupName}}" type="radio" (click)="onFalse()" [checked]="!this.value" />
                    <span >{{falseLabel}}</span></label>
                </div>
            </div>
        </div>`,
    styleUrls: ['./controls.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BoolEnumInputControl),
            multi: true
        }
    ],
    encapsulation: ViewEncapsulation.None
})
export class BoolEnumInputControl extends EnumInputControl {
    @Input() trueLabel: string = "True";
    @Input() falseLabel: string = "False";
    @Input() items: EnumValue[] = [];
    constructor() {
        super();
    }
    onTrue() {
        this.writeValue(true);
    }
    onFalse() {
        this.writeValue(false);
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
            <label *ngIf="label">
                <span>{{label}}</span>
            </label>
            <select class="focus-able" #sl1 [ngModel]="value" (ngModelChange)="modelChange($event)" >
                <option *ngFor="let item of items" label="{{item.name}}" [value]="item.value" [attr.selected]="item.value === selectedValue ? '': null"  >
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
    @Input() label: string;// = '';
    //@Output() change = new EventEmitter();
    selectedValue: any;// number;
    constructor() {
        super();
        this.localChangeCallBack = (v) => {
            if (v !== null) {
                this.selectedValue = v;// this.items[i];
                //console.log(`ddc ${JSON.stringify(this.selectedValue)}`);
            } else {
                //console.log("localChangeCallBack() called with null");
            }
        };
    }
    modelChange(val: any) {
        this.value = val;// +this.value;
        console.log(`modelChange(): ${JSON.stringify(this.value)} (called with ${JSON.stringify(val)})`);
    }
    selectChange(e: Event) {
        //this.change.emit(e);
    }
    get debug() { return JSON.stringify(this, null, 2); }
}