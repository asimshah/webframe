import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmailValidator, FormControl } from '@angular/forms';

import { AuthenticationService, Credentials, LoginResult } from './authentication.service';
import { ModalDialogService } from '../../components/modaldialog/modal-dialog.service';
import { PageKeys, PageService } from '../shared/page.service';

class LoginModel {
    message: string;
}

@Component({
    selector: 'webframe-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    public bannerPageId: number | null;
    public loginModel: LoginModel;
    public model: Credentials;
    public emailAddressIsValid: boolean = true;
    public passwordIsValid: boolean = true;
    public loginFailed: boolean;
    public failureReason: string;
    constructor(
        private router: Router, private authenticationService: AuthenticationService,
        private dialogService: ModalDialogService,
        private pageService: PageService
    ) {
        this.model = new Credentials();
    }
    async ngOnInit() {
        this.bannerPageId = await this.pageService.getDefaultBanner();
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
                this.loginFailed = false;
                break;
            case LoginResult.CredentialsInvalid:
                this.failureReason = "These credentials are not valid";
                this.loginFailed = true;
                this.showMessageDialog(`The email address and/or password is incorrect. Please try again, or cancel.`);
                break;
            case LoginResult.AccountIsBarred:
                this.failureReason = "This account is disabled - please contact the administrator";
                this.loginFailed = true;
                this.showMessageDialog(`This account is disabled - please contact the administrator.`);
                break;
            case LoginResult.AccountNotActivated:
                this.failureReason = "This account is not active - please contact the administrator";
                this.loginFailed = true;
                this.showMessageDialog(`This account is not active - please contact the administrator.`);
                break;
            default:
                this.failureReason = "System error - please report this";
                this.loginFailed = true;
                break;
        }
        if (!this.loginFailed) {
            this.router.navigate(['home']);
        }
    }
    onResetPassword() {
        this.loginModel = new LoginModel();
        this.loginModel.message = "Reset password feature not implemented yet.";
        this.dialogService.open('login-modal');
    }
    onRegister() {
        this.loginModel = new LoginModel();
        this.loginModel.message = "Registration feature not implemented yet.";
        this.dialogService.open('login-modal');
    }
    onCancel(): void {
        this.router.navigate(['home']);
    }
    onPasswordChange(fc: FormControl) {
        this.passwordIsValid = this.isControlValid(fc);
    }
    getEmailAddressError(fc: FormControl): string {
        //console.log("getEmailAddressError");
        if (fc.errors != null) {
            if (fc.errors.required) {
                return "An email address is required";
            } else if (fc.errors.email) {
                return "This is not a valid email address";
            }
        }
        return "unexpected";
    }
    hasEmailAddress(): boolean {
        return this.emailAddressIsValid && this.model.emailAddress != null && this.model.emailAddress.trim().length > 0;
    }
    onEmailAddressChange(fc: FormControl) {        
        this.emailAddressIsValid = this.isControlValid(fc);
    }
    isControlValid(fc: FormControl): boolean {
        let valid = fc.valid && (fc.dirty || fc.touched);
        //let t = `${valid} [ valid: ${fc.valid}, dirty: ${fc.dirty}, touched: ${fc.touched}]`;
        //console.log(t, JSON.stringify(fc.errors));
        return valid;
    }
    showMessageDialog(message: string) {
        this.loginModel = new LoginModel();
        this.loginModel.message = message;
        this.dialogService.open('login-modal');
    }
    closeMessageDialog() {
        this.loginFailed = false;
        this.dialogService.close('login-modal');
    }
}
