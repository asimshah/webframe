import { Component, forwardRef, Output, EventEmitter } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { ControlBase } from "./controls.component";
import { TextInputControl } from "./text-input.component";

@Component({
    selector: 'search-input',
    template: `<div class="search-input" >               
            <label>
                <span>{{label}}</span>
            <input #focusable type="text" [placeholder]=placeHolderText [(ngModel)]="value" (blur)="onBlur()" (ngModelChange)="onTextChanged($event)" (keyup)="onKeyUp($event)"/>
            
            </label>
                <button class="clear-button" [ngClass]="{'not-visible': value?.length === 0}" (click)="clearSearchText()">
                    <span class="fa fa-remove"></span>
                </button>
                <button class="search-button"(click)="onSearchClick($event)">
                    <span class="fa fa-search"></span>
                </button>
            <div class="validation-text">
                <span *ngIf="vr && vr.valid === false" class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls: ['./search-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SearchInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => SearchInputControl)
        }
    ]
})
export class SearchInputControl extends TextInputControl {
    @Output() searchClick = new EventEmitter();
    @Output() clearClick = new EventEmitter();
    constructor() {
        super();
    }
    clearSearchText() {
        this.writeValue("");
        this.onTextChanged(null);
    }
    onSearchClick(event: any) {
        //console.log("SearchInputControl: onSearchClick()");
        this.searchClick.emit(event);
    }
    onKeyUp(event: any) {
        //console.log(JSON.stringify(event));
        if (event.keyCode === 13) {
            this.searchClick.emit(event);
        }
    }
    onTextChanged(event: any) {
        //console.log(`SearchInputControl: ${this.value}`);
        if (this.value == "") {
            this.clearClick.emit();
        }
    }
}