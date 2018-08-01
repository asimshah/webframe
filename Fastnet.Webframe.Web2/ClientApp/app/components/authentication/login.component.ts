import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { EmailValidator, FormControl } from '@angular/forms';

import { AuthenticationService, Credentials, LoginResult } from './authentication.service';
import { ModalDialogService } from '../../components/modaldialog/modal-dialog.service';
import { PageKeys, PageService } from '../shared/page.service';
import { ControlState, PasswordInputControl, PropertyValidatorAsync, ValidationResult, ControlBase } from '../controls/controls.component';
import { Dictionary } from '../types/dictionary.types';
//import { MessageBox } from '../shared/common.types';
import { BaseComponent, nothingOnClose } from '../shared/base.component';

class LoginModel {
    message: string;
}

@Component({
    selector: 'webframe-login',
    templateUrl: './login.component.html',
    styleUrls: ['../../styles/webframe.forms.scss', './login.component.scss']
})
export class LoginComponent extends BaseComponent implements OnInit {
    private nameSpace = "webframe-";
    public bannerPageId: number | null;
    public model: Credentials;
    private usernameKey: string;
    public validators: Dictionary<PropertyValidatorAsync>;
    @ViewChild(PasswordInputControl) passwordElement: PasswordInputControl;
    constructor(
        private router: Router, private authenticationService: AuthenticationService,
        dialogService: ModalDialogService,
        pageService: PageService) {
        super(pageService, dialogService);
        this.usernameKey = `${this.nameSpace}-last-used-email`;
        this.model = new Credentials();
        this.validators = new Dictionary<PropertyValidatorAsync>();
        this.validators.add("emailAddress", new PropertyValidatorAsync(this.emailAddressValidatorAsync));
    }
    async ngOnInit() {
        this.bannerPageId = await this.pageService.getDefaultBanner();
        let lastused = localStorage.getItem(this.usernameKey)
        if (lastused != null) {
            this.model.emailAddress = lastused;
            this.passwordElement.focus();
        }
    }

    async onLogin(): Promise<void> {
        let lr = await this.authenticationService.login(this.model);
        switch (lr) {
            case LoginResult.Succeeded:
                localStorage.setItem(this.usernameKey, this.model.emailAddress);
                this.router.navigate(['home']);
                break;
            case LoginResult.CredentialsInvalid:
                this.showMessageDialog(`The email address and/or password is incorrect. Please try again, or cancel.`);
                break;
            case LoginResult.AccountIsBarred:
                this.showMessageDialog(`This account is disabled - please contact the administrator.`);
                break;
            case LoginResult.AccountNotActivated:
                this.showMessageDialog(`This account is not active - please contact the administrator.`);
                break;
            default:
                break;
        }
    }
    async onResetPassword() {
        let r = await ControlBase.isValid("password");
        if (r === true) {
            await this.authenticationService.sendPasswordReset(this.model.emailAddress);
            this.showMessageDialog(`A password reset email has been sent to ${this.model.emailAddress}`, (r) => {
                this.router.navigate(['home']);
            }, false, "Message");

        }
        //this.router.navigate(['resetpassword']);
        //this.showMessageDialog("Reset password feature not implemented yet.");
    }
    onRegister() {
        this.router.navigate(['register']);
        //this.showMessageDialog("Registration feature not implemented yet.");
    }
    onCancel(): void {
        this.router.navigate(['home']);
    }
    emailAddressValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = cs.validationResult;
            let text = cs.value || "";
            if (text.length === 0) {
                vr.valid = false;
                vr.message = `an email address is required`;
            }
            resolve(cs.validationResult);
        });
    }

    hasEmailAddress(): boolean {
        return this.model.emailAddress != null && this.model.emailAddress.trim().length > 0;
    }
    hasPassword(): boolean {
        return this.model.password != null && this.model.password.trim().length > 0;
    }

    canAttemptLogin() {
        return this.hasEmailAddress() && this.hasPassword();
    }
    //showMessageDialog(message: string) {
    //    //this.loginModel = new LoginModel();
    //    //this.loginModel.message = message;
    //    this.messageBox = new MessageBox();
    //    this.messageBox.message = message;
    //    this.dialogService.open('message-box');
    //}

}
