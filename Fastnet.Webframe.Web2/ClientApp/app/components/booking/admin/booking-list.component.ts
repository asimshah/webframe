import { Component, Input, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { BookingsFilter, Booking, BookingAdminService, BookingStatus } from './booking-admin.service';

@Component({
    selector: 'booking-list',
    templateUrl: './booking-list.component.html',
    styleUrls: ['./booking-list.component.scss']
})
export class BookingListComponent implements AfterViewInit {
    BookingsFilter = BookingsFilter;
    BookingStatus = BookingStatus;
    @Input() filter: BookingsFilter = BookingsFilter.Current;
    private bookings: Booking[];
    private allbookings: Booking[];
    private filteredBookings: Booking[];
    private isFiltered = false;
    constructor(private adminService: BookingAdminService) {

    }
    getCaption(): string {
        let caption = "";
        switch (this.filter) {
            case BookingsFilter.Current:
                caption = "Current Bookings";
                break;
            case BookingsFilter.UnpaidOnly:
                caption = "Unpaid Bookings";
                break;
            case BookingsFilter.Cancelled:
                caption = "Cancelled Bookings";
                break;
            case BookingsFilter.Historic:
                caption = "Archived Bookings";
                break;
        }
        return caption;
    }
    getBookings(): Booking[] {
        if (this.isFiltered) {
            return this.filteredBookings;
        } else {
            return this.bookings;
        }
    }
    canShowPaidColumn(): boolean {
        let r = false;
        switch (this.filter) {
            case BookingsFilter.Current:
            case BookingsFilter.UnpaidOnly:
                r = true;
                break;
        }
        return r;
    }
    onSearchClear() {
        console.log(`search cleared`);
        this.isFiltered = false;
        this.bookings = this.allbookings;
    }
    onSearch(searchText: string) {
        console.log(`search for ${searchText}`);
        this.createFilteredList(searchText.toLowerCase());
        this.bookings = this.filteredBookings;
    }
    async ngAfterViewInit() {
        this.allbookings = await this.adminService.getBookings(this.filter);
        this.bookings = this.allbookings;
    }
    private createFilteredList(searchText: string) {
        this.filteredBookings = [];
        for (let b of this.bookings) {
            let items: string[] = [];
            items.push(b.reference.toLowerCase());
            items.push(b.from.toLowerCase());
            items.push(b.memberName.toLowerCase());
            items.push(b.memberEmailAddress.toLowerCase());
            items.push(b.memberPhoneNumber.toLowerCase());
            if (items.some(text => {
                return text.includes(searchText);
            })) {
                this.filteredBookings.push(b);
            }
        }
    }
}
