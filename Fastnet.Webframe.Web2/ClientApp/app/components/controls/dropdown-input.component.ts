import { Component, forwardRef, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
//import { TextInputControl } from "./text-input.component";
import { ListItem } from "./controls.types";
import { InputControlBase } from "./controlbase2.type";

//@Component({
//    selector: 'dropdown-input',
//    template: `<div class="dropdown-input">
//            <label *ngIf="label">
//                <span>{{label}}</span>
//            </label>
//            <select class="focus-able" #sl1 [ngModel]="value" (ngModelChange)="modelChange($event)" >
//                <option *ngFor="let item of items" label="{{item.name}}" [value]="item.value" [attr.selected]="item.value === selectedValue ? '': null"  >
//            </select>
//        </div>`,
//    styleUrls: ['./controls.component.scss'],
//    providers: [
//        {
//            provide: NG_VALUE_ACCESSOR,
//            useExisting: forwardRef(() => DropDownControl),
//            multi: true
//        }
//    ],
//})
//export class DropDownControl extends TextInputControl {
//    @Input() items: ListItem[] = [];
//    @Input() label: string;// = '';
//    @Output() change = new EventEmitter<string>();
//    selectedValue: any;// number;
//    constructor() {
//        super();
//        this.localChangeCallBack = (v) => {
//            if (v !== null) {
//                this.selectedValue = v;// this.items[i];
//                //console.log(`ddc ${JSON.stringify(this.selectedValue)}`);
//            } else {
//                //console.log("localChangeCallBack() called with null");
//            }
//        };
//    }
//    modelChange(val: any) {
//        this.value = val;// +this.value;
//        console.log(`modelChange(): ${JSON.stringify(this.value)} (called with ${JSON.stringify(val)})`);
//        this.change.emit(this.value);
//    }
//    selectChange(e: Event) {
//        //this.change.emit(e);
//    }
//    get debug() { return JSON.stringify(this, null, 2); }
//}

@Component({
    selector: 'dropdown-input',
    template: `<div class="dropdown-input"  [ngClass]="{'disabled' : disabled}">
            <label *ngIf="label">
                <span [innerHTML]="label"></span>
            </label>
            <div class="dropdown-border">
                <select #focushere [ngModel]="value" (ngModelChange)="modelChange($event)" [size]="getSize()" (focus)="onSelectFocus()" (blur)="onSelectBlur()"  >
                    <option *ngFor="let item of items" label="{{item.name}}" [ngValue]="item" [attr.selected]="item.value === selectedValue ? '': null"  >
                </select>
            </div>
        </div>`,
    styleUrls: ['./dropdown-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DropDownControl),
            multi: true
        }
    ],
})
export class DropDownControl extends InputControlBase {
    @Input() items: ListItem<any>[] = [];
    @Output() selectionChanged = new EventEmitter<ListItem<any>>();
    @Input() showItemCount: number = 1;
    @Input() keepOpen: boolean = false;
    private inFocus: boolean = false;
    constructor() {
        super();
    }
    onSelectFocus() {
        this.inFocus = true;
    }
    onSelectBlur() {
        this.inFocus = false;
    }
    modelChange(val: ListItem<any>) {
        console.log("model change");
        this.value = val;// +this.value;
        this.selectionChanged.emit(this.value);
        this.focusableElement.nativeElement.blur();
        //this.inFocus = false;
        //this.changeDetector.detectChanges();
    }
    getSize() {
        if (this.keepOpen) {
            return this.showItemCount;
        } else {
            if (this.inFocus) {
                return this.showItemCount;
            } else {
                return 1;
            }
        }
    }
    //selectChange(e: Event) {
    //    //this.change.emit(e);
    //}
    private findListItem(val: any): ListItem<any> {
        return this.items.find(x => x.value === val)!;
    }
    get debug() { return JSON.stringify(this, null, 2); }
}