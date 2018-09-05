//import { TextInputControl } from "./text-input.component";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { Component, forwardRef } from "@angular/core";
import { ControlBase2, InputControlBase } from "./controlbase2.type";
//import { ControlBase } from "./controls.component";

//@Component({
//    selector: 'password-input',
//    template: `<div class="password-input" [ngClass]="{'not-valid': vr.valid === false}" >
//            <label>
//                <span>{{label}}</span>
//            <input #focusable type="password" [(ngModel)]="value" (blur)="onBlur()" (input)="onInput()"/>
//            </label>
//            <div class="validation-text">
//                <span *ngIf="vr.valid === false" class="text-error">{{vr.message}}</span>
//            </div>
//        </div>`,
//    styleUrls: ['./controls.component.scss'],
//    providers: [
//        {
//            provide: NG_VALUE_ACCESSOR,
//            useExisting: forwardRef(() => PasswordInputControl),
//            multi: true
//        },
//        {
//            provide: ControlBase, useExisting: forwardRef(() => PasswordInputControl)
//        }
//    ]
//})
//export class PasswordInputControl extends TextInputControl {
//    constructor() {
//        super();
//    }
//}

@Component({
    selector: 'password-input',
    template: `<div class="password-input" [ngClass]="{'not-valid': isInError(), 'disabled' : disabled}" >
            <label>
            <span [innerHTML]="label"></span>
            <span *ngIf="traceReferences" class="trace-text">{{getReference()}}</span>
            <input #focushere type="password" [placeholder]=placeHolderText [(ngModel)]="value" (blur)="onBlur()"/>
            </label>
            <div class="validation-text">
                <span *ngIf="isInError()" class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls: ['./password-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PasswordInputControl),
            multi: true
        },
        {
            provide: ControlBase2, useExisting: forwardRef(() => PasswordInputControl)
        }
    ]
})
export class PasswordInputControl extends InputControlBase {
    constructor() {
        super();
        this.setReference("password");
    }
}