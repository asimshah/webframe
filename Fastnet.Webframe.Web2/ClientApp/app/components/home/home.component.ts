import { Component, OnInit, ViewEncapsulation, AfterViewInit, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';

import { PageKeys, PageService } from './page.service';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
    private routerSub: Subscription;
    private canQueryPages: boolean = false;
    private current: PageKeys | null;
    constructor(private router: Router, private pageService: PageService, private zone: NgZone) {
        this.canQueryPages = false;// !this.RunningInNode();
        //if (this.canQueryPages) {
        //    this.routerSub = this.router.events.subscribe((evt) => {
        //        console.log("home component router event occurred");
        //        if (evt instanceof NavigationEnd) {
        //            this.navigatedHere();
        //        }
        //    });
        //}
    }
    ngOnInit() {
        if (document !== undefined) {
            this.loadCustomCss();
            this.navigatedHere();
        }
        if(this.canQueryPages) {
            if (this.routerSub === null) {
                this.router.events.subscribe((evt) => {
                    console.log("home component router event occurred");
                    if (evt instanceof NavigationEnd) {
                        this.navigatedHere();
                    }
                });
            }
        }
        console.log("home component ngOnInit() finished");
    }
    private loadCustomCss() {
        // I can't load this css in the normal way using a link tag in the
        // _Layout.cshtml because all the remain styles are created as <style> elements by the angular environment
        // and added **after the end of the <head> containing element**
        // this means that these created styles take precedence over the custom.css which then
        // means that custom.css rules are overridden by the webframe rules built into the app
        // which is the reverse of what I require.
        // so I load it here at run time and put it in the right place (after all the other rules)
        let headElement: HTMLHeadElement = document.getElementsByTagName("head")[0];
        let customLink = document.createElement("link");
        customLink.rel = "stylesheet";
        customLink.href = "/css/custom.css";
        headElement.appendChild(customLink);
    }
    private async navigatedHere() {
        console.log("user navigated here to homecomponent")
        this.current = await this.pageService.getPageKeys();
        console.log(JSON.stringify(this.current));
    }
    private async onSitePanelClick(e: Event) {
        console.log(`sitepanel click`);
        let target = e.target;
        let elem: Element = target as Element;
        if (elem.localName === 'a') { 
            let localUrl = `${window.location.protocol}//${window.location.host}`;
            let link = elem as HTMLAnchorElement;
            console.log(`a tag clicked, href = ${link.href} [${localUrl}]`);
            if (link.href.startsWith(localUrl)) {
                e.preventDefault();
                let path = link.href.substr(localUrl.length + 1);
                console.log(`local href = ${path}`);
                let parts = path.split("/");
                if (parts[0] === "page") {
                    let targetPageId = parseInt(parts[1]);
                    this.current = await this.pageService.getPageKeys(targetPageId);
                }

            } 

        }
    }
    private getBannerPageId(): number | undefined {
        if (this.current != null) {
            return this.current.bannerPanelPageId;
        }
        return;
    }
    private getLeftPageId(): number | undefined {
        if (this.current != null) {
            return this.current.leftPanelPageId;
        }
        return;
    }
    private getRightPageId(): number | undefined {
        if (this.current != null) {
            return this.current.rightPanelPageId;
        }
        return;
    }
    private getCentrePageId(): number | undefined {
        if (this.current != null) {
            return this.current.centrePanelPageId;
        }
        return;
    }
    private RunningInNode(): boolean {
        let r = false;
        try {
            r = window === undefined;
            console.log(`running in node = ${r}`);
        } catch (x) { };
        return r;
    }
}
