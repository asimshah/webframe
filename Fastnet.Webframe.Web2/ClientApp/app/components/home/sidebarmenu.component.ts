import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { MenuComponent } from './menu.component';
import { PageService, MenuDetails } from '../shared/page.service';

@Component({
    selector: 'webframe-sidebarmenu',
    templateUrl: './sidebarmenu.component.html',
    styleUrls: ['./sidebarmenu.component.scss']
})
export class SidebarMenuComponent extends MenuComponent {
    hideMenus: boolean = true;
    constructor(pageService: PageService, private router: Router) {
        super(pageService);
    }
    toggleMenus(e: Event) {
        //e.stopPropagation();
        this.hideMenus = !this.hideMenus;
        //console.log(`hideMenus = ${this.hideMenus}`);
    }
    menuItemClick(item: MenuDetails) {
        //console.log(`${item.text}`);
        this.hideMenus = true;
        this.router.navigate([item.url]);
    }
}
