import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { BaseService } from '../shared/base.service';
import { Member } from '../shared/common.types';

export class Credentials {
    public emailAddress: string;
    public password: string;
}
export enum LoginResult {
    Succeeded,
    CredentialsInvalid,
    AccountNotActivated,
    AccountIsBarred,
    Unknown
}
class userData {
    member: Member;
    groups: string[];
}
@Injectable()
export class AuthenticationService extends BaseService {
    currentUser: userData | null = null;
    initialised: boolean = false;
    constructor(http: Http) {
        super(http);
        //setTimeout(this.sync, 10);
        console.log("new AuthenticationService instance created");
    }
    public async login(credentials: Credentials): Promise<LoginResult> {
        let lr: LoginResult = LoginResult.Unknown;
        // *NB* /user/login returns a member which may be customised (ie. an instance from a class derived from Member)
        // however, as the additional features of any derived class are not requirted - at least for now - this
        // method instantiates a userData with a Member instance
        let result = await this.post("user/login", credentials);
        if (!result.success) {
            console.log(`login failed: ${result.exceptionMessage}`);
            switch (result.exceptionMessage) {
                case "InvalidCredentials":
                    lr = LoginResult.CredentialsInvalid;
                    break;
                case "AccountNotActivated":
                    lr = LoginResult.AccountNotActivated;
                    break;
                case "AccountIsBarred":
                    lr = LoginResult.AccountIsBarred;
                    break;
                default:
                    lr = LoginResult.Unknown;
                    break;
            }
        } else {
            lr = LoginResult.Succeeded;
            this.currentUser = result.data;
        }
        console.log(`lr=${lr}, ${JSON.stringify(this.currentUser)}`);
        return new Promise<LoginResult>(resolve => resolve(lr));
    }
    public async logout(): Promise<void> {
        let result = await this.query("user/logout");
    }
    public isAuthenticated(): boolean {
        return this.currentUser !== null;
    }
    public isAdministrator() {
        return this.isMemberOf("Administrators");
    }
    public isMemberOf(group: string): boolean {
        let r = false;
        if (this.currentUser !== null) {
            if (this.currentUser.groups.find(x => x === group)) {
                r = true;
            }
        }
        console.log(`${group} against ${JSON.stringify(this.currentUser)}, result = ${r}`);
        return r;
    }
    //public async isMemberOf(group: string): Promise<boolean> {
    //    return new Promise<boolean>(async resolve => {
    //        if (!this.initialised) {
    //            let result = await this.query("user/sync");
    //            this.currentUser = result.data;
    //            this.initialised = true;
    //        }
    //        let r = false;
    //        if (this.currentUser !== null) {
    //            if (this.currentUser.groups.find(x => x === group)) {
    //                r = true;
    //            }
    //        }
    //        console.log(`${group} against ${JSON.stringify(this.currentUser)}`);
    //        return r;
    //    });
    //}
    public async sync() {
        if (!this.initialised) {
            let result = await this.query("user/sync");
            this.currentUser = result.data;
            this.initialised = true;
        }
    }
}