import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
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
import { MessageBox, Member } from '../shared/common.types';
import { ModalDialogService } from '../modaldialog/modal-dialog.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { BaseComponent } from '../shared/base.component';

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

@Component({
    selector: 'webframe-membership',
    templateUrl: './membership.component.html',
    styleUrls: ['../../styles/webframe.forms.scss', './membership.component.scss']
})
export class MembershipComponent extends BaseComponent implements OnInit {
    public Modes = Modes;
    public CommandButtons = CommandButtons;
    public messageBox: MessageBox;
    public validators: Dictionary<PropertyValidatorAsync>;
    public mode: Modes;
    public bannerPageId: number | null;
    public tabs: TabItem[] = [];
    public searchText: string = "";
    public member?: Member
    public memberIsNew: boolean;
    public memberList: Member[];
    private originalMemberJson?: string;
    //private originalMember?: Member;
    @ViewChildren(ControlBase) controls: QueryList<ControlBase>;
    constructor(protected pageService: PageService, protected router: Router,
        dialogService: ModalDialogService,
        protected membershipService: MembershipService) {
        super(dialogService);
        console.log(`MembershipComponent: constructor`);
        this.mode = Modes.Member;

    }
    async ngOnInit() {
        console.log(`MembershipComponent: ngOnInit`);
        this.bannerPageId = await this.pageService.getDefaultBanner();
        //await this.authenticationService.sync();
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
            this.showMessageDialog("First save the current changes, or use Cancel", false, "Membership");
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
            this.member = this.getNewMember();// new Member();
            this.memberIsNew = true;
            this.saveMemberJson();
            this.setNewMemberValidators();
        } else {
            if (this.memberHasChanges()) {
                this.showMessageDialog("First save the current changes, or use Cancel", false, "Membership");
            }
        }
    }
    public async onSaveClick() {
        let r = await this.validateAll();
        if (r) {
            if (this.memberIsNew) {
                await this.createNewMember();
            } else {
                await this.updateMember();
            }
        }
    }
    public async onCancelClick() {
        if (this.memberIsNew) {
            this.memberIsNew = false;
        } else if (this.member && this.memberHasChanges()) {
            let m = await this.membershipService.getMember(this.member.emailAddress);
            this.replaceMember(m);
        }
        this.member = undefined;
        this.originalMemberJson = undefined;
    }
    public onDeleteClick() {
        //console.log("onDeleteClick");
        this.showConfirmDialog("Deleting a member removes all data for that member permanently. Are you sure you want to proceed? ", async (r) => {
            if (r === true) {
                //console.log("delete requested");
                await this.deleteMember();
            }
        });
    }
    public onActivateClick() {
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
            this.showMessageDialog(`An activation email has been sent to ${this.member.emailAddress}`, false, "Membership");
        }
    }
    public async onSendPasswordResetClick() {
        if (this.member) {
            await this.membershipService.sendPasswordResetEmail(this.member);
            this.showMessageDialog(`An password reset email has been sent to ${this.member.emailAddress}`, false, "Membership");
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
                this.showMessageDialog(`Membership record for ${this.member.firstName} ${this.member.lastName} updated`, false, "Membership");
            } else {
                let errors = cr.errors.join("<br>");
                this.showMessageDialog(`Membership record was not updated<br>Error(s):<br><div >${errors}</div>`, true, "Membership");
            }
        }
    }
    private async createNewMember() {
        if (this.member) {
            let cr = await this.membershipService.createNewMember(this.member);
            if (cr.success) {
                this.showMessageDialog(`Membership record for ${this.member.firstName} ${this.member.lastName} created and an activation email has been sent`, false, "Membership");
                this.member = undefined;
                this.memberIsNew = false;
                this.originalMemberJson = undefined;
                this.performSearch();
            } else {
                let errors = cr.errors.join("<br>");
                this.showMessageDialog(`Membership record was not created<br>Error(s):<br><div >${errors}</div>`, true, "Membership");
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
    firstNameValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = cs.validationResult;
            let text = cs.value || "";
            if (text.length === 0) {
                vr.valid = false;
                vr.message = `a First Name is required`;
            } else if (text.startsWith("z")) {
                vr.valid = false;
                vr.message = `a First Name cannot begin with z`;
            }
            console.log(`${JSON.stringify(cs)}`);
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
            } else if (text.startsWith("z")) {
                vr.valid = false;
                vr.message = `a Last Name cannot begin with z`;
            }
            console.log(`${JSON.stringify(cs)}`);
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
