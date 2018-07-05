import { Injectable } from '@angular/core';
import { CanLoad, CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class AdminGuard implements CanActivate, CanLoad {
    constructor(private router: Router, private authenticationService: AuthenticationService) {

    }
    canLoad(): boolean {
        if (!this.authenticationService.isAdministrator()) {
            this.router.navigate(['permissiondenied', 'This feature is restricted.', 'false'], { skipLocationChange: true });
        }
        return true;
    }
    canActivate(): boolean {
        return true;
    }
}