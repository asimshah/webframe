
import { Component, ContentChildren, QueryList, AfterContentInit, OnDestroy, ViewEncapsulation } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { ControlBase2 } from './controlbase2.type';
import { ValidationResult } from './controls.types';


@Component({
    selector: 'inline-dialog',
    templateUrl: './inline-dialog.component.html',
    styleUrls: ['./inline-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class InlineDialogComponent implements AfterContentInit, OnDestroy  {
    @ContentChildren(ControlBase2) controls: QueryList<ControlBase2>;
    controlSubscription: Subscription;
    constructor() {
    }
    ngAfterContentInit(): void {
        console.log(`controls now ${this.controls.length}`);
        this.controlSubscription = this.controls.changes.subscribe(n => {
            console.log(`subscription received ${JSON.stringify(n, null, 2)}`);
        });
    }

    ngOnDestroy(): void {
        if (this.controlSubscription) {
            this.controlSubscription.unsubscribe();
        }
    }
    isValid(): Promise<boolean> {
        console.log(`isValid(): controls now ${this.controls.length}`);
        return new Promise<boolean>(async resolve => {
            let vrList: ValidationResult[] = [];
            let index = 1;
            for (let control of this.controls.toArray()) {
                console.log(`calling validator on control number ${index++}`);
                let vr = await control.validate();
                vrList.push(vr);
            }
            let anyFalse = vrList.some(x => x.valid === false);
            resolve(anyFalse === false);
        });
    }
}


