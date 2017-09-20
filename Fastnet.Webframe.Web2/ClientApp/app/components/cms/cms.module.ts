import { NgModule } from '@angular/core';

import { CmsComponent } from './cms.component';
import { routing } from './cms.routing';

@NgModule({
    imports: [routing],
    exports: [],
    declarations: [CmsComponent],
    providers: [],
})
export class CmsModule { }


