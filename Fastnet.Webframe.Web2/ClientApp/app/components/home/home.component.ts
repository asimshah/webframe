import { Component, OnInit, ViewEncapsulation, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';

import { PageKeys, PageService } from '../shared/page.service';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, OnDestroy {
    private routerSub: Subscription;
    private canQueryPages: boolean = false;
    private current: PageKeys | null;
    private pageId: number;
    constructor(private router: Router,
        private route: ActivatedRoute,
        private pageService: PageService,
        private authenticationService: AuthenticationService) {
        this.canQueryPages = false;// !this.RunningInNode();
    }
    async ngOnInit() {
        //this.loadCustomCss();
        console.log(`HomeComponent: ${this.router.url}, ${this.route.snapshot.url[0].path}`);
        if (this.route.snapshot.url[0].path.toLowerCase() == 'logout') {
            await this.authenticationService.logout();
            this.router.navigate(['home']); // we need this to ensure that the logout has completed
        }
        this.route.params.subscribe(params => {
            this.pageId = +params['id'];
        });
        this.navigatedHere();
        if (this.canQueryPages) {
            if (this.routerSub === null) {
                this.routerSub = this.router.events.subscribe((evt) => {
                    //console.log("home component router event occurred");
                    if (evt instanceof NavigationEnd) {
                        this.navigatedHere();
                    }
                });
            }
        }
        //console.log("home component ngOnInit() finished");
    }
    ngOnDestroy() {

    }
    //private loadCustomCss() {
    //    // I can't load this css in the normal way using a link tag in the
    //    // _Layout.cshtml because all the remain styles are created as <style> elements by the angular environment
    //    // and added **after the end of the <head> containing element**
    //    // this means that these created styles take precedence over the custom.css which then
    //    // means that custom.css rules are overridden by the webframe rules built into the app
    //    // which is the reverse of what I require.
    //    // so I load it here at run time and put it in the right place (after all the other rules)
    //    try {
    //        let headElement: HTMLHeadElement = document.getElementsByTagName("head")[0];
    //        let customLink = document.createElement("link");
    //        customLink.rel = "stylesheet";
    //        customLink.href = "/css/custom.css";
    //        headElement.appendChild(customLink);
    //    } catch (e) {
    //        console.log("cutsom css not loaded")
    //    }
    //}
    private async loadPages(pageId?: number) {
        this.current = await this.pageService.getPageKeys(pageId);
        if (this.current === null) {
            this.router.navigate(['pagenotfound']);
        }
    }

    private async navigatedHere() {
        //console.log(`user navigated here to homecomponent, pageId is ${this.pageId}`)
        if (isNaN(this.pageId)) {
            await this.loadPages();
        } else {
            await this.loadPages(this.pageId);
        }
        //console.log(JSON.stringify(this.current));

    }
    onSitePanelClick(e: Event) {
        //console.log(`sitepanel click1 ${e.currentTarget}, ${e.target}`);
        let target = e.target;
        let elem: Element = target as Element;
        //console.log(`sitepanel click2 ${elem.outerHTML}`);
        let aTag = elem.closest("a");
        if (aTag != null) {
            //console.log(`sitepanel click3 ${aTag.outerHTML}`);
            let localUrl = `${window.location.protocol}//${window.location.host}`;
            let link = aTag as HTMLAnchorElement;
            //console.log(`a tag clicked, href = ${link.href} [${localUrl}]`);
            if (link.href.startsWith(localUrl)) {
                
                let path = link.href.substr(localUrl.length + 1);
                //console.log(`local href = ${path}`);
                let parts = path.split("/");
                if (parts[0] === "page") {
                    e.preventDefault();
                    let targetPageId = parseInt(parts[1]);
                    this.loadPages(targetPageId);
                } else {
                    //console.log(`navigate to ${link.href}`);
                    this.router.navigateByUrl(link.href)
                }
            }

        }
    }
    getBannerPageId(): number | undefined {
        if (this.current != null) {
            return this.current.bannerPanelPageId;
        }
        return;
    }
    getLeftPageId(): number | undefined {
        if (this.current != null) {
            return this.current.leftPanelPageId;
        }
        return;
    }
    getRightPageId(): number | undefined {
        if (this.current != null) {
            return this.current.rightPanelPageId;
        }
        return;
    }
    getCentrePageId(): number | undefined {
        if (this.current != null) {
            return this.current.centrePanelPageId;
        }
        return;
    }
}
