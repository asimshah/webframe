import { NgModule } from '@angular/core';

import { DwhMembershipComponent } from './dwhmembership.component';
import { MembershipComponent } from '../membership.component';
import { PageModule } from '../../page/page.module';

import { routing } from './dwhmembership.routing';

@NgModule({
    imports: [routing, PageModule],
    exports: [],
    declarations: [MembershipComponent, DwhMembershipComponent],
    providers: [],
})
export class DwhMembershipModule { }