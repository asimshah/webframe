
import { Component } from '@angular/core';
import { RegisterComponent } from '../register.component';
import { PageService } from '../../shared/page.service';
import { ModalDialogService } from '../../modaldialog/modal-dialog.service';
import { DWHMember } from '../../membership/dwh/dwhmembership.types';
import { DWHMembershipService } from '../../membership/dwh/dwhmembership.service';
import { ValidationResult, ControlState, PropertyValidatorAsync } from '../../controls/controls.types';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../authentication.service';

class registrationModel {
    member: DWHMember;
    passwordConfirmation: string;
}

@Component({
    selector: 'webframe-register',
    templateUrl: './dwhregister.component.html',
    styleUrls: ['../../../styles/webframe.forms.scss', './dwhregister.component.scss']
})
export class DwhRegisterComponent extends RegisterComponent {
    public model: registrationModel;
    constructor(pageService: PageService, dialogService: ModalDialogService, membershipService: DWHMembershipService,
        authenticationService: AuthenticationService, router: Router) {
        super(pageService, dialogService, membershipService, authenticationService, router);
        console.log("DwhRegisterComponent: constructor");
    }
    protected getNewMember(): DWHMember {
        //console.log(`returning dwh new member`);
        return new DWHMember();
    }
    protected setValidators() {
        super.setValidators();
        this.validators.add("bmcMembership", new PropertyValidatorAsync((cs) => this.bmcNumberValidatorAsync(cs)));
    }
    bmcNumberValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        return new Promise<ValidationResult>(async resolve => {
            let vr = cs.validationResult;
            let text: string = cs.value || "";
            if (text.length > 0) {
                if (this.model.member.lastName.trim().length === 0) {
                    vr.valid = false;
                    vr.message = "Please complete Last Name before entering the BMC number";
                }
                else {
                    let r = await this.membershipService.validateProperty("bmcnumber", [text, this.model.member.lastName]);
                    if (!r.success) {
                        vr.valid = false;
                        vr.message = r.message;
                    }
                }
            }
            resolve(vr);
        });
    }
}

