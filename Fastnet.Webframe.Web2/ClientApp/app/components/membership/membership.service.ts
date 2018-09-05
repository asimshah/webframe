import { Injectable } from "@angular/core";
import { BaseService, ServiceResult } from "../shared/base.service";
import { Http } from "@angular/http";
import { Member, Group, MemberIdList } from "../shared/common.types";
import { ValidationResult, ControlState, ValidationContext } from "../controls/controls.types";
import { isNullorUndefined, isWhitespaceOrEmpty } from "../controls/controlbase2.type";

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
    async newEmailAddressValidatorAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        return new Promise<ValidationResult>(async resolve => {
            let vr = new ValidationResult();
            if (isNullorUndefined(value) || isWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = `an email address is required`;
            } else if(context === ValidationContext.LostFocus){
                let text: string = value;
                text = text.toLowerCase();
                let r = await this.validateEmailAddress(text);
                if (r === false) {
                    vr.valid = false;
                    vr.message = `this email Address is already in use`;
                }
            }
            resolve(vr);
            //let vr = cs.validationResult;
            //if (vr.valid) {
            //    let text: string = cs.value || "";
            //    if (text.trim().length === 0) {
            //        vr.valid = false;
            //        vr.message = `an Email Address is required`;
            //    } else {
            //        text = text.toLocaleLowerCase();
            //        let r = await this.validateEmailAddress(text);
            //        if (r === false) {
            //            vr.valid = false;
            //            vr.message = `this Email Address is already in use`;
            //        }
            //    }
            //}
            //resolve(cs.validationResult);
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
    //
    // now the group stuff
    //
    async getGroups(parentId?: number): Promise<Group[]> {
        let query = parentId ? `membershipapi/get/groups/${parentId}` : `membershipapi/get/groups`;
        return new Promise<Group[]>(async resolve => {
            let dr = await this.query(query);
            if (dr.success) {
                resolve(dr.data);
            } else {
                resolve([]);
            }
        });
    }
    async getGroupMembers(groupId: number): Promise<Member[]> {
        let query = `membershipapi/get/group/members/${groupId}`;
        return new Promise<Member[]>(async resolve => {
            let dr = await this.query(query);
            if (dr.success) {
                resolve(dr.data);
            } else {
                resolve([]);
            }
        });
    }
    async createGroup(group: Group): Promise<number> {
        let query = `membershipapi/create/group`;
        return new Promise<number>(async resolve => {
            let result = await this.post(query, group); 
            if (result.success) {
                resolve(result.data);
            } else {
                resolve();
            }
        });
    }
    async deleteGroup(group: Group): Promise<void> {
        let query = `membershipapi/delete/group`;
        return new Promise<void>(async resolve => {
            let result = await this.post(query, group);
            resolve();
        });
    }
    async updateGroup(group: Group): Promise<void> {
        let query = `membershipapi/update/group`;
        return new Promise<void>(async resolve => {
            let result = await this.post(query, group);
            resolve();
        });
    }
    async getCandidateMembers(group: Group): Promise<Member[]> {
        let query = `membershipapi/get/candidatemembers/${group.groupId}`;
        return new Promise<Member[]>(async resolve => {
            let dr = await this.query(query);
            if (dr.success) {
                resolve(dr.data);
            } else {
                resolve([]);
            }
        });
    }
    async addGroupMembers(group: Group, list: MemberIdList): Promise<void> {
        let query = `membershipapi/add/groupmembers/${group.groupId}`;
        return new Promise<void>(async resolve => {
            let result = await this.post(query, list);
            resolve();
        });
    }
    async removeGroupMembers(group: Group, list: MemberIdList): Promise<void> {
        let query = `membershipapi/remove/groupmembers/${group.groupId}`;
        return new Promise<void>(async resolve => {
            let result = await this.post(query, list);
            resolve();
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

