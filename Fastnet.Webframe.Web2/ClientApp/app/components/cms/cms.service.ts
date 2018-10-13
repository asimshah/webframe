import { Injectable } from '@angular/core';
import { BaseService } from '../shared/base.service';
import { Http } from '@angular/http';

export class MailItem {
    id: number;
    failuer: string;
    from: string;
    mailDisabled: boolean;
    mailTemplate: string;
    recordedOn: string;
    redirected: boolean;
    redirectedTo: string;
    subject: string;
    to: string;
    remark: string;
    combinedDescription: string;
}

@Injectable()
export class CmsService extends BaseService {
    constructor(http: Http) {
        super(http);
    }
    async getMailHistory(): Promise<MailItem[]> {
        let query = `content/get/mailhistory`;
        return new Promise<MailItem[]>(async resolve => {
            let dr = await this.query(query);
            if (dr.success) {
                resolve(dr.data);
            } else {
                resolve([]);
            }
        });
    }
    async getMailBody(m: MailItem): Promise<string> {
        let query = `content/get/mail/body/${m.id}`;
        return new Promise<string>(async resolve => {
            let dr = await this.query(query);
            resolve(dr.data);
        });
    }
}
