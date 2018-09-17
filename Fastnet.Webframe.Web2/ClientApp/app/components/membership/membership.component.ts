import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PageService } from '../shared/page.service';

import { MembershipService } from './membership.service';
import { Member, Group, GroupTypes, MemberIdList } from '../shared/common.types';

import { BaseComponent } from '../shared/base.component';
import { GroupTreeComponent } from './group-tree.component';
import { PopupMessageComponent, PopupMessageOptions, PopupMessageResult } from '../../fastnet/controls/popup-message.component';
import { InlineDialogComponent } from '../../fastnet/controls/inline-dialog.component';
import { PopupDialogComponent } from '../../fastnet/controls/popup-dialog.component';
import { ValidationMethod, isNullorUndefined, isWhitespaceOrEmpty } from '../../fastnet/controls/controlbase.type';
import { ValidationContext, ValidationResult, ListItem } from '../../fastnet/controls/controls.types';

//import {
//    ValidationResult,
//    ValidationContext
//} from '../controls/controls.types';

//import { ListItem } from '../controls/controls.types';
//import { isWhitespaceOrEmpty, isNullorUndefined, ValidationMethod } from '../controls/controlbase2.type';
//import { PopupMessageComponent, PopupMessageOptions, PopupMessageResult } from '../controls/popup-message.component';
//import { InlineDialogComponent } from '../controls/inline-dialog.component';
//import { PopupDialogComponent } from '../controls/popup-dialog.component';

enum CommandButtons {
    Cancel,
    Save,
    SendPasswordReset,
    SendActivationEmail,
    AddNewMember,
    DeleteMember,
    ActivateMember
}

class TabItem {
    name: string;
    selected: boolean;
    constructor(name: string) {
        this.name = name;
        this.selected = false;
    }
}

enum Modes {
    Member,
    Group
}

class groupMember {
    id: string;
    selected: boolean;
    name: string;
}

