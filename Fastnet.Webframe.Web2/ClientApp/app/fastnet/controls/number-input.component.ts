import { Component, Input, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
//import { ControlBase } from "./controls.component";
//import { TextInputControl } from "./text-input.component";
import { ValidationResult, ValidationContext } from "./controls.types";
import { isNullorUndefined, InputControlBase, ControlBase } from "./controlbase.type";


@Component({
    selector: 'number-input',
    template: `<div class="number-input" [ngClass]="{'not-valid': isInError(), 'disabled' : disabled}" >
            <label>
            <span [innerHTML]="label"></span>
            <span *ngIf="traceReferences" class="trace-text">{{getReference()}}</span>
            <input #focushere type="number" [(ngModel)]=value [min]=minNumber [max]=maxNumber (blur)="onBlur()" />
            </label>
            <div *ngIf="isInError()" class="validation-text">
                <span  class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls: ['./number-input.component.scss'],
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
export class NumberInputControl extends InputControlBase {
    @Input() minNumber: number;
    @Input() maxNumber: number;
    constructor() {
        super();
        this.setReference("number");
        this.setPrevalidator((ctx, val) => this.validateNumberAsync(ctx, val));
    }
    private validateNumberAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = new ValidationResult();
            if (!isNullorUndefined(value) && value !== NaN) {
                let n: number = value;
                if (this.minNumber && n < this.minNumber) {
                    vr.valid = false;
                    vr.message = "This number is too small";
                } else if (this.maxNumber && n > this.maxNumber) {
                    vr.valid = false;
                    vr.message = "This number is too large";
                }
            }
            resolve(vr);
        });
    }
    //private validateNumber(cs: ControlState): ControlState {
    //    let n: number = cs.value;
        
    //    if (n !== NaN) {
    //        if (this.minNumber && n < this.minNumber) {
    //            cs.validationResult.valid = false;
    //            cs.validationResult.message = "This number is too small";
    //        } else if (this.maxNumber && n > this.maxNumber) {
    //            cs.validationResult.valid = false;
    //            cs.validationResult.message = "This number is too large";
    //        }
    //    }
    //    return cs;
    //}
}