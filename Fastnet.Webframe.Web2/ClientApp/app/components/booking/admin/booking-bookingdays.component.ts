import { Component, } from '@angular/core';
import { BookingAdminService } from './booking-admin.service';


@Component({
    selector: 'booking-bookingdays',
    templateUrl: './booking-bookingdays.component.html',
    styleUrls: ['./booking-bookingdays.component.scss']
})
export class BookingDaysComponent  {

    constructor(private adminService: BookingAdminService) {

    }
 
}
