
import { Component, ViewEncapsulation } from '@angular/core';
import { HomeComponent } from '../home.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDialogService } from '../../modaldialog/modal-dialog.service';
import { PageService } from '../../shared/page.service';
import { AuthenticationService } from '../../authentication/authentication.service';
import { AdminGuard } from '../../routeguards/admin-guard.service';

@Component({
        selector: 'webframe-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['../home.component.scss', './editor.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class EditorComponent extends HomeComponent {
    constructor(router: Router,
        route: ActivatedRoute,
        dialogService: ModalDialogService,
        pageService: PageService,
        authenticationService: AuthenticationService,
        adminGuard: AdminGuard) {
        super(router, route, dialogService, pageService, authenticationService, adminGuard);
        this.isEditorComponent = true;
        console.log(`editor component`);
    }
    async ngOnInit() {
        console.log(`EditorComponent: ${this.router.url}`);
        let id = +this.router.url.slice(6);// strip off leading /edit/
        if (id !== 0) {
            this.pageId = id;
        }
        this.navigatedHere();
        //console.log(`EditorComponent: ngOnInit()`);
        //this.idSub = this.router.routerState.p
    }
    protected async navigatedHere() {
        console.log(`EditorComponent: navigatedHere()`);
        if (this.pageId) {
            await this.loadPages(this.pageId);
        } else {
            await this.loadPages();
        }
    }
    onOpenSiteContentBrowser() {
        this.dialogService.open("site-content-browser");
    }
    onCloseSiteContentBrowser() {
        this.dialogService.close("site-content-browser");
    }
    //onSitePanelClick(e: Event) {
    //    console.log(`editor component: sitepanel click ${e.currentTarget}, ${e.target}`);
    //    e.stopPropagation();
    //    e.preventDefault();
    //}
}

