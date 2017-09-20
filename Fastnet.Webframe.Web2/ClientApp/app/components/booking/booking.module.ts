import { NgModule } from '@angular/core';

import { BookingComponent } from './booking.component';
import { routing } from './booking.routing';

@NgModule({
    imports: [routing],
    exports: [],
    declarations: [BookingComponent],
    providers: [],
})
export class BookingModule { }


