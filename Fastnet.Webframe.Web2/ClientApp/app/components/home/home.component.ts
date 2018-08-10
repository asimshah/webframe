import { Component, OnInit, ViewEncapsulation, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, NavigationExtras } from '@angular/router';
import { DOCUMENT } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';

//import { PageModule } from '../page/page.module';
import { PageKeys, PageService } from '../shared/page.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { AdminGuard } from '../routeguards/admin-guard.service';
import { Member } from '../shared/common.types';
import { ModalDialogService } from '../modaldialog/modal-dialog.service';

// Notes
// 1. This component handles loading of webframe pages
// 2. it ALSO handles all the content editing stuff.
// 3. Consequently a lot of code is loaded for people who do not use editing


@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, OnDestroy {
    protected isEditorComponent: boolean = false;
    public member: Member;
    public isEditor: boolean = false;
    private routerSub: Subscription;
    protected idSub: Subscription;
    //private canQueryPages: boolean = false;
    private current: PageKeys | null;
    protected pageId: number | undefined;
    constructor(protected router: Router,
        protected route: ActivatedRoute,
        protected dialogService: ModalDialogService,
        protected pageService: PageService,
        protected authenticationService: AuthenticationService,
        protected adminGuard: AdminGuard) {
        this.isEditorComponent = false;
        //this.canQueryPages = false;// !this.RunningInNode();
    }
    async ngOnInit() {
        console.log(`HomeComponent: ${this.router.url}, ${this.route.snapshot.url[0].path}`);
        //if (this.route.snapshot.url[0].path.toLowerCase() == 'logout') {
        //    await this.authenticationService.logout();
        //    this.router.navigate(['home']); // we need this to ensure that the logout has completed
        //}
        this.idSub = this.route.params.subscribe(params => {
            this.pageId = +params['id'];
            console.log(`HomeComponent: pageId set to ${this.pageId}`);

        });
        this.navigatedHere();
        //if (this.canQueryPages) {
        //    if (this.routerSub === null) {
        //        this.routerSub = this.router.events.subscribe((evt) => {
        //            //console.log("home component router event occurred");
        //            if (evt instanceof NavigationEnd) {
        //                this.navigatedHere();
        //            }
        //        });
        //    }
        //}

        let authenticated = await this.authenticationService.isAuthenticated();
        if (authenticated === true && this.authenticationService.currentUser) {
            this.member = this.authenticationService.currentUser.member;
            console.log(`home component ngOnInit(): member = ${this.member.name}`);
        }
        this.isEditor = await this.authenticationService.isEditor();
        console.log(`home component ngOnInit(): editor = ${this.isEditor}`);
    }
    ngOnDestroy() {
        //this.idSub.unsubscribe();
    }
    protected async loadPages(pageId?: number) {

        this.current = await this.pageService.getPageKeys(pageId);
        if (this.current === null) {
            this.router.navigate(['pagenotfound']);
        } else {
            this.setHistory();
        }
    }

    protected async navigatedHere() {
        console.log(`HomeComponent: navigatedHere()`);
        let isEditor = await this.authenticationService.isEditor();
        if (isEditor) {
            //console.log(`HomeComponent: is editor`);
            let id = this.pageId ? this.pageId : 0;
            //if (!isNaN(this.pageId)) {
            //    id = this.pageId;
            //}
            this.router.navigate(['edit', `${id}`]);
        } else {
            if (this.pageId) {
                await this.loadPages(this.pageId);
            } else {
                await this.loadPages();
            }
            //if (isNaN(this.pageId)) {
            //    await this.loadPages();
            //} else {
            //    await this.loadPages(this.pageId);
            //}
        }
    }
    async onSitePanelClick(e: Event) {
        console.log(`home component: sitepanel click ${e.currentTarget}, ${e.target}`);
        let isEditor = await this.authenticationService.isEditor();
        let target = e.target;
        let elem: Element = target as Element;
        let aTag = elem.closest("a");
        if (aTag != null) {
            let localUrl = `${window.location.protocol}//${window.location.host}`;
            let link = aTag as HTMLAnchorElement;
            if (link.href.startsWith(localUrl)) {
                let path = link.href.substr(localUrl.length + 1);
                let parts = path.split("/");
                let routeName = parts[0].toLocaleLowerCase();
                switch (routeName) {
                    case "home":
                    case "login":
                    case "register":
                    case "resetpassword":
                        this.routeTo(e, routeName);
                        break;
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
                        e.stopPropagation();
                        let targetPageId = parseInt(parts[1]);
                        if (isEditor && this.isEditorComponent === false) {
                            this.router.navigate(['edit', `${targetPageId}`]);
                        } else {
                            this.pageId = targetPageId;
                            this.loadPages(targetPageId);
                        }
                        break;
                    default:
                        this.router.navigateByUrl(link.href)
                        break;
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

    private routeTo(e: any, routeName: string) {
        console.log(`routing to ${routeName}`);
        e.stopPropagation();
        e.preventDefault();
        this.pageId = undefined;
        this.router.navigate([routeName]);
        this.setHistory();
    }
    private setHistory() {
        if (this.isEditorComponent) {
            if (this.pageId) {
                history.pushState("", "title", `/edit/${this.pageId}`);
            } else {
                history.pushState("", "title", `/edit/0`);
            }
        } else {
            if (this.pageId) {
                history.pushState("", "title", `/page/${this.pageId}`);
            } else {
                history.pushState("", "title", `/home`);
            }
        }
    }
}

