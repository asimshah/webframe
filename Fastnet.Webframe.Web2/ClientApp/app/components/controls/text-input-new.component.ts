import { Component, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { ControlBase2, InputControlBase } from "./controlbase2.type";
import { ValidationContext } from "./controls.types";

@Component({
    selector: 'text-input-new',
    template: `<div class="text-input-new" [ngClass]="{'not-valid': isInError(), 'disabled' : disabled}" >
            <label >
                <span [innerHTML]="label"></span>
            <input #focushere type="text" [placeholder]=placeHolderText [(ngModel)]="value" (blur)="onBlur()"  />
            </label>
            <div *ngIf="isInError()" class="validation-text">
                <span  class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls: ['./text-input-new.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextInputControl2),
            multi: true
        },
        {
            provide: ControlBase2, useExisting: forwardRef(() => TextInputControl2)
        }
    ]
})
export class TextInputControl2 extends InputControlBase {

    constructor() {
        super();

    }


}