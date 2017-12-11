import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MembershipComponent } from '../membership.component';
import { PageService } from '../../shared/page.service';

@Component({
    selector: 'webframe-dwhmembership',
    templateUrl: './dwhmembership.component.html',
    styleUrls: ['./dwhmembership.component.scss']
})
export class DwhMembershipComponent extends MembershipComponent {
    constructor(pageService: PageService, router: Router ) {
        super(pageService, router);
        console.log("DwhMembershipComponent");
    }
}
