import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MembershipComponent } from '../membership.component';
import { PageService } from '../../shared/page.service';
import { DWHMember } from './dwhmembership.types';
import { DWHMembershipService } from './dwhmembership.service';
import { ValidationResult, ControlState, PropertyValidatorAsync, ValidationContext } from '../../controls/controls.types';
//import { MessageBoxResult } from '../../modaldialog/message-box.component';
import { isNullorUndefined, isWhitespaceOrEmpty } from '../../controls/controlbase2.type';
import { PopupMessageOptions, PopupMessageResult } from '../../controls/popup-message.component';

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
        //console.log("DwhMembershipComponent: constructor()");
    }
    //async ngOnInit() {
    //    console.log("DWHRegisterComponent: OnInit");
    //}
    protected getNewMember(): DWHMember {
        console.log(`returning dwh new member`);
        return new DWHMember();
    }
    //protected setNewMemberValidators() {
    //    super.setNewMemberValidators();
    //    this.validators.add("bmcMembership", new PropertyValidatorAsync((cs) => this.bmcNumberValidatorAsync(cs)));
    //}
    //protected setExistingMemberValidators() {
    //    super.setExistingMemberValidators();
    //    this.validators.add("bmcMembership", new PropertyValidatorAsync((cs) => this.bmcNumberValidatorAsync(cs)));
    //}
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
        //let r = await this.showMessage("Deleting a member removes all data for that member permanently (including any past and present bookings). Choose OK to proceed. ");
        //if (r === MessageBoxResult.ok) {
        //    console.log("delete requested");
        //    this.deleteMember();
        //}
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
            //let vr = cs.validationResult;
            //if (this.member) {
            //    let text: string = cs.value || "";
            //    if (text.length > 0) {
            //        if (this.member.lastName.trim().length === 0) {
            //            vr.valid = false;
            //            vr.message = "Please complete Last Name before entering the BMC number";
            //        } //else if (text.length !== 7) {
            //        //    vr.valid = false;
            //        //    vr.message = "BMC numbers are 7 characters of the form Annnnnn";
            //        //}
            //            else {
            //            let r = await this.membershipService.validateProperty("bmcnumber", [text, this.member.lastName]);
            //            if (!r.success) {
            //                vr.valid = false;
            //                vr.message = r.message;
            //            }
            //        }
            //    }
            //}
            //resolve(vr);
        });
    }

}
