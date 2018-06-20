import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { EmailValidator, FormControl } from '@angular/forms';

import { AuthenticationService, Credentials, LoginResult } from './authentication.service';
import { ModalDialogService } from '../../components/modaldialog/modal-dialog.service';
import { PageKeys, PageService } from '../shared/page.service';
import { ControlState, PasswordInputControl, PropertyValidatorAsync, ValidationResult } from '../controls/controls.component';
import { Dictionary } from '../types/dictionary.types';
import { MessageBox } from '../shared/common.types';
//import { Dictionary } from '../shared/dictionary.types';

class LoginModel {
    message: string;
}

@Component({
    selector: 'webframe-login',
    templateUrl: './login.component.html',
    styleUrls: ['../../styles/webframe.forms.scss', './login.component.scss']
})
export class LoginComponent implements OnInit {
    private nameSpace = "webframe-";
    public bannerPageId: number | null;
    public messageBox: MessageBox;
    //public loginModel: LoginModel;
    public model: Credentials;
    //public emailAddressIsValid: boolean = true;
    //public passwordIsValid: boolean = true;
   // public loginFailed: boolean;
    //public failureReason: string;
    private usernameKey: string;
    public validators: Dictionary<PropertyValidatorAsync>;
    @ViewChild(PasswordInputControl) passwordElement: PasswordInputControl;
    constructor(
        private router: Router, private authenticationService: AuthenticationService,
        private dialogService: ModalDialogService,
        private pageService: PageService) {
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
        //console.log(`banner page id is ${this.bannerPageId}`);
    }
    getPageId() {               
        return this.bannerPageId;
    }
    async onLogin(): Promise<void> {
        //console.log(`credentails are ${this.model.emailAddress} and ${this.model.password}`);
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
    onResetPassword() {
        this.showMessageDialog("Reset password feature not implemented yet.");
        //this.loginModel = new LoginModel();
        //this.loginModel.message = "Reset password feature not implemented yet.";
        //this.dialogService.open('message-box');
    }
    onRegister() {
        this.showMessageDialog("Registration feature not implemented yet.");
        //this.loginModel = new LoginModel();
        //this.loginModel.message = "Registration feature not implemented yet.";
        //this.dialogService.open('message-box');
    }
    onCancel(): void {
        this.router.navigate(['home']);
    }
    //onPasswordChange(fc: FormControl) {
    //    this.passwordIsValid = this.isControlValid(fc);
    //}
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
    //getEmailAddressError(fc: FormControl): string {
    //    //console.log("getEmailAddressError");
    //    if (fc.errors != null) {
    //        if (fc.errors.required) {
    //            return "An email address is required";
    //        } else if (fc.errors.email) {
    //            return "This is not a valid email address";
    //        }
    //    }
    //    return "unexpected";
    //}
    hasEmailAddress(): boolean {
        //return this.emailAddressIsValid && this.model.emailAddress != null && this.model.emailAddress.trim().length > 0;
        return this.model.emailAddress != null && this.model.emailAddress.trim().length > 0;
    }
    hasPassword(): boolean {
        return this.model.password != null && this.model.password.trim().length > 0;
    }
    //onEmailAddressChange(fc: FormControl) {        
    //    this.emailAddressIsValid = this.isControlValid(fc);
    //}
    //isControlValid(fc: FormControl): boolean {
    //    let valid = fc.valid && (fc.dirty || fc.touched);
    //    //let t = `${valid} [ valid: ${fc.valid}, dirty: ${fc.dirty}, touched: ${fc.touched}]`;
    //    //console.log(t, JSON.stringify(fc.errors));
    //    return valid;
    //}
    canAttemptLogin() {
        return this.hasEmailAddress() && this.hasPassword();
    }
    showMessageDialog(message: string) {
        //this.loginModel = new LoginModel();
        //this.loginModel.message = message;
        this.messageBox = new MessageBox();
        this.messageBox.message = message;
        this.dialogService.open('message-box');
    }
    onCloseMessageBox() {
        this.dialogService.close('message-box');
    }
}
