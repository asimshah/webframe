import { Injectable } from '@angular/core';
import { CanLoad, CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class EditorGuard implements CanActivate, CanLoad {
    constructor(private router: Router, private authenticationService: AuthenticationService) {
        //console.log(`EditorGuard: constructor()`);
    }
    canLoad() {
        //console.log(`editor-guard.canLoad()`);
        return this.checkAccess();
    }
    canActivate() {
        //console.log(`editor-guard.canActivate()`);
        return this.checkAccess();
    }
    private checkAccess(): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            let isEditor = await this.authenticationService.isEditor();
            if (!isEditor) {
                //console.log(`permission denied`);
                this.router.navigate(['permissiondenied', 'This feature is restricted.', 'false'], { skipLocationChange: true });
                resolve(false);
            } else {
                //console.log(`permission granted`);
                resolve(true);
            }
        });
    }
}