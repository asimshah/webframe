import { Injectable } from '@angular/core';
import { BaseService } from '../shared/base.service';
import { Http } from '@angular/http';

export class Email {
    destination: string = "";
    subject: string = "";
    body: string = "";
}
export class MemberHistory {
    id: number;
    recordedOn: string;
    actionName: string;
    emailAddress: string;
    fullName: string;
    actionBy: string;
    hasPropertyChanged: boolean;
    propertyChanged: string;
    oldValue: string;
    newValue: string;
}
export class MailItem {
    id: number;
    failure: string;
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
    async getMembershipHistory(): Promise<MemberHistory[]> {
        let query = `content/get/membershiphistory`;
        return new Promise<MemberHistory[]>(async resolve => {
            let dr = await this.query(query);
            if (dr.success) {
                resolve(dr.data);
            } else {
                resolve([]);
            }
        });
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
    async sendEmail(mail: Email) {
        let query = "content/send/mail";
        return new Promise<void>(async resolve => {
            let result = await this.post(query, mail);
            resolve();
        });
    }
}
