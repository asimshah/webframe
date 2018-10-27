﻿import { Component, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { InputControlBase, ControlBase } from "./controlbase.type";

@Component({
    selector: 'bool-input',
    template: `<div class="bool-input" [ngClass]="{'disabled' : disabled}" >
            <label>                
            <input #focushere type="checkbox" [(ngModel)]="value" (blur)="onBlur()"/>
                <span [innerHTML]="label"></span>
                <span *ngIf="traceReferences" class="trace-text">{{getReference()}}</span>
            </label>
        </div>`,
    styleUrls: ['./bool-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BoolInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => BoolInputControl)
        }
    ]
})
export class BoolInputControl extends InputControlBase {
    constructor() {
        super();
        this.setReference("bool");
    }
}