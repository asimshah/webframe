import { Injectable } from '@angular/core';
import { CanLoad, CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class MemberGuard implements CanActivate, CanLoad {

    constructor(private router: Router, private authenticationService: AuthenticationService) {

    }
    canLoad() {
        return this.checkAccess();
    }
    canActivate() {
        return this.checkAccess();
    }
    private checkAccess(): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            let isLoggedIn = await this.authenticationService.isAuthenticated();
            if (!isLoggedIn) {
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