@Component({
    selector: 'webframe-membership',
    templateUrl: './membership.component.html',
    styleUrls: ['../../styles/webframe.forms.scss', './membership.component.scss']
})
export class MembershipComponent extends BaseComponent implements OnInit {
    public GroupTypes = GroupTypes;
    public Modes = Modes;
    public CommandButtons = CommandButtons;
    public message: string;
    public errors: string[];
    public mode: Modes;
    public bannerPageId: number | null;
    public tabs: TabItem[] = [];
    public searchText: string = "";
    public member?: Member
    public memberIsNew: boolean;
    public memberList: Member[];
    private originalMemberJson?: string;
    private originalEmailAddress: string; // used only in the case of editing an existing member
    // above member related stuff
    // below group related stuff
    @ViewChild(GroupTreeComponent) private groupTree: GroupTreeComponent;
    @ViewChild(PopupMessageComponent) popupMessage: PopupMessageComponent;
    @ViewChild('memberDialog') memberDialog: InlineDialogComponent;
    @ViewChild('candidateMembersDialog') candidateMembersDialog: PopupDialogComponent;
    public groupIsNew: boolean = false;
    public selectedGroup?: Group;
    private selectedGroupJson: string;
    private parentGroup: Group; // set when groupIsNew === true
    public groupMembers: groupMember[];
    public candidateMembers: groupMember[] = [];
    emailAddressValidator: ValidationMethod = (ctx: ValidationContext, val: any) => this.emailAddressValidatorAsync(ctx, val);
    constructor(pageService: PageService, protected router: Router,
        protected membershipService: MembershipService) {
        super(pageService);
        //console.log(`MembershipComponent: constructor`);
        this.mode = Modes.Member;

    }
    async ngOnInit() {
        super.ngOnInit();
        console.log(`MembershipComponent: ngOnInit`);
        let letters = [
            "A", "B", "C", "D", "E", "F", "G", "H",
            "I", "J", "K", "L", "M", "N", "O", "P",
            "Q", "R", "S", "T", "U", "V", "W", "X",
            "Y", "Z", "#"
        ]
        for (let letter of letters) {
            let ti = new TabItem(letter);
            this.tabs.push(ti);
        }
    }
    public onClearSearchClick() {
        this.searchText = "";
        this.clearTabSelection();
        console.log("search cleared");
    }
    public onTabClick(tab: TabItem) {
        this.selectTab(tab);
    }
    public onMemberClick(m: Member) {
        if (this.member && this.memberHasChanges()) {
            this.popupMessage.open("First save the current changes, or use Cancel", (r) => { } );
        } else {
            this.member = m;
            this.originalEmailAddress = m.emailAddress.toLowerCase();
            this.memberIsNew = false;
            this.saveMemberJson();
        }
    }
    public async onSearchClick() {
        this.performSearch();
    }
    public onAddNewMemberClick() {
        if (!this.memberIsNew) {
            this.member = this.getNewMember();
            this.memberIsNew = true;
            this.saveMemberJson();
        } else {
            if (this.memberHasChanges()) {
                this.popupMessage.open("First save the current changes, or use Cancel", (r) => { });
            }
        }
    }
    public async onSaveMemberClick() {
        let r = await this.memberDialog.isValid();
        if (r) {
            if (this.memberIsNew) {
                await this.createNewMember();
            } else {
                await this.updateMember();
            }
        }
    }
    public async onCancelMemberClick() {
        if (this.memberIsNew) {
            this.memberIsNew = false;
        } else if (this.member && this.memberHasChanges()) {
            let m = await this.membershipService.getMember(this.member.emailAddress);
            this.replaceMember(m);
        }
        this.member = undefined;
        this.originalMemberJson = undefined;
    }
    public async onDeleteMemberClick() {
        let options = new PopupMessageOptions();
        options.allowCancel = true;
        options.warning = true;
        this.popupMessage.open("Deleting a member removes all data for that member permanently. Choose OK to proceed.", (r) => {
            if (r === PopupMessageResult.ok) {
                console.log("delete requested");
                this.deleteMember();
            }
        }, options);


    }
    public async onActivateMemberClick() {
        let options = new PopupMessageOptions();
        options.allowCancel = true;
        options.warning = true;
        this.popupMessage.open("Directly activating a member means that the email address will not be known to be correct. Choose OK to proceed.", async (r) => {
            if (r === PopupMessageResult.ok && this.member) {
                await this.membershipService.activateMember(this.member);
                this.member = undefined;
                this.memberIsNew = false;
                this.originalMemberJson = undefined;
                this.performSearch();
            }
        }, options);
    }
    public async onSendActivationEmailClick() {
        if (this.member) {
            await this.membershipService.sendActivationEmail(this.member);
            this.popupMessage.open(`An activation email has been sent to ${this.member.emailAddress}`, (r) => { });
        }
    }
    public async onSendPasswordResetClick() {
        if (this.member) {
            await this.membershipService.sendPasswordResetEmail(this.member);
            this.popupMessage.open(`A password reset email has been sent to ${this.member.emailAddress}`, (r) => { });
        }
    }
    public goBack() {
        this.router.navigate(['/home']);
    }
    public getPageId() {
        return this.bannerPageId;
    }
    public setMode(mode: Modes) {
        this.mode = mode;
        this.selectedGroup = undefined;
        this.selectedGroupJson = "";
        this.groupMembers = [];
        switch (this.mode) {
            case Modes.Group:
                break;
            case Modes.Member:
                break;
        }
    }
    public canShowCommand(cb: CommandButtons): boolean {
        let r = false;
        switch (cb) {
            case CommandButtons.DeleteMember:
            case CommandButtons.SendActivationEmail:
                if (!this.memberIsNew) {
                    if (this.member) {
                        r = !this.member.isAdministrator;
                    }
                }
                break
            case CommandButtons.SendPasswordReset:
                if (!this.memberIsNew) {
                    if (this.member) {
                        r = !this.member.isAdministrator && this.member.emailAddressConfirmed === true;
                    }
                }
                break;
            case CommandButtons.ActivateMember:
                if (!this.memberIsNew) {
                    if (this.member) {
                        r = !this.member.isAdministrator && !this.member.emailAddressConfirmed;
                    }
                }
                break;
            case CommandButtons.Cancel:
            case CommandButtons.Save:
                r = true;
                break;
        }
        return r;
    }
    public async selectTab(item: TabItem) {
        console.log(`pressed ${item.name}`);
        this.searchText = item.name;
        this.clearTabSelection();
        item.selected = true;
        await this.searchMembers(true);
    }
    public getMemberFullName(m: Member) {
        if (this.memberIsNew) {
            if ((!m.firstName || m.firstName.trim().length === 0) && (!m.lastName || m.lastName.trim().length === 0)) {
                return "(new member)";
            }
        }
        return (m.firstName || "") + ' ' + (m.lastName || "");
    }
    protected async searchMembers(prefix: boolean) {
        console.log(`search started using ${this.searchText}, prefix = ${prefix}`);
        this.memberList = await this.membershipService.getMembers(this.searchText, prefix);
    }
    protected async deleteMember() {
        if (this.member) {
            await this.membershipService.deleteMember(this.member);
            this.member = undefined;
            this.memberIsNew = false;
            this.originalMemberJson = undefined;
            this.performSearch();
        }
    }
    protected getNewMember(): Member {
        console.log(`returning standard new member`);
        return new Member();
    }
    private async performSearch() {
        if (this.searchText.trim().length > 0) {
            let tab: TabItem | undefined = undefined;
            if (this.searchText.length === 1) {
                tab = this.matchesTabItem(this.searchText);
            }
            if (tab) {
                this.selectTab(tab);
            } else {
                this.clearTabSelection();
                await this.searchMembers(false);
            }
        }
    }
    private async updateMember() {
        if (this.member) {
            let cr = await this.membershipService.updateMember(this.member);
            if (cr.success) {
                this.saveMemberJson();
                this.popupMessage.open(`Membership record for ${this.member.firstName} ${this.member.lastName} updated`, (r) => { });
            } else {
                let errors = cr.errors.slice();
                errors.push("Membership record was not updated");
                let options = new PopupMessageOptions();
                options.error = true;
                this.popupMessage.open(errors, (r) => { }, options);
            }
        }
    }
    private async createNewMember() {
        if (this.member) {
            let cr = await this.membershipService.createNewMember(this.member);
            if (cr.success) {
                this.popupMessage.open(`Membership record for ${this.member.firstName} ${this.member.lastName} created and an activation email has been sent`, (r) => {
                    this.member = undefined;
                    this.memberIsNew = false;
                    this.originalMemberJson = undefined;
                    this.performSearch();
                });
            } else {
                let errors = cr.errors.slice();
                errors.push("Membership record was not created");
                let options = new PopupMessageOptions();
                options.error = true;
                this.popupMessage.open(errors, (r) => { }, options);
            }
        }
    }
    private clearTabSelection() {
        for (let tab of this.tabs) {
            tab.selected = false;
        }
    }
    private matchesTabItem(text: string): TabItem | undefined {
        return this.tabs.find(t => t.name.toLocaleLowerCase() === text.toLocaleLowerCase());
    }
    private saveMemberJson() {
        //this.originalMember = JSON.parse(JSON.stringify(this.member));
        this.originalMemberJson = JSON.stringify(this.member);
    }
    private memberHasChanges(): boolean {
        let r = false;
        if (this.member) {
            let text = JSON.stringify(this.member);
            r = text !== this.originalMemberJson;
        }
        return r;
    }
    private replaceMember(member: Member) {
        let index = this.memberList.findIndex((m) => {
            return member.id === m.id;
        });
        if (index > 0) {
            this.memberList[index] = member;
        }
    }
    private async showCandidateMembers() {
        if (this.selectedGroup) {
            let members = await this.membershipService.getCandidateMembers(this.selectedGroup);
            this.candidateMembers = this.toGroupMembers(members);
            this.candidateMembersDialog.open(async (r: boolean) => {
                if (r === true) {
                    if (this.selectedGroup) {
                        let list = new MemberIdList();
                        list.Ids = [];
                        for (let m of this.candidateMembers) {
                            if (m.selected === true) {
                                list.Ids.push(m.id);
                            }
                        }
                        await this.membershipService.addGroupMembers(this.selectedGroup, list);
                        let members = await this.membershipService.getGroupMembers(this.selectedGroup.groupId);
                        this.groupMembers = this.toGroupMembers(members);
                    }
                }
                this.candidateMembers = [];
            });
        }
    }
    //
    public isSystemGroup(): boolean {
        return this.selectedGroup && (this.selectedGroup.type & GroupTypes.System) > 0 ? true : false;
    }
    public membersSystemGenerated(): boolean {
        return this.selectedGroup && (this.selectedGroup.type & GroupTypes.SystemDefinedMembers) > 0 ? true : false;
    }
    public canAddSubGroups(): boolean {
        let r = false;
        if (this.groupIsNew === false) {
            if (this.selectedGroup) {
                if ((this.selectedGroup.type & GroupTypes.User) > 0 && !this.groupHasChanges()) {
                    r = true;
                } else if (this.isSystemGroup() && this.selectedGroup.name === "AllMembers") {
                    r = true;
                }
            }
        }
        console.log(`canAddSubGroups(): result = ${r}`);
        return r;
    }
    public canDeleteGroup(): boolean {
        let r = false;
        if (this.groupIsNew === false && this.selectedGroup) {
            r = (this.selectedGroup.type & GroupTypes.User) > 0;
        }
        return r;
    }
    public canAddMembers(): boolean {
        return this.selectedGroup && ((this.selectedGroup.type & GroupTypes.User) > 0) || !this.membersSystemGenerated() ? true : false;
    }
    public canShowMembers(): boolean {
        return !this.membersSystemGenerated() && !this.groupIsNew;
    }
    async onSelectedGroup(group: Group) {
        this.selectedGroup = group;
        //console.log(`user selected group ${group.name}`);
        if (!this.isSystemGroup()) {
            this.selectedGroupJson = JSON.stringify(this.selectedGroup);
        }
        else {
            this.selectedGroupJson = "";
        }
        if (!this.membersSystemGenerated()) {
            let members = await this.membershipService.getGroupMembers(this.selectedGroup.groupId);
            this.groupMembers = this.toGroupMembers(members);
        }
    }

