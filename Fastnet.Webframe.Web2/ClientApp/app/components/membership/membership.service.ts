import { Injectable } from "@angular/core";
import { BaseService } from "../shared/base.service";
import { Http } from "@angular/http";
import { Member } from "../shared/common.types";

export class ServiceResult {
    success: boolean;
    errors: string[]
}

@Injectable()
export class MembershipService extends BaseService {
    constructor(http: Http) {
        super(http);
    }
    async getMember(emailAddress: string): Promise<Member> {
        let query = `membershipapi/get/member/${emailAddress}`;
        return this.queryFromDataResult<Member>(query);
    }
    async getMembers(searchText: string, prefix: boolean): Promise<Member[]> {
        let query = this.buildSearchQuery(searchText, prefix);
        return this.queryFromDataResult<Member[]>(query);
    }
    async createNewMember(member: Member): Promise<ServiceResult> {
        let query = "membershipapi/create/member";
        return this.postMemberCreateUpdate(query, member);
    }
    async updateMember(member: Member): Promise<ServiceResult> {
        let query = "membershipapi/update/member";
        return this.postMemberCreateUpdate(query, member);
    }
    async deleteMember(member: Member): Promise<void> {
        let query = "membershipapi/delete/member";
        return new Promise<void>(async resolve => {
            let result = await this.post(query, member);
            resolve();
        });
    }
    async activateMember(member: Member): Promise<void> {
        let query = `membershipapi/activate/member/${member.id}`;
        return new Promise<void>(async resolve => {
            let dr = await this.query(query);
            resolve();
        });
    }
    async sendActivationEmail(member: Member): Promise<void> {
        let query = `membershipapi/send/activationEmail`;
        return new Promise<void>(async resolve => {
            let dr = await this.post(query, member);
            resolve();
        });
    }
    async sendPasswordResetEmail(member: Member): Promise<void> {
        let query = `membershipapi/send/passwordResetEmail`;
        return new Promise<void>(async resolve => {
            let dr = await this.post(query, member);
            resolve();
        });
    }
    async validateEmailAddress(address: string): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            let dr = await this.query(`membershipapi/validate/email/${address}`);
            resolve(dr.data === true);
        });
    }
    async validateProperty(name: string, values: string[]): Promise<{success: boolean, message: string}> {
        return new Promise<{ success: boolean, message: string }>(async resolve => {
            let result = await this.post(`membershipapi/validate/prop/${name}`, values);
            let success = result.data;
            resolve({ success: success, message: result.message });
        });
    }
    protected buildSearchQuery(searchText: string, prefix: boolean): string {
        if (prefix && searchText === "#") {
            searchText = encodeURIComponent(searchText);// "sharp";
        }
        let query = prefix ? `membershipapi/get/members/${searchText}/true` : `membershipapi/get/members/${searchText}`;
        console.log(`search query is ${query}`);
        return query;
    }
    private postMemberCreateUpdate(query: string, member: Member): Promise<ServiceResult> {
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
}

