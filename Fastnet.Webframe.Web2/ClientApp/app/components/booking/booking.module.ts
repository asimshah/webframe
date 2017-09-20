import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookingComponent } from './booking.component';
import { bookingRouting } from './booking.routing';

@NgModule({
    imports: [
        CommonModule,
        bookingRouting
     ],
    exports: [],
    declarations: [BookingComponent],
    providers: [],
})
export class BookingModule { }


