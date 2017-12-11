import {
    ElementRef, Renderer2, Component, forwardRef,
    Input, Output, EventEmitter, ViewChild, ViewChildren, QueryList,
    ViewEncapsulation
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";

const noop = () => { };

export class ControlState {
    touched: boolean;
    value: any;
}
export class ValidationResult {
    valid: boolean;
    message: string;
    constructor() {
        this.valid = true;
        this.message = '';
    }
}

class ControlBase implements ControlValueAccessor  {
    protected innerValue: string = '';
    protected isTouched: boolean = false;
    protected vr: ValidationResult = { valid: true, message: '' };
    protected onTouchedCallback: () => void = noop;
    protected onChangeCallback: (_: any) => void = noop;
    @Output() validate: EventEmitter<ControlState> = new EventEmitter<ControlState>();
    get value(): any {
        return this.innerValue;
    }
    set value(v: any) {
        if (v !== this.innerValue) {
            this.innerValue = v;
            this.onChangeCallback(v);
            let cs = new ControlState();
            cs.value = v;
            cs.touched = this.isTouched;
            if (cs.touched) {
                this.validate.emit(cs);
            }
        }
    }
    @Input() get validationResult(): ValidationResult {
        return this.vr;
    }
    set validationResult(v: ValidationResult) {
        this.vr = v;
    }
    writeValue(val: any): void {
        this.value = val;
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
}

@Component({
    selector: 'text-input',
    template: `<div class="text-input" [ngClass]="{'not-valid': vr.valid === false}" >
            <label>
                <span>{{label}}</span>
            <input type="text" [(ngModel)]="value" (blur)="onBlur()" (input)="onInput()"/>
            </label>
            <div class="validation-text">
                <span *ngIf="vr.valid === false" class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls:['./controls.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextInputControl),
            multi: true
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
        }
    ]
})
export class PasswordInputControl extends TextInputControl {
    constructor() {
        super();
    }
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
    selected: boolean;
}

@Component({
    selector: 'enum-input',
    template: `<div  >
        <div class="enum-label">{{label}}</div>  
            <div class="enum-group" (click)="onGroupClick($event)">
                <div *ngFor="let item of items">
                    <label [ngClass]="{selected: item.selected}" >
                        <span></span><span></span>
                        <input #rbx name="{{groupName}}" type="radio" (click)="onRadioClick(item)" [checked]="item.selected" />
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
    //@Input() values: EnumValue[] = [];
    @Input() items: EnumValue[] = [];
    //names: string[] = ["alpha", "beta", "comma"];
    //selected: string = "beta";
    //@ViewChildren('rbx') boxes: QueryList<any>;
    constructor() {
        super();
        this.reference = EnumInputControl.index++;
        this.groupName = `enum-group-${this.reference}`;
    }
    //ngAfterViewInit() {
    //    this.boxes.forEach(box => console.log(box));
    //    //console.log(`found ${this.values.length} enum values`);
    //    //this.items.forEach(v => {
    //    //    this.items.push({ value: v.value, name: v.name, selected: false });
    //    //});
    //    console.log(`items: ${JSON.stringify(this.items)}`);
    //}
    onGroupClick(e: Event) {
        //e.preventDefault();

        console.log(`EnumInputControl: clicked`);
    }
    onRadioClick(item: EnumValue) {
        this.items.forEach(item => item.selected = false);
        item.selected = true;
        console.log(`onRadioClick: clicked - ${item.name}`);
    }
    get debug() { return JSON.stringify(this); }
}

