
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Validator, ControlState, ValidationResult, ValidationContext } from '../controls/controls.types';
import { isNullorUndefined, isWhitespaceOrEmpty, isRequired } from '../controls/controlbase2.type';
import { InlineDialogComponent } from '../controls/inline-dialog.component';
import { TextInputControl2 } from '../controls/text-input-new.component';

@Component({
    selector: 'test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.scss']
})
export class TestComponent implements AfterViewInit {
    @ViewChild('ctldialog') testDialog: InlineDialogComponent;
    @ViewChild('ctllastname') lastNameInput: TextInputControl2;
    firstName: string;
    lastName: string;
    something: string;
    emailAddress: string;
    constructor() {
        console.log("constructor()");
    }
    ngAfterViewInit() {
        //this.lastNameInput.focus();
    }
    async onValidateAllClick() {
        let result = await this.testDialog.isValid();
        console.log(`testdialog isValid() returned ${result}`);
    }
    async validateFirstName(cs: ControlState): Promise<ValidationResult> {
        console.log('validateFirstName called');
        return new Promise<ValidationResult>(resolve => {
            let vr = new ValidationResult();
            if (isNullorUndefined(cs.value) || isWhitespaceOrEmpty(cs.value)) {
                vr.valid = false;
                vr.message = "a First Name is required";
            } else {
                let t = cs.value as string;
                if (t.length < 4) {
                    vr.valid = false;
                    vr.message = "a First Name minimum length is 4";
                }
            }
            resolve(vr);
        });
    }
    async validateLastName(cs: ControlState): Promise<ValidationResult> {
        console.log('validateLastName called');
        return new Promise<ValidationResult>(resolve => {
            let vr = new ValidationResult();
            if (isNullorUndefined(cs.value) || isWhitespaceOrEmpty(cs.value)) {
                vr.valid = false;
                vr.message = "a Last Name is required";
            } else {
                let t = cs.value as string;
                if (t.length < 8) {
                    vr.valid = false;
                    vr.message = "a Last Name minimum length is 8";
                }
            }
            if (cs.context === ValidationContext.LostFocus) {
                console.log("validateLastName: lostfocus - can call back end here");
            }
            resolve(vr);
        });
    }
    async validateEmailAddress(cs: ControlState): Promise<ValidationResult> {
        return new Promise<ValidationResult>(resolve => {
            let vr = new ValidationResult();
            resolve(vr);
        });
    }
}
