import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { BaseService } from '../shared/base.service';

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
@Injectable()
export class AuthenticationService extends BaseService {
    constructor(http: Http) {
        super(http);
        //console.log("AuthenticationService constructor");
    }
    public async login(credentials: Credentials): Promise<LoginResult> {
        let lr: LoginResult = LoginResult.Unknown;
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
        }
        return new Promise<LoginResult>(resolve => resolve(lr));
    }
    public async logout(): Promise<void> {
        let result = await this.query("user/logout");
    }
}