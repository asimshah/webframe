
import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '../shared/base.component';
import { PageService } from '../shared/page.service';
import { Router } from '@angular/router';
import { DesignerService, Menu } from './designer.service';
import { forEach } from '@angular/router/src/utils/collection';
import { ContentBrowserComponent, SelectableContent, SelectedItem } from '../shared/content-browser.component';
import { PopupMessageComponent, PopupMessageOptions } from '../../fastnet/controls/popup-message.component';

enum Modes {
    MenuEditor,
    StyleEditor
}


@Component({
    selector: 'webframe-designer',
    templateUrl: './designer.component.html',
    styleUrls: ['./designer.component.scss']
})
export class DesignerComponent extends BaseComponent implements OnInit {
    Modes = Modes;
    @ViewChild(ContentBrowserComponent) contentBrowser: ContentBrowserComponent;
    @ViewChild(PopupMessageComponent) popupMessage: PopupMessageComponent;
    public currentMode: Modes = Modes.MenuEditor;
    public menus: Menu[];
    private originalMenus: string;
    constructor(pageService: PageService, private designerService: DesignerService, private router: Router) {
        super(pageService);
    }
    async ngOnInit() {
        await this.loadMenus();
    }
    public goBack() {
        this.router.navigate(['/home']);
    }
    public async goToMenuEditor() {
        if (this.currentMode !== Modes.MenuEditor) {
            this.currentMode = Modes.MenuEditor;
            await this.loadMenus();
        }
    }
    public goToStyleEditor() {
        if (this.currentMode !== Modes.StyleEditor) {
            this.currentMode = Modes.StyleEditor;
        }
    }
    public addMenuItem() {
        let nm = new Menu();
        nm.index = this.menus.length;
        nm.text = "New Menu Item";
        nm.url = "";
        this.menus.push(nm);
    }
    public removeMenuItem(m: Menu) {
        let index = this.menus.findIndex(x => x === m);
        this.menus.splice(index, 1);
        index = 0;
        this.menus.forEach((m) => { m.index = index++;});
    }
    public menusHaveChanged(): boolean {
        return JSON.stringify(this.menus) !== this.originalMenus;
    }
    public moveMenuItemUp(m: Menu) {
        let index = this.menus.findIndex(x => x === m);
        this.menus[index - 1].index++;
        this.menus[index].index--; 
        this.sortMenus();
    }
    public moveMenuItemDown(m: Menu) {
        let index = this.menus.findIndex(x => x === m);
        this.menus[index + 1].index--;
        this.menus[index].index++;
        this.sortMenus();
    }
    public async cancelChanges() {
        await this.loadMenus();
    }
    public showContentBrowser(m: Menu) {
        this.contentBrowser.openForSelection(SelectableContent.PagesOnly, (si?: SelectedItem) => {
            if (si) {
                m.url = "/" + si.url;
            }
        });
    }
    public async saveChanges() {
        let sr = await this.designerService.updateMenus(this.menus);
        if (sr.success === false) {
            let options = new PopupMessageOptions();
            options.warning = true;
            this.popupMessage.open(sr.errors, () => { });
        } else {
            this.popupMessage.open("Menu changes saved", async () => {
                await this.loadMenus();
            });
        }
    }
    private sortMenus() {
        this.menus.sort((l, r) => {
            if (l.index < r.index) return -1;
            if (l.index > r.index) return 1;
            return 0;
        });
    }
    private async loadMenus() {
        this.menus = await this.designerService.getMenus();
        this.saveOriginalmenus();
    }
    private saveOriginalmenus() {
        this.originalMenus = JSON.stringify(this.menus);
    }
}
