import { Component, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PageService } from '../shared/page.service';
//import { Dictionary} from '../shared/dictionary.types';
import {
    ControlBase,
    //TextInputControl,
    ValidationResult, ControlState, EnumValue, ListItem,
    PropertyValidatorAsync
} from '../controls/controls.component';
import { Dictionary } from '../types/dictionary.types';
import { MembershipService } from './membership.service';
import { Member, Group, GroupTypes, MemberIdList } from '../shared/common.types';
import { ModalDialogService } from '../modaldialog/modal-dialog.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { BaseComponent, nothingOnClose } from '../shared/base.component';
import { GroupTreeComponent } from './group-tree.component';

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
    public validators: Dictionary<PropertyValidatorAsync>;
    public mode: Modes;
    public bannerPageId: number | null;
    public tabs: TabItem[] = [];
    public searchText: string = "";
    public member?: Member
    public memberIsNew: boolean;
    public memberList: Member[];
    private originalMemberJson?: string;
    // above member related stuff
    // below group related stuff
    @ViewChild(GroupTreeComponent) private groupTree: GroupTreeComponent;
    public groupIsNew: boolean = false;    
    public selectedGroup?: Group;
    private selectedGroupJson: string;
    private parentGroup: Group; // set when groupIsNew === true
    public groupMembers: groupMember[];
    public candidateMembers: groupMember[];
    constructor(pageService: PageService, protected router: Router,
        dialogService: ModalDialogService,
        protected membershipService: MembershipService) {
        super(pageService, dialogService);
        console.log(`MembershipComponent: constructor`);
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
            this.showMessageDialog("First save the current changes, or use Cancel", nothingOnClose, false, "Membership");
        } else {
            this.member = m;
            this.memberIsNew = false;
            this.saveMemberJson();
            ControlBase.resetAll();
            this.setExistingMemberValidators();
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
            this.setNewMemberValidators();
        } else {
            if (this.memberHasChanges()) {
                this.showMessageDialog("First save the current changes, or use Cancel", nothingOnClose, false, "Membership");
            }
        }
    }
    public async onSaveMemberClick() {
        let r = await this.validateAll();
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
    public onDeleteMemberClick() {
        //console.log("onDeleteClick");
        this.showConfirmDialog("Deleting a member removes all data for that member permanently. Are you sure you want to proceed? ", async (r) => {
            if (r === true) {
                //console.log("delete requested");
                await this.deleteMember();
            }
        });
    }
    public onActivateMemberClick() {
        this.showConfirmDialog("Directly activating a member means that the email address will not be known to be correct. Are you sure you want to proceed?", async (r) => {
            if (r === true && this.member) {
                await this.membershipService.activateMember(this.member);
                this.member = undefined;
                this.memberIsNew = false;
                this.originalMemberJson = undefined;
                this.performSearch();
            }
        });
    }
    public async onSendActivationEmailClick() {
        if (this.member) {
            await this.membershipService.sendActivationEmail(this.member);
            this.showMessageDialog(`An activation email has been sent to ${this.member.emailAddress}`, nothingOnClose, false, "Membership");
        }
    }
    public async onSendPasswordResetClick() {
        if (this.member) {
            await this.membershipService.sendPasswordResetEmail(this.member);
            this.showMessageDialog(`An password reset email has been sent to ${this.member.emailAddress}`, nothingOnClose, false, "Membership");
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
        this.validators = new Dictionary<PropertyValidatorAsync>();
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
        return (m.firstName || "")  + ' ' + (m.lastName || "");
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
                this.showMessageDialog(`Membership record for ${this.member.firstName} ${this.member.lastName} updated`, nothingOnClose, false, "Membership");
            } else {
                let errors = cr.errors.join("<br>");
                this.showMessageDialog(`Membership record was not updated<br>Error(s):<br><div >${errors}</div>`, nothingOnClose, true, "Membership");
            }
        }
    }
    private async createNewMember() {
        if (this.member) {
            let cr = await this.membershipService.createNewMember(this.member);
            if (cr.success) {
                this.showMessageDialog(`Membership record for ${this.member.firstName} ${this.member.lastName} created and an activation email has been sent`, nothingOnClose, false, "Membership");
                this.member = undefined;
                this.memberIsNew = false;
                this.originalMemberJson = undefined;
                this.performSearch();
            } else {
                let errors = cr.errors.join("<br>");
                this.showMessageDialog(`Membership record was not created<br>Error(s):<br><div >${errors}</div>`, nothingOnClose, true, "Membership");
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
            this.dialogService.open("candidate-members");
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
        console.log(`user selected group ${group.name}`);
        if (!this.isSystemGroup()) {
            this.selectedGroupJson = JSON.stringify(this.selectedGroup);
            this.validators = new Dictionary<PropertyValidatorAsync>();
            this.validators.add("name", new PropertyValidatorAsync((cs) => this.nameValidatorAsync(cs)));
            this.validators.add("description", new PropertyValidatorAsync((cs) => this.descriptionValidatorAsync(cs)));
        }
        else {
            this.selectedGroupJson = "";
        }
        if (!this.membersSystemGenerated()) {
            let members = await this.membershipService.getGroupMembers(this.selectedGroup.groupId);
            this.groupMembers = this.toGroupMembers(members);
            //this.groupMembers = [];
            //for (let m of members) {
            //    this.groupMembers.push({ id: m.id, name: `${m.firstName} ${m.lastName} (${m.emailAddress})`, selected: false });
            //}
            //this.groupMembers = await this.membershipService.getGroupMembers(this.selectedGroup.groupId);
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
        this.candidateMembers = [];
        this.dialogService.close("candidate-members");
    }
    async onAddMembersClick() {
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
        this.candidateMembers = [];
        this.dialogService.close("candidate-members");
    }
    async onDeleteGroupClick() {
        if (this.selectedGroup && !this.groupIsNew) {
            this.showConfirmDialog(`Deleting a group is irreversible. Are you sure you want to proceed?`, async (r) => {
                if (r === true && this.selectedGroup) {
                    await this.membershipService.deleteGroup(this.selectedGroup);
                    this.removeGroupFromTree();
                    this.selectedGroup = undefined;                    
                }
            }, true, "Message");
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
    firstNameValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = cs.validationResult;
            let text = cs.value || "";
            if (text.length === 0) {
                vr.valid = false;
                vr.message = `a First Name is required`;
            } 
            //console.log(`${JSON.stringify(cs)}`);
            resolve(cs.validationResult);
        });
    }
    lastNameValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = cs.validationResult;
            let text = cs.value || "";
            if (text.length === 0) {
                vr.valid = false;
                vr.message = `a Last Name is required`;
            } 
            //console.log(`${JSON.stringify(cs)}`);
            resolve(cs.validationResult);
        });
    }
    emailAddressValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        //let ms = this.membershipService;
        return new Promise<ValidationResult>(async resolve => {
            let vr = cs.validationResult;
            if (vr.valid) {
                let text: string = cs.value || "";
                if (text.trim().length === 0) {
                    vr.valid = false;
                    vr.message = `an Email Address is required`;
                } else {
                    text = text.toLocaleLowerCase();
                    let r = await this.membershipService.validateEmailAddress(text);
                    if (r === false) {
                        vr.valid = false;
                        vr.message = `this Email Address is already in use`;
                    }
                }
            }
            resolve(cs.validationResult);
        });
    }
    passwordValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        return new Promise<ValidationResult>(resolve => {
            let vr = cs.validationResult;
            let text: string = cs.value || "";
            if (text.trim().length === 0) {
                vr.valid = false;
                vr.message = `a Password is required`;
            } else {
                if (text.trim().length < 8) {
                    vr.valid = false;
                    vr.message = "minimum password length is 8 chars"
                }
            }
            resolve(vr);
        });
    }
    nameValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = cs.validationResult;
            let text = cs.value || "";
            if (text.length === 0) {
                vr.valid = false;
                vr.message = `a Group Name is required`;
            }
            //console.log(`${JSON.stringify(cs)}`);
            resolve(cs.validationResult);
        });
    }
    descriptionValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = cs.validationResult;
            let text = cs.value || "";
            if (text.length === 0) {
                vr.valid = false;
                vr.message = `a Group Description is required`;
            }
            //console.log(`${JSON.stringify(cs)}`);
            resolve(cs.validationResult);
        });
    }
    async validateAll(): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            let badCount = await ControlBase.validateAll();
            resolve(badCount.length === 0);
        });
    }
    protected setNewMemberValidators() {
        this.validators = new Dictionary<PropertyValidatorAsync>();
        this.validators.add("firstName", new PropertyValidatorAsync((cs) => this.firstNameValidatorAsync(cs)));
        this.validators.add("lastName", new PropertyValidatorAsync((cs) => this.lastNameValidatorAsync(cs)));
        this.validators.add("emailAddress", new PropertyValidatorAsync((cs) => this.emailAddressValidatorAsync(cs)));
        this.validators.add("password", new PropertyValidatorAsync((cs) => this.passwordValidatorAsync(cs)));
    }
    protected setExistingMemberValidators() {
        this.validators = new Dictionary<PropertyValidatorAsync>();
        this.validators.add("firstName", new PropertyValidatorAsync((cs) => this.firstNameValidatorAsync(cs)));
        this.validators.add("lastName", new PropertyValidatorAsync((cs) => this.lastNameValidatorAsync(cs)));
    }
    findItem(list: ListItem[], value: number): ListItem | undefined {
        return list.find((item, i) => {
            return item.value === value;
        });
    }
}
