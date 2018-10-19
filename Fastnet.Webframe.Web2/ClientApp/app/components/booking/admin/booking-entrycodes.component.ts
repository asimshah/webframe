import { Component, } from '@angular/core';
import { BookingAdminService } from './booking-admin.service';


@Component({
    selector: 'booking-entrycodes',
    templateUrl: './booking-entrycodes.component.html',
    styleUrls: ['./booking-entrycodes.component.scss']
})
export class BookingEntryCodesComponent  {

    constructor(private adminService: BookingAdminService) {

    }
 
}
