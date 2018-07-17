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
        //let isAdmin = this.authenticationService.isAdministrator();
        //if (!isAdmin) {
        //    console.log(`admin-guard.canLoad(): permission denied`);
        //    this.router.navigate(['permissiondenied', 'This feature is restricted.', 'false'], { skipLocationChange: true });
        //    return false;
        //} else {
        //    console.log(`admin-guard.canLoad(): permission granted`);
        //    return true;
        //}
        //return true;
    }
    canActivate(): boolean {
        console.log(`admin-guard.canActivate()`);
        return this.checkAccess();
        //let isAdmin = this.authenticationService.isAdministrator();
        //if (!isAdmin) {
        //    console.log(`admin-guard.canActivate(): permission denied`);
        //    this.router.navigate(['permissiondenied', 'This feature is restricted.', 'false'], { skipLocationChange: true });
        //    return false;
        //} else {
        //    console.log(`admin-guard.canActivate(): permission granted`);
        //    return true;
        //}

    }
    private checkAccess(): boolean {
        let isAdmin = this.authenticationService.isAdministrator();
        if (!isAdmin) {
            console.log(`permission denied`);
            this.router.navigate(['permissiondenied', 'This feature is restricted.', 'false'], { skipLocationChange: true });
            return false;
        } else {
            console.log(`permission granted`);
            return true;
        }
    }
}