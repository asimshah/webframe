import { Component, Input, forwardRef, ViewEncapsulation } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { TextInputControl } from "./text-input.component";
import { EnumValue } from "./controls.types";

@Component({
    selector: 'enum-input',
    template: `<div class="enum-border" >
        <div class="enum-label">{{label}}</div>  
            <div class="enum-group"   >
                <div class="enum-item" *ngFor="let item of items">
                    <label [ngClass]="{selected: isSelected(item)}" >
                        <span></span><span></span>
                        <input #rbx name="{{groupName}}" type="radio" (click)="onRadioClick(item)" [checked]="isSelected(item)" />
                    <span >{{item.name}}</span></label>
                </div>
            </div>
        </div>`,
    styleUrls: ['./controls.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EnumInputControl),
            multi: true
        }
    ],
    encapsulation: ViewEncapsulation.None
})
export class EnumInputControl extends TextInputControl {
    private static index: number = 0;
    protected reference: number;
    groupName: string = "";
    @Input() items: EnumValue[] = [];
    selectedValue: number | null = null;
    constructor() {
        super();
        this.reference = EnumInputControl.index++;
        this.groupName = `enum-group-${this.reference}`;
        this.localChangeCallBack = (v) => { this.selectedValue = v };
    }
    onRadioClick(item: EnumValue) {
        this.selectedValue = item.value;
        this.writeValue(item.value);
    }
    isSelected(item: EnumValue): boolean {
        if (item && this.selectedValue != null) {
            return this.selectedValue === item.value;
        }
        return false;
    }
    get debug() { return JSON.stringify(this, null, 2); }
}