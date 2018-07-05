import { NgModule } from '@angular/core';

import { PageComponent } from './page.component';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [CommonModule],
    exports: [PageComponent],
    declarations: [PageComponent],
    providers: [],
})
export class PageModule { }
