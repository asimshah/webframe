import { NgModule } from '@angular/core';

import { PageComponent } from './page.component';
import { CommonModule } from '@angular/common';
import { SidebarMenuComponent } from './sidebarmenu.component';
import { MenuComponent } from './menu.component';

@NgModule({
    imports: [CommonModule],
    exports: [PageComponent, SidebarMenuComponent, MenuComponent],
    declarations: [PageComponent, SidebarMenuComponent, MenuComponent],
    providers: [],
})
export class PageModule { }
