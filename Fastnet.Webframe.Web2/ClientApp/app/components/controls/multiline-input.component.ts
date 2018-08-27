import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { forwardRef, Component, Input } from "@angular/core";
import { TextInputControl } from "./text-input.component";
//import { ControlBase } from "./controls.component";

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