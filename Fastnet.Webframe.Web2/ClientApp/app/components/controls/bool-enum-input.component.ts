import { Component, Input, ViewEncapsulation, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { EnumInputControl } from "./enum-input.component";
import { EnumValue } from "./controls.types";

@Component({
    selector: 'bool-enum-input',
    template: `<div class="enum-border" >
        <div class="enum-label">{{label}}</div>  
            <div class="enum-group"    >
                <div class="enum-item" >
                    <label [ngClass]="{selected: value}" >
                        <span></span><span></span>
                        <input #rbx name="{{groupName}}" type="radio" (click)="onTrue()" [checked]="this.value" />
                    <span >{{trueLabel}}</span></label>
                </div>
                <div class="enum-item">
                    <label [ngClass]="{selected: !value}" >
                        <span></span><span></span>
                        <input #rbx name="{{groupName}}" type="radio" (click)="onFalse()" [checked]="!this.value" />
                    <span >{{falseLabel}}</span></label>
                </div>
            </div>
        </div>`,
    styleUrls: ['./controls.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BoolEnumInputControl),
            multi: true
        }
    ],
    encapsulation: ViewEncapsulation.None
})
export class BoolEnumInputControl extends EnumInputControl {
    @Input() trueLabel: string = "True";
    @Input() falseLabel: string = "False";
    @Input() items: EnumValue[] = [];
    constructor() {
        super();
    }
    onTrue() {
        this.writeValue(true);
    }
    onFalse() {
        this.writeValue(false);
    }
    get debug() { return JSON.stringify(this, null, 2); }
}