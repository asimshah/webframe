import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MembershipComponent } from '../membership.component';
import { PageService } from '../../shared/page.service';
import { DWHMember } from './dwhmembership.types';
import { DWHMembershipService } from './dwhmembership.service';
import { PopupMessageOptions, PopupMessageResult } from '../../../fastnet/controls/popup-message.component';
import { ValidationContext, ValidationResult } from '../../../fastnet/controls/controls.types';
import { isWhitespaceOrEmpty, isNullorUndefined } from '../../../fastnet/controls/controlbase2.type';
//import { ValidationResult, ValidationContext } from '../../controls/controls.types';
//import { isNullorUndefined, isWhitespaceOrEmpty } from '../../controls/controlbase2.type';
//import { PopupMessageOptions, PopupMessageResult } from '../../controls/popup-message.component';

@Component({
    selector: 'webframe-dwhmembership',
    templateUrl: './dwhmembership.component.html',
    styleUrls: ['./dwhmembership.component.scss']
})
export class DwhMembershipComponent extends MembershipComponent {
    public memberList: DWHMember[];
    constructor(pageService: PageService, router: Router,
        membershipService: DWHMembershipService) {
        super(pageService, router, membershipService);
    }
    protected getNewMember(): DWHMember {
        console.log(`returning dwh new member`);
        return new DWHMember();
    }
    public async onDeleteClick() {
        let options = new PopupMessageOptions();
        options.allowCancel = true;
        options.warning = true;
        this.popupMessage.open("Deleting a member removes all data for that member permanently(including any past and present bookings). Choose OK to proceed.", (r) => {
            if (r === PopupMessageResult.ok) {
                console.log("delete requested");
                this.deleteMember();
            }
        }, options);
    }
    public getBookingInformation(): string {
        let info = "";
        let m = <DWHMember>this.member;
        let total = m.pastBookingCount + m.futureBookingCount;
        if (total > 0) {
            if (total === 1) {
                info = "This member has 1 booking";
                if (m.pastBookingCount === 1) {
                    info += " which is in the past";
                }
            } else {
                info = `This member has ${total} bookings`;
                if (total === m.pastBookingCount) {
                    info += " which are all in the past";
                }
                else if (m.pastBookingCount === 1) {
                    info += " of which 1 is in the past";
                } else if (m.pastBookingCount > 1) {
                    info += ` of which ${m.pastBookingCount} are in the past`;
                }
            }
        }
        return info + ".";
    }
    bmcNumberValidatorAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        return new Promise<ValidationResult>(async resolve => {
            let vr = new ValidationResult();
            if (!isNullorUndefined(value) && !isWhitespaceOrEmpty(value)) {
                let text: string = value as string;
                if (this.member && text.length > 0) {
                    if (this.member.lastName.trim().length === 0) {
                        vr.valid = false;
                        vr.message = "Please complete last name before entering the BMC number";
                    } else {
                        let r = await this.membershipService.validateProperty("bmcnumber", [text, this.member.lastName]);
                        if (!r.success) {
                            vr.valid = false;
                            vr.message = r.message;
                        }
                    }
                }
            }
            resolve(vr);
        });
    }

}
