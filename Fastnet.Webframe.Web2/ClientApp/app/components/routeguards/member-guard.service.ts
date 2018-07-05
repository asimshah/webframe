import { Injectable } from '@angular/core';
import { CanLoad, CanActivate, Router } from '@angular/router';

@Injectable()
export class MemberGuard implements CanActivate, CanLoad {

    constructor(private router: Router) {

    }
    canLoad(): boolean {
        this.router.navigate(['permissiondenied', 'Restricted to users who have logged in.', 'true'], { skipLocationChange: true})
        return true;
    }
    canActivate(): boolean {
        return true;
    }
}