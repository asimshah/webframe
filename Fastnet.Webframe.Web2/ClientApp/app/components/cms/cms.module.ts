import { NgModule } from '@angular/core';

import { CmsComponent } from './cms.component';
import { routing } from './cms.routing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageModule } from '../page/page.module';
import { ControlsModule } from '../../fastnet/controls/controls.module';
import { MailHistoryComponent } from './mail-history.component';
import { MembershipHistoryComponent } from './membership-history.component';
import { CmsService } from './cms.service';
import { SendMailComponent } from './send-mail.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        routing,
        PageModule,
        ControlsModule,
    ],
    exports: [],
    declarations: [
        CmsComponent,
        MailHistoryComponent,
        MembershipHistoryComponent,
        SendMailComponent
    ],
    providers: [
        CmsService
    ],
})
export class CmsModule { }


