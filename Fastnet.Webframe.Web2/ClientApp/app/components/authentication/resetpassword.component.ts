
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../shared/base.component';
import { PageService } from '../shared/page.service';
import { ModalDialogService } from '../modaldialog/modal-dialog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { Member } from '../shared/common.types';
import { Dictionary } from '../types/dictionary.types';
import { PropertyValidatorAsync, ControlState, ValidationResult } from '../controls/controls.types';
import { ControlBase } from '../controls/controls.component';

@Component({
    selector: 'webframe-resetpassword',
    templateUrl: './resetpassword.component.html',
    styleUrls: ['../../styles/webframe.forms.scss', './resetpassword.component.scss']
})
export class ResetPasswordComponent extends BaseComponent implements OnInit {
    public validators: Dictionary<PropertyValidatorAsync>;
    ready: boolean = false;
    memberQueryResult: boolean;
    member: Member;
    password: string;
    passwordConfirmation: string;
    constructor(pageService: PageService, dialogService: ModalDialogService, private router: Router,
        private route: ActivatedRoute, private authenticationService: AuthenticationService) {
        super(pageService, dialogService);
    }
    async ngOnInit() {
        console.log("ResetPasswordComponent: OnInit");
        this.route.params.subscribe(async params => {
            let userId = params['id'];
            let code = params['code'];
            console.log(`reset password with id ${userId} and code ${code}`);
            let r = await this.authenticationService.getMemberForPasswordChange(userId, code);
            if (r === null) {
                this.memberQueryResult = false;
            } else {
                this.memberQueryResult = true;
                this.member = r;
                this.setValidators();
            }            
            this.ready = true;
        });
    }
    async onOK() {
        let r = await this.validateAll();
        if (r === true) {
            this.member.password = this.password;
            await this.authenticationService.changePassword(this.member);
            //this.dialogService.showMessageBox("reset-message", () => {
            //    this.router.navigate(['login']);
            //});
            await this.dialogService.showMessageBox("reset-message");
            this.router.navigate(['login']);
        }
    }
    onCancel() {
        this.router.navigate(['home'])
    }
    private setValidators() {
        this.validators = new Dictionary<PropertyValidatorAsync>();
        this.validators.add("password", new PropertyValidatorAsync((cs) => this.passwordValidatorAsync(cs)));
        this.validators.add("passwordconfirmation", new PropertyValidatorAsync((cs) => this.confirmPasswordValidatorAsync(cs)));

    }
    confirmPasswordValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        return new Promise<ValidationResult>(resolve => {
            let vr = cs.validationResult;
            let text: string = cs.value || "";
            if (text !== this.password) {
                vr.valid = false;
                vr.message = "passwords do not match";
            }
            resolve(vr);
        });
    }
    async validateAll(): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            let badCount = await ControlBase.validateAll();
            resolve(badCount.length === 0);
        });
    }
}
