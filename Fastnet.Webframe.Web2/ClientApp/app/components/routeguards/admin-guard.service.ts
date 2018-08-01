import { Injectable } from '@angular/core';
import { CanLoad, CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class AdminGuard implements CanActivate, CanLoad {
    constructor(private router: Router, private authenticationService: AuthenticationService) {
        console.log(`AdminGuard: constructor()`);
    }
    canLoad() {
        console.log(`admin-guard.canLoad()`);
        return this.checkAccess();
    }
    canActivate() {
        console.log(`admin-guard.canActivate()`);
        return this.checkAccess();
    }
    private checkAccess(): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            let isAdmin = await this.authenticationService.isAdministrator();
            if (!isAdmin) {
                console.log(`permission denied`);
                this.router.navigate(['permissiondenied', 'This feature is restricted.', 'false'], { skipLocationChange: true });
                resolve(false);
            } else {
                console.log(`permission granted`);
                resolve(true);
            }
        });
    }
}