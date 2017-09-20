import { Injectable } from '@angular/core';
import { CanLoad, CanActivate, Router } from '@angular/router';

@Injectable()
export class AdminGuard implements CanActivate, CanLoad {

    constructor(private router: Router) {

    }
    canLoad(): boolean {
        this.router.navigate(['permissiondenied', 'This feature is restricted.', 'false'], { skipLocationChange: true})
        return false;
    }
    canActivate(): boolean {
        return false;
    }
}