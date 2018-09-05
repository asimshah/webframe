
import { Component, OnInit, ViewChild } from '@angular/core';
import { PageService } from '../shared/page.service';
import { BaseComponent } from '../shared/base.component';
import { ModalDialogService } from '../modaldialog/modal-dialog.service';
//import { Dictionary } from '../types/dictionary.types';
//import { PropertyValidatorAsync, ValidationResult, ControlState, ValidationContext } from '../controls/controls.types';
import { MembershipService } from '../membership/membership.service';
import { Member } from '../shared/common.types';
import { Router/*, ActivatedRoute*/ } from '@angular/router';
import { AuthenticationService } from './authentication.service';
//import { ControlBase } from '../controls/controls.component';
//import { PopupMessageComponent } from '../controls/popup-message.component';
import { PopupDialogComponent } from '../controls/popup-dialog.component';
import { isNullorUndefined, isWhitespaceOrEmpty, ValidationMethod } from '../controls/controlbase2.type';
import { ValidationContext, ValidationResult } from '../controls/controls.types';
import { InlineDialogComponent } from '../controls/inline-dialog.component';

class registrationModel {
    member: Member;
    passwordConfirmation: string;
}
@Component({
    selector: 'webframe-register',
    templateUrl: './register.component.html',
    styleUrls: ['../../styles/webframe.forms.scss', './register.component.scss']
})
export class RegisterComponent extends BaseComponent  {
    public model: registrationModel;
    @ViewChild(PopupDialogComponent) popupDialog: PopupDialogComponent;
    @ViewChild(InlineDialogComponent) mainDialog: InlineDialogComponent;
    confirmPasswordValidator: ValidationMethod = (ctx: ValidationContext, val: any) => this.confirmPasswordValidatorAsync(ctx, val);
    emailAddressValidator: ValidationMethod = (ctx: ValidationContext, val: any) => this.membershipService.newEmailAddressValidatorAsync(ctx, val);
    constructor(pageService: PageService, dialogService: ModalDialogService, protected membershipService: MembershipService,
        protected authenticationService: AuthenticationService, protected router: Router) {
        super(pageService, dialogService);
        console.log("RegisterComponent: constructor");
        this.model = new registrationModel();
        this.model.member = this.getNewMember();
    }
    protected getNewMember(): Member {
        console.log(`returning dwh new member`);
        return new Member();
    }
    async onRegister() {
        let result = await this.mainDialog.isValid();
        if (result === true) {
            await this.registerMember();
        }
    }
    onPopupClose() {
        this.popupDialog.close();
    }
    onCancel() {
        this.router.navigate(['/home']);
    }
    private async registerMember() {
        let r = await this.authenticationService.register(this.model.member);
        if (r.success) {
            this.popupDialog.open(() => {
                console.log(`registration confirmation closed`);
                this.router.navigate(['/home']);
            });
        }
    }
    firstNameValidatorAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = new ValidationResult();
            if (isNullorUndefined(value) || isWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = `an first name is required`;
            }
            resolve(vr);
        });
    }
    lastNameValidatorAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = new ValidationResult();
            if (isNullorUndefined(value) || isWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = `an last name is required`;
            }
            resolve(vr);
        });
    }
    confirmPasswordValidatorAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        return new Promise<ValidationResult>(resolve => {
            let vr = new ValidationResult();
            if (!isNullorUndefined(value) && !isWhitespaceOrEmpty(value)) {
                let text: string = value;
                if (text !== this.model.member.password) {
                    vr.valid = false;
                    vr.message = "passwords do not match";
                }
            }
            resolve(vr);
        });
    }

}

