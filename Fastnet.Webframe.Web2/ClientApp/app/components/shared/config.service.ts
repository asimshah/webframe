import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { BaseService } from './base.service';
import { ClientCustomisation } from './config.types';

declare var platform: any;

@Injectable()
export class ConfigService extends BaseService {
    constructor(http: Http) {
        super(http);
    }
    public async postCi() {
        return await this.post("configapi/post/ci", platform);
    }
    //public async getConfiguration(): Promise<ClientCustomisation> {
    //    let query = `/configapi/get/configuration`;
    //    let result = await this.query(query);
    //    return new Promise<ClientCustomisation>(resolve => resolve(result.data));
    //}
}