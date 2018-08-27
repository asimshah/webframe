import { Component, Input, ViewEncapsulation, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { ControlBase } from "./controls.component";
import { TextInputControl } from "./text-input.component";

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