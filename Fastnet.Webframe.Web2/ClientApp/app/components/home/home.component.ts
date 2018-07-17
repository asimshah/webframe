import { Component, OnInit, ViewEncapsulation, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';

//import { PageModule } from '../page/page.module';
import { PageKeys, PageService } from '../shared/page.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { AdminGuard } from '../routeguards/admin-guard.service';

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
        private authenticationService: AuthenticationService,
        private adminGuard: AdminGuard) {
        this.canQueryPages = false;// !this.RunningInNode();
    }
    async ngOnInit() {
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
                let routeName = parts[0].toLocaleLowerCase();
                switch (routeName) {
                    case "home":
                    case "login":
                        this.routeTo(e, routeName);
                        break;
                    //case "logout": route this back to server as we need to ensure full reset
                    case "membership":
                    case "cms":
                    case "designer":
                    case "booking":
                        if (this.adminGuard.canActivate()) {
                            this.routeTo(e, routeName);
                        } else {
                            e.stopPropagation();
                            e.preventDefault();
                            this.router.navigate(["permissiondenied", "This feature is restricted", "false"]);
                        }
                        break;
                    case "page":
                        e.preventDefault();
                        let targetPageId = parseInt(parts[1]);
                        this.loadPages(targetPageId);
                        break;
                    default:
                        this.router.navigateByUrl(link.href)
                        break;
                }
                //if (parts[0] === "page") {
                //    e.preventDefault();
                //    let targetPageId = parseInt(parts[1]);
                //    this.loadPages(targetPageId);
                //} else {
                //    this.router.navigateByUrl(link.href)
                //}
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
    private routeTo(e: any, routeName: string) {
        console.log(`routing to ${routeName}`);
        e.stopPropagation();
        e.preventDefault();
        this.router.navigate([routeName]);
    }
}