    public onSelectGroupMembers(tf: boolean) {
        if (this.groupMembers) {
            for (let gm of this.groupMembers) {
                gm.selected = tf;
            }
        }
    }
    onAddSubGroup() {
        if (this.selectedGroup) {
            this.parentGroup = this.selectedGroup;
            this.selectedGroup = new Group();
            this.selectedGroup.parentGroupId = this.parentGroup.groupId;
            this.selectedGroup.type = GroupTypes.User;
            this.selectedGroup.weight = this.parentGroup.weight;
            this.selectedGroupJson = JSON.stringify(this.selectedGroup);
            this.groupIsNew = true;
        }
    }
    async onRequestAddMemberToGroup() {
        await this.showCandidateMembers();
    }
    async onRemoveMembersFromGroup() {
        if (this.selectedGroup) {
            let list = new MemberIdList();
            list.Ids = [];
            for (let m of this.groupMembers) {
                if (m.selected === true) {
                    list.Ids.push(m.id);
                }
            }
            await this.membershipService.removeGroupMembers(this.selectedGroup, list);
            let members = await this.membershipService.getGroupMembers(this.selectedGroup.groupId);
            this.groupMembers = this.toGroupMembers(members);
        }
    }
    onCancelAddMembersClick() {
        this.candidateMembersDialog.close(false);
    }
    async onAddMembersClick() {
        this.candidateMembersDialog.close(false);
    }
    async onDeleteGroupClick() {
        if (this.selectedGroup && !this.groupIsNew) {
            let options = new PopupMessageOptions();
            options.warning = true;
            this.popupMessage.open("Deleting a group is irreversible. Choose OK to proceed.", async (r) => {
                if (r === PopupMessageResult.ok && this.selectedGroup) {
                    await this.membershipService.deleteGroup(this.selectedGroup);
                    this.removeGroupFromTree();
                    this.selectedGroup = undefined;
                }
            }, options);
        }
    }
    async onSaveGroupClick() {
        if (this.groupIsNew) {
            await this.createNewGroup();
            this.addGroupToTree();
            this.selectedGroupJson = JSON.stringify(this.selectedGroup);
            this.groupIsNew = false;

        } else {
            await this.updateGroup();
        }
        this.selectedGroupJson = JSON.stringify(this.selectedGroup);
    }
    onCancelGroupClick() {
        if (this.groupIsNew) {
            this.selectedGroup = this.parentGroup;
            this.selectedGroupJson = JSON.stringify(this.selectedGroup);
            this.groupIsNew = false;
        }
    }
    groupHasChanges() {
        let r = false;
        if (this.selectedGroup) {
            let text = JSON.stringify(this.selectedGroup);
            r = text !== this.selectedGroupJson;
        }
        return r;
    }
    countSelectedMembers(list: groupMember[]): number {
        let count = 0;
        for (let gm of list) {
            if (gm.selected) {
                count++;
            }
        }
        return count;
    }
    private async createNewGroup() {
        if (this.selectedGroup) {
            let id = await this.membershipService.createGroup(this.selectedGroup);
            this.selectedGroup.groupId = id;
        }
    }
    private addGroupToTree() {
        if (this.selectedGroup) {
            this.groupTree.addGroup(this.selectedGroup);
        }
    }
    private removeGroupFromTree() {
        if (this.selectedGroup) {
            this.groupTree.removeGroup(this.selectedGroup);
        }
    }
    private async updateGroup() {
        if (this.selectedGroup) {
            await this.membershipService.updateGroup(this.selectedGroup);
        }
    }
    private toGroupMembers(list: Member[]): groupMember[] {
        let groupMembers = [];
        for (let m of list) {
            groupMembers.push({ id: m.id, name: `${m.firstName} ${m.lastName} (${m.emailAddress})`, selected: false });
        }
        return groupMembers;
    }

