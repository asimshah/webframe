import { Injectable } from "@angular/core";
import { BaseService } from "../shared/base.service";
import { Http } from "@angular/http";
import { Member } from "../shared/common.types";

export class CreateResult {
    success: boolean;
}

@Injectable()
export class MembershipService extends BaseService {
    constructor(http: Http) {
        super(http);
    }
    async getMembers(searchText: string, prefix: boolean): Promise<Member[]> {
        let query = this.buildSearchQuery(searchText, prefix);
        return this.queryFromDataResult<Member[]>(query);
    }
    async createNewMember(member: Member): Promise<CreateResult> {
        let query = "membershipapi/create/member";
        return new Promise<CreateResult>(async resolve => {
            let result = await this.post(query, member);
            let cr = new CreateResult();
            if (result.success) {
                cr.success = true;
            } else {
                cr.success = false;
            }
            resolve(cr);
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
}

