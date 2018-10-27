
import { Component, ContentChildren, QueryList, ViewEncapsulation, Input } from '@angular/core';

//import { Subscription } from 'rxjs/Subscription';
import { ControlBase } from './controlbase.type';
import { ValidationResult } from './controls.types';

export class DialogBase {
    @Input() columns: number = 1;
    @ContentChildren(ControlBase) controls: QueryList<ControlBase>;

    isValid(): Promise<boolean> {
        //console.log(`isValid(): controls now ${this.controls.length}`);
        return new Promise<boolean>(async resolve => {
            let vrList: ValidationResult[] = [];
            let index = 1;
            for (let control of this.controls.toArray()) {
                //console.log(`calling validator on control number ${index++}`);
                let vr = await control.validate();
                vrList.push(vr);
            }
            let anyFalse = vrList.some(x => x.valid === false);
            resolve(anyFalse === false);
        });
    }
}


@Component({
    selector: 'inline-dialog',
    templateUrl: './inline-dialog.component.html',
    styleUrls: ['./inline-dialog.component.scss']//,
    //encapsulation: ViewEncapsulation.None
})
export class InlineDialogComponent extends DialogBase  {

}


