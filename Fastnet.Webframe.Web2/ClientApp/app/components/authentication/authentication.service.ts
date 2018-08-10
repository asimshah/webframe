import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { BaseService, ServiceResult } from '../shared/base.service';
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
export class userData {
    member: Member;
    groups: string[];
}
@Injectable()
export class AuthenticationService extends BaseService {
    currentUser: userData | null = null;
    initialised: boolean = false;
    constructor(http: Http) {
        super(http);
        //setTimeout(async () => { await this.sync(); }, 10);
        console.log("new AuthenticationService instance created");
    }
    async register(member: Member): Promise<ServiceResult> {
        let query = "user/register";
        return new Promise<ServiceResult>(async resolve => {
            let result = await this.post(query, member);
            if (result.success) {
                resolve({ success: true, errors: [] });
            } else {
                let errors = result.message.split("|");
                resolve({ success: false, errors: errors });
            }
        });

    }
    async activate(id: string, code: string): Promise<boolean> {
        let query = `user/activate/${id}/${code}`;
        return new Promise<boolean>(async resolve => {
            let sr = await this.query(query);
            resolve(sr.success);
        });
    }
    async sendPasswordReset(emailAddress: string) {
        let query = `user/send/passwordreset`;
        return new Promise<void>(async resolve => {
            var data = { emailAddress: emailAddress };
            await this.post(query, data);
            resolve();
        });
    }
    async getMemberForPasswordChange(id: string, code: string): Promise<Member | null> {
        let query = `user/get/member/${id}/${code}`;
        return new Promise<Member | null>(async resolve => {
            let sr = await this.query(query);
            if (sr.success) {
                resolve(sr.data as Member);
            }
            else {
                resolve(null);
            }
        });
    }
    async changePassword(member: Member) {
        let query = "user/change/password";
        return new Promise<void>(async resolve => {
            let result = await this.post(query, member);
            resolve();
        });
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
        if (this.currentUser) {
            console.log(`${this.currentUser.member.name} logged out`);
        } else {
            console.log(`<no user> logged out`);
        }
        this.currentUser = null;
    }
    public async isAuthenticated(): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            await this.sync();
            resolve(this.currentUser !== null);
        });
    }
    public async isAdministrator() {
        return this.isMemberOf("Administrators");
    }
    public async isEditor(): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            let result = await this.isMemberOf("Administrators");
            if (!result) {
                result = await this.isMemberOf("Editors");
            }
            //console.log(`isEditor result is ${result}`);
            resolve(result);
        });
    }
    public async isMemberOf(group: string): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            await this.sync();
            let r = false;
            if (this.currentUser !== null) {
                if (this.currentUser.groups.find(x => x === group)) {
                    r = true;
                }
            }
            //console.log(`${group} against ${JSON.stringify(this.currentUser)}, result = ${r}`);
            resolve(r);
        });
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