
import { Component, ViewChild } from '@angular/core';
import { CmsService, Email } from './cms.service';
import { ValidationContext, ValidationResult } from '../../fastnet/controls/controls.types';
import { isNullorUndefined, isWhitespaceOrEmpty, ValidationMethod } from '../../fastnet/controls/controlbase.type';
import { PopupMessageComponent } from '../../fastnet/controls/popup-message.component';

@Component({
    selector: 'send-mail',
    templateUrl: './send-mail.component.html',
    styleUrls: ['./send-mail.component.scss']
})
export class SendMailComponent {
    @ViewChild(PopupMessageComponent) messagePopup: PopupMessageComponent;
    email: Email = new Email();
    emailAddressValidator: ValidationMethod = (ctx: ValidationContext, val: any) => this.emailValidator(ctx, val);
    constructor(private cmsService: CmsService) {

    }
    async onSendMailClick() {
        await this.cmsService.sendEmail(this.email);
        let message = "Test email sent";
        this.messagePopup.open(message, (r) => {
            this.email = new Email();
        });

    }
    //onCancelMailClick() {

    //}
    private async emailValidator(context: ValidationContext, value: any): Promise<ValidationResult> {
        return new Promise<ValidationResult>(async resolve => {
            let vr = new ValidationResult();
            if (isNullorUndefined(value) || isWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = `an email address is required`;
            } 
            resolve(vr);
        });
    }
}