    //
    firstNameValidatorAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = new ValidationResult();
            if (isNullorUndefined(value) || isWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = `an first name is required`;
            }
            resolve(vr);
        });
    }
    lastNameValidatorAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = new ValidationResult();
            if (isNullorUndefined(value) || isWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = `an last name is required`;
            }
            resolve(vr);
        });
    }
    async emailAddressValidatorAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        return new Promise<ValidationResult>(async resolve => {
            let vr = new ValidationResult();
            if (isNullorUndefined(value) || isWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = `an email address is required`;
            } else if (context === ValidationContext.LostFocus) {
                let text: string = value;
                text = text.toLowerCase();
                if (this.memberIsNew || text != this.originalEmailAddress) {
                    let r = await this.membershipService.validateEmailAddress(text);
                    if (r === false) {
                        vr.valid = false;
                        vr.message = `this email address is already in use`;
                    }
                }
            }
            resolve(vr);
        });
    }
    groupNameValidatorAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = new ValidationResult();
            if (isNullorUndefined(value) || isWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = `a group name is required`;            
            }
            resolve(vr);
        });
    }
    groupDescriptionValidatorAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = new ValidationResult();
            if (isNullorUndefined(value) || isWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = `a group description is required`;
            }
            resolve(vr);
        });
    }
    findItem(list: ListItem<number>[], value: number): ListItem<number> | undefined {
        return list.find((item, i) => {
            return item.value === value;
        });
    }
}
