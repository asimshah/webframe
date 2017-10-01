import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { BaseService } from '../shared/base.service';

export class PageKeys {
    centrePanelPageId: number;
    bannerPanelPageId?: number;
    leftPanelPageId?: number;
    rightPanelPageId?: number;
}

export class PageHtmlInformation {
    pageId: number;
    location: string;
    htmlText: string;
    htmlStyles: any[];
}

@Injectable()
export class PageService extends BaseService {
    constructor(http: Http) {
        super(http);
        console.log("PageService constructor");
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
    public async getPage(id: number): Promise<PageHtmlInformation | null> {
        let query = `/pageapi/get/page/${id}`;
        let result = await this.query(query);
        if (!result.success) {
            return new Promise<null>(resolve => resolve(null));
        }
        else {
            return new Promise<PageHtmlInformation>(resolve => resolve(result.data as PageHtmlInformation));
        }
    }
}