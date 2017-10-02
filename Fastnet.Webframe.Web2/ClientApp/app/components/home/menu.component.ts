import { Component } from '@angular/core';
import { NgForOf } from '@angular/common';

import { PageService, MenuDetails } from '../shared/page.service';

@Component({
    selector: 'webframe-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
    menus: MenuDetails[];
    constructor(private pageService: PageService) {
        this.loadMenus();
    }
    private async loadMenus() {
        this.menus = await this.pageService.getMenus();
        console.log(JSON.stringify(this.menus));
    }
    onMenuItemClick(event: Event, menuItem: MenuDetails) {
        //event.preventDefault();
        console.log(`menu item click [${menuItem.url}]`);
    }
}
