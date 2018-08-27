import { Component, Input, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { ControlBase } from "./controls.component";
import { TextInputControl } from "./text-input.component";
import { ValidationResult, ControlState } from "./controls.types";


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