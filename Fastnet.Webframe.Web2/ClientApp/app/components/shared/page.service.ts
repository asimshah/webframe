import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { BaseService } from '../shared/base.service';

export class PageKeys {
    centrePanelPageId: number;
    bannerPanelPageId?: number;
    leftPanelPageId?: number;
    rightPanelPageId?: number;
    bannerPanelEditable: boolean;
    leftPanelEditable: boolean;
    rightPanelEditable: boolean;
}
export class PageHtmlInformation {
    pageId: number;
    location: string;
    htmlText: string;
    htmlStyles: any[];
}
export class MenuDetails {
    level: number;
    index: number;
    text: string;
    url: string
    subMenus: MenuDetails[]
}

@Injectable()
export class PageService extends BaseService {
    constructor(http: Http) {
        super(http);
        //console.log("PageService constructor");
    }
    public test(): number {
        return 43;
    }
    public async getDefaultBanner(): Promise<number | null> {
        let query = `/pageapi/get/default/banner/pageId`;
        let result = await this.query(query);
        if (!result.success) {
            return new Promise<null>(resolve => resolve(null));
        }
        else {
            return new Promise<number>(resolve => resolve(<number>result.data));
        }
    }
    public async getMenus(): Promise<MenuDetails[]> {
        let query = "/pageapi/get/menus";
        let result = await this.query(query);
        return new Promise<MenuDetails[]>(resolve => resolve(result.data as MenuDetails[]));
    }
    public async getPageKeys(id?: number): Promise<PageKeys | null> {
        let query = "/pageapi/get/pagekeys";
        if (id != undefined) {
            query += `/${id}`;
        }
        let result = await this.query(query);
        if (!result.success) {
            return new Promise<null>(resolve => resolve(null));
        }
        else {
            return new Promise<PageKeys>(resolve => resolve(result.data as PageKeys));
        }
    }
    public async getPageHtml(id: number): Promise<PageHtmlInformation | null> {
        let query = `/pageapi/get/page/html/${id}`;
        let result = await this.query(query);
        if (!result.success) {
            return new Promise<null>(resolve => resolve(null));
        }
        else {
            return new Promise<PageHtmlInformation>(resolve => resolve(result.data as PageHtmlInformation));
        }
    }
}