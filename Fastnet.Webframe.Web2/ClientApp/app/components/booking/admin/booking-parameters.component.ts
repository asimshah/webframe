import { Component, OnInit, ViewChild } from '@angular/core';
import { BookingAdminService,  BookingParameters } from './booking-admin.service';
import { PopupMessageComponent } from '../../../fastnet/controls/popup-message.component';

@Component({
    selector: 'booking-parameters',
    templateUrl: './booking-parameters.component.html',
    styleUrls: ['./booking-parameters.component.scss']
})
export class BookingParametersComponent implements OnInit {
    @ViewChild(PopupMessageComponent) popupMessage: PopupMessageComponent;
    parameters: BookingParameters;
    constructor(private adminService: BookingAdminService) {

    }
    clearPrivilegedGroup() {
        this.parameters.privilegedMembers = undefined;
    }
    async ngOnInit() {
        await this.loadData();
    }
    async onCancel() {
        await this.loadData();
    }
    async onSave() {
        this.parameters.privilegedMembersGroupId = this.parameters.privilegedMembers ? this.parameters.privilegedMembers.groupId : 0;
        await this.adminService.saveParameters(this.parameters);
        this.popupMessage.open("Parameters saved", () => { });
    }
    async loadData() {
        this.parameters = await this.adminService.getParameters();
        // we need the this.parameters.privilegedMembers to be set to
        // one of the items in this.parameters.availableGroups
        // for the dropdown to work properly
        for (let g of this.parameters.availableGroups) {
            if (g.groupId == this.parameters.privilegedMembersGroupId) {
                this.parameters.privilegedMembers = g;
            }
        }
    }
}
