import { Injectable } from "@angular/core";
import { BaseService } from "../shared/base.service";
import { Http } from "@angular/http";
import { Member } from "./membership.types";

@Injectable()
export class MembershipService extends BaseService {
    constructor(http: Http) {
        super(http);
    }
    async getMembers(searchText: string, prefix: boolean): Promise<Member[]> {
        let query = this.buildSearchQuery(searchText, prefix);
        return this.queryFromDataResult<Member[]>(query);
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

