import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'permission-denied',
    templateUrl: './permissiondenied.component.html',
    styleUrls: ['./permissiondenied.component.scss']
})
export class PermissionDeniedComponent {
    msg: string;
    allowLogin: boolean;
    private sub: any;
    constructor(private route: ActivatedRoute, private router: Router) {
        //let text = JSON.stringify(activatedRoute);
        console.log(`PermissionComponent`);
        this.allowLogin = false;
    }
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.msg = params['msg'];
            if (Object.keys(params).indexOf('allowLogin') !== -1) {
                let val: string = params['allowLogin'];
                val = val.toLowerCase();
                if (val === "true") {
                    this.allowLogin = true;
                }
            }
            console.log(`PermissionDeniedComponent received ${this.msg}, allowLogin ${this.allowLogin}`);
        });
    }
    onGoback(): void {
        this.router.navigate(['home']);
    }
}
