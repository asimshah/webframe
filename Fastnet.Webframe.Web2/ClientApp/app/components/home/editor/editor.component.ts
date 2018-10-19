
import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { HomeComponent } from '../home.component';
import { Router, ActivatedRoute, Event } from '@angular/router';
import { PageService } from '../../shared/page.service';
import { AuthenticationService } from '../../authentication/authentication.service';
import { AdminGuard } from '../../routeguards/admin-guard.service';
//import { ContentBrowserComponent } from './content-browser.component';
//import { PageType } from './editor.service';
import { ContentBrowserComponent } from '../../shared/content-browser.component';
import { PageType } from '../../shared/editor.service';
import { MemberGuard } from '../../routeguards/member-guard.service';


@Component({
    selector: 'webframe-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['../home.component.scss', './editor.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class EditorComponent extends HomeComponent {
    PageType = PageType;
    @ViewChild(ContentBrowserComponent) contentBrowser: ContentBrowserComponent;
    contentBrowserOpen: boolean = false;
    editMode: boolean = false;

    constructor(router: Router,
        route: ActivatedRoute,
        pageService: PageService,
        authenticationService: AuthenticationService,
        adminGuard: AdminGuard, memberGuard: MemberGuard) {
        super(router, route, pageService, authenticationService, adminGuard, memberGuard);
        this.isEditorComponent = true;
        //console.log(`editor component`);
    }
    async ngOnInit() {
        //console.log(`EditorComponent: ${this.router.url}`);
        let id = +this.router.url.slice(6);// strip off leading /edit/
        if (id !== 0) {
            this.pageId = id;
        }
        this.navigatedHere();
    }
    async onSideContentChanged() {
        await this.loadPages(this.pageId);
    }
    protected async navigatedHere() {
        //console.log(`EditorComponent: navigatedHere()`);
        if (this.pageId) {
            await this.loadPages(this.pageId);
        } else {
            await this.loadPages();
        }
    }
    onEditPanelClick(e: MouseEvent) {
        //e.preventDefault();
        e.stopPropagation();
    }
    onOpenSiteContentBrowser() {
        //this.dialogService.open("site-content-browser");
        this.contentBrowser.open();
    }
    onCloseSiteContentBrowser() {
        //this.dialogService.close("site-content-browser");
    }
    async onSitePanelClick(e: MouseEvent) {
        //console.log(`editor component: sitepanel click, edit mode = ${this.editMode}`);
        if (this.editMode) {
            //console.log(`stopping propagation`);
            e.stopPropagation();
        }
        else {
            //console.log(`calling base method`);
            super.onSitePanelClick(e);
        }
    }

    isBannerPageEditable(): boolean {
        if (this.current != null) {
            return this.current.bannerPanelEditable;
        }
        return false;
    }
    isLeftPageEditable(): boolean {
        if (this.current != null) {
            return this.current.leftPanelEditable;
        }
        return false;
    }
    isRightPageEditable(): boolean {
        if (this.current != null) {
            return this.current.rightPanelEditable;
        }
        return false;
    }
}

