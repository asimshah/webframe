import { NgModule } from '@angular/core';

import { PageComponent } from './page.component';
import { CommonModule } from '@angular/common';
import { SidebarMenuComponent } from './sidebarmenu.component';
import { MenuComponent } from './menu.component';
import { CustomCssComponent } from './custom-css.component';

@NgModule({
    imports: [CommonModule],
    exports: [
        PageComponent,
        SidebarMenuComponent,
        MenuComponent,
        CustomCssComponent
    ],
    declarations: [
        PageComponent,
        SidebarMenuComponent,
        MenuComponent,
        CustomCssComponent
    ],
    providers: [],
})
export class PageModule { }
