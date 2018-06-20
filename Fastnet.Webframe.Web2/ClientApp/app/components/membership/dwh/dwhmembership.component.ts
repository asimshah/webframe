import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MembershipComponent } from '../membership.component';
import { PageService } from '../../shared/page.service';
import { DWHMember } from './dwhmembership.types';
import { DWHMembershipService } from './dwhmembership.service';
import { ModalDialogService } from '../../modaldialog/modal-dialog.service';

@Component({
    selector: 'webframe-dwhmembership',
    templateUrl: './dwhmembership.component.html',
    styleUrls: ['./dwhmembership.component.scss']
})
export class DwhMembershipComponent extends MembershipComponent {
    public memberList: DWHMember[];
    constructor(pageService: PageService, router: Router,
        dialogService: ModalDialogService,
        membershipService: DWHMembershipService) {
        super(pageService, router, dialogService, membershipService);
        //console.log("DwhMembershipComponent");
    }
    protected getNewMember(): DWHMember {
        return new DWHMember();
    }
    //public onAddNewMember() {
    //    console.log("DwhMembershipComponent: onAddNewMember()");
    //    this.member = new DWHMember();
    //    this.memberIsNew = true;
    //}
    //onMemberClick(m: DWHMember) {
    //    this.member = m;
    //}
    //protected searchMembers(prefix: boolean) {
    //    console.log(`DwhMembershipComponent: search started using ${this.searchText}, prefix = ${prefix}`);
    //}
}
