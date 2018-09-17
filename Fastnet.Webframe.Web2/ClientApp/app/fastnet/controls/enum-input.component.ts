import { Component, Input, forwardRef, ViewEncapsulation, AfterViewInit, OnInit } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
//import { TextInputControl } from "./text-input.component";
import { EnumValue } from "./controls.types";
import { ControlBase, InputControlBase, toEnumValues, EnumControlBase } from "./controlbase.type";

//@Component({
//    selector: 'enum-input',
//    template: `<div class="enum-border" >
//        <div class="enum-label">{{label}}</div>  
//            <div class="enum-group"   >
//                <div class="enum-item" *ngFor="let item of items">
//                    <label [ngClass]="{selected: isSelected(item)}" >
//                        <span></span><span></span>
//                        <input #rbx name="{{groupName}}" type="radio" (click)="onRadioClick(item)" [checked]="isSelected(item)" />
//                    <span >{{item.name}}</span></label>
//                </div>
//            </div>
//        </div>`,
//    styleUrls: ['./controls.component.scss'],
//    providers: [
//        {
//            provide: NG_VALUE_ACCESSOR,
//            useExisting: forwardRef(() => EnumInputControl),
//            multi: true
//        }
//    ],
//    encapsulation: ViewEncapsulation.None
//})
//export class EnumInputControl extends TextInputControl {
//    private static index: number = 0;
//    protected reference: number;
//    groupName: string = "";
//    @Input() items: EnumValue[] = [];
//    selectedValue: number | null = null;
//    constructor() {
//        super();
//        this.reference = EnumInputControl.index++;
//        this.groupName = `enum-group-${this.reference}`;
//        this.localChangeCallBack = (v) => { this.selectedValue = v };
//    }
//    onRadioClick(item: EnumValue) {
//        this.selectedValue = item.value;
//        this.writeValue(item.value);
//    }
//    isSelected(item: EnumValue): boolean {
//        if (item && this.selectedValue != null) {
//            return this.selectedValue === item.value;
//        }
//        return false;
//    }
//    get debug() { return JSON.stringify(this, null, 2); }
//}

//<input name="{{groupName}}" type="radio" (click)="onRadioClick(item)" [checked]="isSelected(item)" />



@Component({
    selector: 'enum-input',
    template: `
        <div class="enum-border"  [ngClass]="{'disabled' : disabled}" >
            <div class="enum-group" [ngStyle]="{'grid-template-columns': gridColumns()}"  >
                <div class="enum-item" *ngFor="let item of items" [ngClass]="{selected: isSelected(item)}" (click)="onClick(item)">
                    <span class="outer-circle"></span>
                    <span class="inner-circle"></span>
                    <span class="item-label" >{{item.name}}</span>
                </div>
            </div>
        </div>
        <div class="enum-label" [ngClass]="{'disabled' : disabled}">
            <span [innerHTML]="label"></span>
            <span *ngIf="traceReferences" class="trace-text">{{getReference()}}</span>
        </div>  
`,
    styleUrls: ['./enum-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EnumInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => EnumInputControl)
        }
    ]
})
export class EnumInputControl extends EnumControlBase<number> implements OnInit {
    private static index: number = 0;
    //protected reference: number;
    groupName: string = "";
    constructor() {
        super();
        this.setReference("enum");
    }
    ngOnInit() {
        //console.log(`ngOnInit`);
        if (this.enumType) {
            this.items = toEnumValues(this.enumType);
        }
        if (this.names && this.names.length === this.items.length) {
            for (let i = 0; i < this.items.length; ++i) {
                this.items[i].name = this.names[i];
            }
        }
    }

    onClick(item: EnumValue) {
        //console.log(`onClick() with ${item.value}`);
        this.selectedValue = item.value;
        this.writeValue(item.value);
    }
    isSelected(item: EnumValue): boolean {
        //console.log(`${this.selectedValue} versus ${item.value}`);
        if (item && this.selectedValue != null) {
            return this.selectedValue === item.value;
        }
        return false;
    }

    get debug() { return JSON.stringify(this, null, 2); }
}