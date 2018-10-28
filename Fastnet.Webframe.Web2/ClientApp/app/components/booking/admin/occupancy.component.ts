
import { Component, OnChanges } from '@angular/core';
import { addMonths, daysInMonth, getDateAsddMMMyy } from '../../../fastnet/core/date.functions';
import { BookingAdminService, Occupancy, DayStatus } from './booking-admin.service';

@Component({
    selector: 'occupancy',
    templateUrl: './occupancy.component.html',
    styleUrls: ['./occupancy.component.scss'],
})
export class OccupancyComponentComponent {
    DayStatus = DayStatus;
    statusDescription = [
        "Don Whillans Hut  is closed",
        "This day free",
        "This day is fully booked",
        "This day is part booked",
        "Saturdays are not separately bookable"
    ];
    private fromToBusy = false;
    private _from: Date;
    private _to: Date;
    private reportFrom: Date;
    private reportTo: Date;
    get from(): Date {
        return this._from;
    }
    set from(d: Date) {
        this._from = d;
        this.onFromChanged();
    }
    get to(): Date {
        return this._to;
    }
    set to(d: Date) {
        this._to = d;
        this.onToChanged();
    }
    rows: Occupancy[] = [];
    constructor(private adminService: BookingAdminService) {
        let today = new Date();
        this.from = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
        this.to = addMonths(this.from, 1);
        console.log(`from ${this.from.toDateString()} to ${this.to.toDateString()}`);
    }
    onFromChanged() {
        if (!this.fromToBusy) {
            this.fromToBusy = true;
            let t1 = addMonths(this.from, 1);
            if (!this.to || this.to.valueOf() < t1.valueOf()) {
                this.to = t1;
            }
            this.fromToBusy = false;
        }
    }
    onToChanged() {
        if (!this.fromToBusy) {
            this.fromToBusy = true;
            let t1 = addMonths(this.to, -1);
            if (!this.from || this.from.valueOf() > t1.valueOf()) {
                this.from = t1;
            }
            this.fromToBusy = false;
        }
    }
    async onStart() {
        this.rows = [];
        setTimeout(async () => {
            this.reportFrom = this.from;
            this.reportTo = new Date(this.to.getFullYear(), this.to.getMonth(), daysInMonth(this.to));
            console.log(`occupancy from ${this.reportFrom} to ${this.reportTo}`);
            this.rows = await this.adminService.getOccupancy(this.reportFrom, this.reportTo);
        }, 0);
    }
    getStatusDescription(status: DayStatus): string {
        //console.log(`getting status ${status}`);
        return this.statusDescription[status];
    }
    getCaption(): string {
        return `Occupancy from ${getDateAsddMMMyy(this.reportFrom)} to ${getDateAsddMMMyy(this.reportTo)}`;
    }
}
