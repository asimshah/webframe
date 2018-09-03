
//import { Component, forwardRef } from '@angular/core';
//import { InputControlBase, isNullorUndefined, isWhitespaceOrEmpty, ControlBase2 } from './controlbase2.type';
//import { ValidationResult, ValidationContext } from './controls.types';
//import { NG_VALUE_ACCESSOR } from '@angular/forms';

//@Component({
//    selector: 'email-input-new',
//    template: `<div class="email-input-new" [ngClass]="{'not-valid': isInError(), 'disabled' : disabled}" >
//            <label>
//                <span [innerHTML]="label"></span>
//            <input #focushere type="email" [(ngModel)]="value" (blur)="onBlur()"/>
//            </label>
//            <div *ngIf="isInError()" class="validation-text">
//                <span  class="text-error">{{vr.message}}</span>
//            </div>
//        </div>`,
//    styleUrls: ['./email-input-new.component.scss'],
//    providers: [
//        {
//            provide: NG_VALUE_ACCESSOR,
//            useExisting: forwardRef(() => EmailInputControl2),
//            multi: true
//        },
//        {
//            provide: ControlBase2, useExisting: forwardRef(() => EmailInputControl2)
//        }
//    ]
//})
//export class EmailInputControl2 extends InputControlBase {
//    private defaultEmailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//    constructor() {
//        super();
//        this.setPrevalidator((ctx, val) => this.validateEmail(ctx, val));
//    }
//    private validateEmail(context: ValidationContext, value: any): Promise<ValidationResult> {
//        return new Promise<ValidationResult>((resolve) => {
//            let vr = new ValidationResult();
//            if (!isNullorUndefined(value) && !isWhitespaceOrEmpty(value)) {
//                let text = value as string;
//                if (text.length > 0) {
//                    if (!this.defaultEmailPattern.test(text)) {
//                        vr.valid = false;
//                        vr.message = "This is not a valid email address";
//                    }
//                }
//            }
//            resolve(vr);
//        });
//    }
//}
