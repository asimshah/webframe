import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageService } from '../shared/page.service';

@Component({
    selector: 'permission-denied',
    templateUrl: './permissiondenied.component.html',
    styleUrls: ['./permissiondenied.component.scss']
})
export class PermissionDeniedComponent {
    public bannerPageId: number | null;
    msg: string;
    allowLogin: boolean;
    private sub: any;
    constructor(private route: ActivatedRoute, private router: Router,
    private pageService: PageService) {
        this.allowLogin = false;
    }
    async ngOnInit() {
        this.bannerPageId = await this.pageService.getDefaultBanner();
        this.sub = this.route.params.subscribe(params => {
            this.msg = params['msg'];
            if (Object.keys(params).indexOf('allowLogin') !== -1) {
                let val: string = params['allowLogin'];
                val = val.toLowerCase();
                if (val === "true") {
                    this.allowLogin = true;
                }
            }
           // console.log(`PermissionDeniedComponent received ${this.msg}, allowLogin ${this.allowLogin}`);
        });
    }
    public getPageId() {
        return this.bannerPageId;
    }
    onGoback(): void {
        this.router.navigate(['home']);
    }
}
