import { NgModule } from '@angular/core';

import { DesignerComponent } from './designer.component';
import { routing } from './designer.routing';

@NgModule({
    imports: [routing],
    exports: [],
    declarations: [DesignerComponent],
    providers: [],
})
export class DesignerModule { }


