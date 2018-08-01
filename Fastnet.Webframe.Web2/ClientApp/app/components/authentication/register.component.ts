
import { Component, OnInit } from '@angular/core';
import { PageService } from '../shared/page.service';
import { BaseComponent } from '../shared/base.component';
import { ModalDialogService } from '../modaldialog/modal-dialog.service';
import { Dictionary } from '../types/dictionary.types';
import { PropertyValidatorAsync, ValidationResult, ControlState, ControlBase } from '../controls/controls.component';
import { MembershipService } from '../membership/membership.service';
import { Member } from '../shared/common.types';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from './authentication.service';

class registrationModel {
    member: Member;
    passwordConfirmation: string;
}
@Component({
    selector: 'webframe-register',
    templateUrl: './register.component.html',
    styleUrls: ['../../styles/webframe.forms.scss', './register.component.scss']
})
export class RegisterComponent extends BaseComponent implements OnInit {
    public validators: Dictionary<PropertyValidatorAsync>;
    public model: registrationModel;
    constructor(pageService: PageService, dialogService: ModalDialogService, protected membershipService: MembershipService,
        protected authenticationService: AuthenticationService, protected router: Router//,
        /*protected route: ActivatedRoute*/) {
        super(pageService, dialogService);
        console.log("RegisterComponent: constructor");
        this.model = new registrationModel();
        this.model.member = this.getNewMember();
    }
    async ngOnInit() {
        console.log("RegisterComponent: OnInit");
        this.setValidators();
        //if (this.route.snapshot.url[0].path.toLowerCase() == 'activate') {
        //    this.route.params.subscribe(params => {
        //        let userId = params['id'];
        //        let code = params['code'];
        //    });

        //} else {
        //    this.setValidators();
        //}
    }
    protected setValidators() {
        this.validators = new Dictionary<PropertyValidatorAsync>();
        this.validators.add("emailAddress", new PropertyValidatorAsync((cs) => this.membershipService.newEmailAddressValidatorAsync(cs)));
        this.validators.add("password", new PropertyValidatorAsync((cs) => this.passwordValidatorAsync(cs)));
        this.validators.add("passwordconfirmation", new PropertyValidatorAsync((cs) => this.confirmPasswordValidatorAsync(cs)));
        this.validators.add("firstName", new PropertyValidatorAsync((cs) => this.firstNameValidatorAsync(cs)));
        this.validators.add("lastName", new PropertyValidatorAsync((cs) => this.lastNameValidatorAsync(cs)));
    }
    protected getNewMember(): Member {
        console.log(`returning dwh new member`);
        return new Member();
    }
    async onRegister() {
        let r = await this.validateAll();
        if (r === true) {
            await this.registerMember();
        }
    }
    onCancel() {
        this.router.navigate(['/home']);
    }
    onCloseRegistrationConfirmation() {
        this.dialogService.close("registration-confirmation");
        this.router.navigate(['/home']);
    }
    async validateAll(): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            let badCount = await ControlBase.validateAll();
            resolve(badCount.length === 0);
        });
    }
    private async registerMember() {
        let r = await this.authenticationService.register(this.model.member);
        if (r.success) {
            this.dialogService.open("registration-confirmation");
        }
    }
    firstNameValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = cs.validationResult;
            let text = cs.value || "";
            if (text.length === 0) {
                vr.valid = false;
                vr.message = `a First Name is required`;
            }
            console.log(`${JSON.stringify(cs)}`);
            resolve(cs.validationResult);
        });
    }
    lastNameValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = cs.validationResult;
            let text = cs.value || "";
            if (text.length === 0) {
                vr.valid = false;
                vr.message = `a Last Name is required`;
            }
            console.log(`${JSON.stringify(cs)}`);
            resolve(cs.validationResult);
        });
    }
    confirmPasswordValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        return new Promise<ValidationResult>(resolve => {
            let vr = cs.validationResult;
            let text: string = cs.value || "";
            if (text !== this.model.member.password) {
                vr.valid = false;
                vr.message = "passwords do not match";
            }
            resolve(vr);
        });
    }

}

