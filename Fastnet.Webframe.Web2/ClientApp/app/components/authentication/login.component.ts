import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService, Credentials, LoginResult } from './authentication.service';
import { PageService } from '../shared/page.service';
import { BaseComponent } from '../shared/base.component';
import { PasswordInputControl } from '../../fastnet/controls/password-input.component';
import { EmailInputControl } from '../../fastnet/controls/email-input.component';
import { PopupMessageComponent, PopupMessageOptions, PopupMessageCloseHandler } from '../../fastnet/controls/popup-message.component';
import { ValidationContext, ValidationResult } from '../../fastnet/controls/controls.types';
import { isNullorUndefined, isWhitespaceOrEmpty } from '../../fastnet/controls/controlbase2.type';
//import { ValidationResult, ValidationContext} from '../controls/controls.types';
//import { PasswordInputControl } from '../controls/password-input.component';
//import { PopupMessageComponent, PopupMessageOptions, PopupMessageCloseHandler } from '../controls/popup-message.component';
//import { isNullorUndefined, isWhitespaceOrEmpty } from '../controls/controlbase2.type';
//import { EmailInputControl } from '../controls/email-input.component';

@Component({
    selector: 'webframe-login',
    templateUrl: './login.component.html',
    styleUrls: ['../../styles/webframe.forms.scss', './login.component.scss']
})
export class LoginComponent extends BaseComponent implements OnInit {
    private nameSpace = "webframe-";
    public bannerPageId: number | null;
    public model: Credentials;
    public message: string;
    private usernameKey: string;
    @ViewChild(PasswordInputControl) passwordElement: PasswordInputControl;
    @ViewChild(EmailInputControl) emailControl: EmailInputControl;
    @ViewChild(PopupMessageComponent) messagePopup: PopupMessageComponent;
    constructor(
        private router: Router, private authenticationService: AuthenticationService,
        pageService: PageService) {
        super(pageService);
        this.usernameKey = `${this.nameSpace}-last-used-email`;
        this.model = new Credentials();
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
                if (this.authenticationService.isEditor()) {
                    this.router.navigate(['edit', '0']);
                } else {
                    this.router.navigate(['home']);
                }
                break;
            case LoginResult.CredentialsInvalid:
                this.showMessage(`The email address and/or password is incorrect. Please try again, or cancel.`);
                break;
            case LoginResult.AccountIsBarred:
                this.showMessage(`This account is disabled - please contact the administrator.`);
                break;
            case LoginResult.AccountNotActivated:
                this.showMessage(`This account is not active - please contact the administrator.`);
                break;
            default:
                break;
        }
    }
    async onResetPassword() {
        let r = await this.emailControl.validate();
        if (r.valid === true) {
            let result = await this.authenticationService.sendPasswordReset(this.model.emailAddress);
            if (result.success) {
                this.showMessage(`A password reset email has been sent to ${this.model.emailAddress}`, (r) => {
                    this.router.navigate(['home']);
                });
            } else {
                this.showErrors(result.errors);
            }

        } else {
            this.showMessage("Please provide a valid email first");
        }
    }
    onRegister() {
        this.router.navigate(['register']);
    }
    onCancel(): void {
        this.router.navigate(['home']);
    }
    emailAddressValidatorAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = new ValidationResult();
            if (isNullorUndefined(value) || isWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = `an email address is required`;
            }
            resolve(vr);
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
    private showErrors(errors: string[]): void {
        let options = new PopupMessageOptions();
        options.error = true;
        this.messagePopup.open(errors, (r) => { });
    }
    private showMessage(message: string, onClose: PopupMessageCloseHandler = (r) => { }): void {
        this.messagePopup.open(message, (r) =>  onClose(r));
    }
}
