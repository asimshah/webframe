import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { PageService, PageHtmlInformation } from '../shared/page.service';

@Component({
    selector: 'webframe-page',
    templateUrl: './page.component.html',
    styleUrls: ['./page.component.scss']
})
export class PageComponent {
    innerHtml: string;
    private _pageId: number | null = null;
    get pageId(): number | null {
        return this._pageId;
    }
    @Input() set pageId(val: number | null) {
        this._pageId = val;
        this.onPageIdChanged();
    }
        
    constructor(private pageService: PageService, private sanitizer : DomSanitizer) {
        //console.log("PageComponent constructor");
        this.pageId = null;
    }
    onPageIdChanged() {
        // I don't understand how pageId is undefined at the start (given that it is is initialised to null)
        if (this.pageId === null || this.pageId === undefined) {
            //console.log("pageId is null");
        } else
        {
            //console.log(`need to query for page ${this.pageId}`);
            this.loadPage();
        }
    }
    private async loadPage() {
        let r = await this.pageService.getPage(<number>this.pageId);
        if (r !== null) {
            this.innerHtml = <string>this.sanitizer.bypassSecurityTrustHtml(r.htmlText);
        }
    }
}
