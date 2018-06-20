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
import { Member } from './membership.types';
import { MembershipService } from './membership.service';
import { MessageBox } from '../shared/common.types';
import { ModalDialogService } from '../modaldialog/modal-dialog.service';

enum CommandButtons {
    Cancel,
    Save,
    SendPasswordReset,
    SendActivationEmail,
    AddNewMember,
    DeleteMember
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
export class MembershipComponent implements OnInit {
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
    @ViewChildren(ControlBase) controls: QueryList<ControlBase>;
    constructor(protected pageService: PageService, protected router: Router,
        private dialogService: ModalDialogService,
        protected membershipService: MembershipService) {
        this.mode = Modes.Member;
        this.validators = new Dictionary<PropertyValidatorAsync>();
        this.validators.add("firstName", new PropertyValidatorAsync(this.firstNameValidatorAsync));
        this.validators.add("lastName", new PropertyValidatorAsync(this.lastNameValidatorAsync));
    }
    async ngOnInit() {

        this.bannerPageId = await this.pageService.getDefaultBanner();
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
            case CommandButtons.SendPasswordReset:
                r = !this.memberIsNew;
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
    public onClearSearchClick() {
        this.searchText = "";
        this.clearTabSelection();
        console.log("search cleared");
    }
    public onTabClick(tab: TabItem) {
        this.selectTab(tab);
    }
    public onMemberClick(m: Member) {
        this.member = m;
    }
    public async onSearchClick() {        
        let tab: TabItem | undefined  = undefined;
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
    public getMemberFullName(m: Member) {
        if (this.memberIsNew) {
            if ((!m.firstName || m.firstName.trim().length === 0) && (!m.lastName || m.lastName.trim().length === 0)) {
                return "(new member)";
            }
        }
        return (m.firstName || "")  + ' ' + (m.lastName || "");
    }
    public onAddNewMember() {
        if (!this.memberIsNew) {
            this.member = this.getNewMember();// new Member();
            this.memberIsNew = true;
            this.saveMemberJson();
        } else {
            if (this.memberHasChanges()) {
                this.showConfirmationMessage("First save the current member, or use Cancel");
            }
        }
    }
    public onCloseMessageBox() {
        this.dialogService.close("message-box");
    }
    public onCancelClick() {
        if (this.memberIsNew) {
            this.memberIsNew = false;
        }
        this.member = undefined;
        this.originalMemberJson = undefined;
    }
    protected async searchMembers(prefix: boolean) {
        console.log(`search started using ${this.searchText}, prefix = ${prefix}`);
        this.memberList = await this.membershipService.getMembers(this.searchText, prefix);
    }
    protected getNewMember(): Member {
        return new Member();
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
        this.originalMemberJson = JSON.stringify(this.member);
    }
    private memberHasChanges(): boolean {
        let text = JSON.stringify(this.member);
        return text != this.originalMemberJson;
    }
    private showConfirmationMessage(msg: string) {
        this.messageBox = new MessageBox();
        this.messageBox.caption = "Message";
        this.messageBox.message = msg;
        this.dialogService.open("message-box");
    }
    //diagSearchText() {
    //    console.log(`search is ${this.searchText}`);
    //}
    //firstNameValidator(cs: ControlState): ValidationResult {
    //    let vr = cs.validationResult;
    //    let text = cs.value || "";
    //    if (text.length === 0) {
    //        vr.valid = false;
    //        vr.message = `a First Name is required`;
    //    } else if (text.startsWith("z")) {
    //        vr.valid = false;
    //        vr.message = `a First Name cannot begin with z`;
    //    }
    //    console.log(`${JSON.stringify(cs)}`);
    //    return vr;
    //}
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
    //lastNameValidator(cs: ControlState): ValidationResult {
    //    let vr = cs.validationResult;
    //    let text = cs.value || "";
    //    if (text.length === 0) {
    //        vr.valid = false;
    //        vr.message = `a Last Name is required`;
    //    } else if (text.startsWith("z")) {
    //        vr.valid = false;
    //        vr.message = `a Last Name cannot begin with z`;
    //    }
    //    console.log(`${JSON.stringify(cs)}`);
    //    return vr;
    //}
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
    //ageValidator(cs: ControlState): ValidationResult {
    //    let vr = cs.validationResult;
    //    let age = cs.value || 0;
    //    if (age === 99) {
    //        vr.valid = false;
    //        vr.message = `99 not allowed`;
    //    }
    //    console.log(`${JSON.stringify(cs)}`);
    //    return vr;
    //}
    ageValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            setTimeout(() => {
                let vr = cs.validationResult;
                let age = cs.value || 0;
                if (age === 99) {
                    vr.valid = false;
                    vr.message = `99 not allowed`;
                }
                console.log(`${JSON.stringify(cs)}`);
                resolve(vr);
            }, 5000);
        });
    }
    async validateAll(): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            let badCount = await ControlBase.validateAll();
            resolve(badCount.length === 0);
        });
    }
    //async onBetaButton() {
    //    let r = await this.validateAll();
    //    if (r) {
    //        console.log(`can save`);
    //    } else {
    //        console.log(`cannot save`);
    //    }
    //    switch (this.member.choice) {
    //        case Choice.First:
    //            this.member.choice = Choice.Second;
    //            break;
    //        case Choice.Second:
    //            this.member.choice = Choice.Third;
    //            break;
    //        case Choice.Third:
    //            this.member.choice = Choice.First;
    //            break;
    //    }
    //}
    //choiceToValues(): EnumValue[] {
    //    let r: EnumValue[] = [];
    //    for (var v in Choice) {
    //        if (typeof Choice[v] === 'number') {
    //            r.push({ value: <any>Choice[v], name: v })
    //        }
    //    }
    //    //console.log(`${JSON.stringify(r)}`);
    //    return r;
    //}
    //get debug() {
    //    let d = {
    //        member: this.member,
    //        fl: this.findItem(this.dropdownList, this.selectedDropdownItem),
    //        sl: this.findItem(this.dropdownList2, this.selectedDropdownItem2) };
    //    return JSON.stringify(d, null, 2);
    //}
    findItem(list: ListItem[], value: number): ListItem | undefined {
        return list.find((item, i) => {
            return item.value === value;
        });
    }
}
