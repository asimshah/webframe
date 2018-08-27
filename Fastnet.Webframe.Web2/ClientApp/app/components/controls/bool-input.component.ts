import { Component, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { TextInputControl } from "./text-input.component";

@Component({
    selector: 'bool-input',
    template: `<div class="bool-input" >
            <label>                
            <input class="focus-able" type="checkbox" [(ngModel)]="value" (blur)="onBlur()"/>
                <span>{{label}}</span>
            </label>
        </div>`,
    styleUrls: ['./controls.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BoolInputControl),
            multi: true
        }
    ]
})
export class BoolInputControl extends TextInputControl {
    constructor() {
        super();
    }
}