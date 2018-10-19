import { Component, } from '@angular/core';
import { BookingAdminService } from './booking-admin.service';


@Component({
    selector: 'booking-pricing',
    templateUrl: './booking-pricing.component.html',
    styleUrls: ['./booking-pricing.component.scss']
})
export class BookingPricingComponent  {

    constructor(private adminService: BookingAdminService) {

    }
 
}
