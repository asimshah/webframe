import { MembershipService } from "../membership.service";
import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { DWHMember } from "./dwhmembership.types";

@Injectable()
export class DWHMembershipService extends MembershipService {
    constructor(http: Http) {
        super(http);
    }
    async getMembers(searchText: string, prefix: boolean): Promise<DWHMember[]> {
        let query = this.buildSearchQuery(searchText, prefix);
        return this.queryFromDataResult<DWHMember[]>(query);
    }
}