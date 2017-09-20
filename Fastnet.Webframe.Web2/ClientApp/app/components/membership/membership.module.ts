import { NgModule } from '@angular/core';

import { MembershipComponent } from './membership.component';
import { routing } from './membership.routing';

@NgModule({
    imports: [routing],
    exports: [],
    declarations: [MembershipComponent],
    providers: [],
})
export class MembershipModule { }