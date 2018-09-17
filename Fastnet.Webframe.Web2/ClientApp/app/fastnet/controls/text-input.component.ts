import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { forwardRef, Component, Input, OnInit } from "@angular/core";
//import { ControlBase } from "./controls.component";
import { ControlBase, InputControlBase } from "./controlbase.type";
import { ValidationContext } from "./controls.types";



@Component({
    selector: 'text-input',
    template: `<div class="text-input" [ngClass]="{'not-valid': isInError(), 'disabled' : disabled}" >
            <label >
                <span [innerHTML]="label"></span>
                <span *ngIf="traceReferences" class="trace-text">{{getReference()}}</span>
            <input #focushere type="text" [placeholder]=placeHolderText [(ngModel)]="value" (blur)="onBlur()" (input)="onInput()"  />
            </label>
            <div *ngIf="isInError()" class="validation-text">
                <span  class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls: ['./text-input.component.scss'],
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
export class TextInputControl extends InputControlBase {

    constructor() {
        super();
        this.setReference("text");
        //console.log(`${this.getReference()} is TextInputControl`);
    }


}

