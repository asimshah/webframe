import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookingComponent } from './booking.component';
import { bookingRouting } from './booking.routing';
import { BookingAdminComponent } from './admin/booking-admin.component';
import { FormsModule } from '@angular/forms';
import { PageModule } from '../page/page.module';
import { ControlsModule } from '../../fastnet/controls/controls.module';
import { BookingListComponent } from './admin/booking-list.component';
import { BookingAdminService } from './admin/booking-admin.service';
import { BookingParametersComponent } from './admin/booking-parameters.component';
import { BookingEmailTemplatesComponent } from './admin/booking-emailtemplates.component';
import { BookingDaysComponent } from './admin/booking-bookingdays.component';
import { BookingEntryCodesComponent } from './admin/booking-entrycodes.component';
import { BookingPricingComponent } from './admin/booking-pricing.component';
import { TinyMCEModule } from '../../fastnet/tinymce/tinymce.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        bookingRouting,
        PageModule,
        ControlsModule,
        TinyMCEModule
     ],
    exports: [],
    declarations: [
        BookingAdminComponent,
        BookingComponent,
        BookingListComponent,
        BookingParametersComponent,
        BookingEmailTemplatesComponent,
        BookingDaysComponent,
        BookingEntryCodesComponent,
        BookingPricingComponent,

    ],
    providers: [
        BookingAdminService
    ],
})
export class BookingModule { }


