import { Component, OnInit } from '@angular/core';
import { PageService } from '../shared/page.service';
import { BaseComponent } from '../shared/base.component';
import { ModalDialogService } from '../modaldialog/modal-dialog.service';
import { Dictionary } from '../types/dictionary.types';
import { PropertyValidatorAsync, ValidationResult, ControlState } from '../controls/controls.types';
import { MembershipService } from '../membership/membership.service';
import { Member } from '../shared/common.types';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Component({
    selector: 'webframe-activate',
    templateUrl: './activate.component.html',
    styleUrls: ['./activate.component.scss']
})
export class ActivateComponent extends BaseComponent implements OnInit {
    activationComplete: boolean = false;
    activationResult: boolean;
    constructor(pageService: PageService, dialogService: ModalDialogService, protected membershipService: MembershipService,
        private authenticationService: AuthenticationService, protected router: Router,
        private route: ActivatedRoute) {
        super(pageService, dialogService);
        console.log("ActivateComponent: constructor");
    }
    async ngOnInit() {
        console.log("ActivateComponent: OnInit");
        this.route.params.subscribe(async params => {
            let userId = params['id'];
            let code = params['code'];
            console.log(`activate with id ${userId} and code ${code}`);
            let r = await this.authenticationService.activate(userId, code);
            this.activationResult = r;
            this.activationComplete = true;
        });
    }


}

