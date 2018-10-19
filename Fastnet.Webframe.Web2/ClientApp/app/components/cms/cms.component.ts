import { Component } from '@angular/core';
import { BaseComponent } from '../shared/base.component';
import { PageService } from '../shared/page.service';
import { Router } from '@angular/router';

enum cmsModes {
    Index,
    MailHistory,
    MembershipHistory,
    SendMail
}

@Component({
    selector: 'webframe-cms',
    templateUrl: './cms.component.html',
    styleUrls: ['./cms.component.scss']
})
export class CmsComponent extends BaseComponent {
    cmsModes = cmsModes;
    currentMode = cmsModes.Index;
    constructor(pageService: PageService, private router: Router) {
        super(pageService);
    }
    public goToSendMail() {
        this.currentMode = cmsModes.SendMail;
    }
    public goToMailHistory() {
        this.currentMode = cmsModes.MailHistory;
    }
    public goToMembershipHistory() {
        this.currentMode = cmsModes.MembershipHistory;
    }
    public goBack() {
        switch (this.currentMode) {
            case cmsModes.Index:
                this.router.navigate(['/home']);
                break;
            default:
                this.currentMode = cmsModes.Index;
                break
        }

    }
}
