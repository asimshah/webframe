import { Component, forwardRef, Input, Output, EventEmitter } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { TextInputControl } from "./text-input.component";
import { ListItem } from "./controls.types";

@Component({
    selector: 'dropdown-input',
    template: `<div class="dropdown-input">
            <label *ngIf="label">
                <span>{{label}}</span>
            </label>
            <select class="focus-able" #sl1 [ngModel]="value" (ngModelChange)="modelChange($event)" >
                <option *ngFor="let item of items" label="{{item.name}}" [value]="item.value" [attr.selected]="item.value === selectedValue ? '': null"  >
            </select>
        </div>`,
    styleUrls: ['./controls.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DropDownControl),
            multi: true
        }
    ],
})
export class DropDownControl extends TextInputControl {
    @Input() items: ListItem[] = [];
    @Input() label: string;// = '';
    @Output() change = new EventEmitter<string>();
    selectedValue: any;// number;
    constructor() {
        super();
        this.localChangeCallBack = (v) => {
            if (v !== null) {
                this.selectedValue = v;// this.items[i];
                //console.log(`ddc ${JSON.stringify(this.selectedValue)}`);
            } else {
                //console.log("localChangeCallBack() called with null");
            }
        };
    }
    modelChange(val: any) {
        this.value = val;// +this.value;
        console.log(`modelChange(): ${JSON.stringify(this.value)} (called with ${JSON.stringify(val)})`);
        this.change.emit(this.value);
    }
    selectChange(e: Event) {
        //this.change.emit(e);
    }
    get debug() { return JSON.stringify(this, null, 2); }
}