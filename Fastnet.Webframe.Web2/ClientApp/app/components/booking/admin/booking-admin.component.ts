import { Component } from '@angular/core';
import { BaseComponent } from '../../shared/base.component';
import { PageService } from '../../shared/page.service';
import { Location } from '@angular/common';
import { BookingsFilter } from './booking-admin.service';

enum adminOptions {
    Index,
    UnpaidBookings,
    Bookings,
    CancelledBookings,
    ArchivedBookings,
    Occupancy,
    BookingDays,
    EntryCodes,
    Pricing,
    EmailTemplates,
    Parameters
}
@Component({
    selector: 'booking-admin',
    templateUrl: './booking-admin.component.html',
    styleUrls:['./booking-admin.component.scss']
})
export class BookingAdminComponent extends BaseComponent{
    BookingsFilter = BookingsFilter;
    adminOptions = adminOptions;
    currentOption = adminOptions.Index;
    constructor(pageService: PageService, private location: Location) {
        super(pageService);
    }
    public goToOption(opt: adminOptions) {
        this.currentOption = opt;
    }
    public goBack() {
        switch (this.currentOption) {
            case adminOptions.Index:
                this.location.back();
                break;
            default:
                this.currentOption = adminOptions.Index;
                break
        }

    }
}
