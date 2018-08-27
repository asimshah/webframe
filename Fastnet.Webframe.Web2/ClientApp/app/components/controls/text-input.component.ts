﻿import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { forwardRef, Component, Input, OnInit } from "@angular/core";
import { ControlBase } from "./controls.component";
import { ControlBase2 } from "./controlbase2.type";
import { ValidationContext } from "./controls.types";

@Component({
    selector: 'text-input',
    template: `<div class="text-input" [ngClass]="{'not-valid': isInvalid}" >
            <label>
                <span >{{label}}</span>
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

    onBlur() {
        this.onTouchedCallback();
    }
    onInput() {
        this.onTouchedCallback();
    }

}

