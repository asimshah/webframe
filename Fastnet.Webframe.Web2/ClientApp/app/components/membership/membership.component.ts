import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { PageService } from '../shared/page.service';
import { Dictionary} from '../shared/dictionary.types';
import {
    ControlBase,
    //TextInputControl,
    ValidationResult, ControlState, EnumValue, ListItem,
    PropertyValidatorAsync
} from '../controls/controls.component';


class TabItem {
    name: string;
    selected: boolean;
    constructor(name: string) {
        this.name = name;
        this.selected = false;
    }
}
enum Choice {
    First,
    Second,
    Third
}

class memberProperties {
    firstName: string;
    lastName: string;
    emailAddress: string;
    disabled: boolean;
    choice: Choice;
    birthDate: Date;
    age: number;
    constructor() {
        this.firstName = "";
        this.emailAddress = "";
        this.disabled = false;
        this.choice = Choice.Second;
        this.birthDate = new Date();
        this.age = 14;
    }
}


@Component({
    selector: 'webframe-membership',
    templateUrl: './membership.component.html',
    styleUrls: ['./membership.component.scss']
})
export class MembershipComponent implements OnInit {
    public validators: Dictionary<PropertyValidatorAsync>;
    public dropdownList: ListItem[] = [];
    public dropdownList2: ListItem[] = [];
    public selectedDropdownItem: number;
    public selectedDropdownItem2: number;
    public maxBirthDate: Date = new Date();
    public choiceValues: EnumValue[] = [];
    public groupMode: boolean;
    public bannerPageId: number | null;
    public tabs: TabItem[] = [];
    public searchText: string = "";
    public member: memberProperties;
    @ViewChildren(ControlBase) controls: QueryList<ControlBase>;
    constructor(protected pageService: PageService, protected router: Router) {
        this.member = new memberProperties();
        this.validators = new Dictionary<PropertyValidatorAsync>();
        this.validators.add("firstName", new PropertyValidatorAsync(this.firstNameValidatorAsync));
        this.validators.add("lastName", new PropertyValidatorAsync(this.lastNameValidatorAsync));
        this.validators.add("age", new PropertyValidatorAsync(this.ageValidatorAsync));
        this.choiceValues = this.choiceToValues();
        this.dropdownList.push({ value: 0, name: "Internet Explorer" });
        this.dropdownList.push({ value: 1, name: "Chrome" });
        this.dropdownList.push({ value: 2, name: "Firefox" });
        this.dropdownList.push({ value: 3, name: "Opera" });
        this.dropdownList.push({ value: 4, name: "Safari" });
        this.selectedDropdownItem = this.dropdownList[2].value;
        this.dropdownList2.push({ value: 0, name: "Red" });
        this.dropdownList2.push({ value: 1, name: "Blue" });
        this.dropdownList2.push({ value: 2, name: "Green" });
        this.dropdownList2.push({ value: 3, name: "Yellow" });
        this.dropdownList2.push({ value: 4, name: "White" });
        this.selectedDropdownItem2 = this.dropdownList2[3].value;
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
    goBack() {
        this.router.navigate(['/home']);
    }
    getPageId() {
        return this.bannerPageId;
    }
    setMode(group: boolean) {
        if (group) {
            if (!this.groupMode) {
                this.groupMode = true;
            }
        } else {
            if (this.groupMode) {
                this.groupMode = false;
            }
        }
    }
    selectTab(item: TabItem) {
        console.log(`pressed ${item.name}`);
        this.searchText = item.name;
        this.clearTabSelection();
        item.selected = true;
        this.searchForMembers();
    }
    clearTabSelection() {
        for (let tab of this.tabs) {
            tab.selected = false;
        }
    }
    clearSearchText() {
        this.searchText = "";
        this.clearTabSelection();
    }
    searchForMembers() {
        console.log(`search started using ${this.searchText}`);
    }
    addNewMember() {
        console.log(`add new member requested`);
    }
    diagSearchText() {
        console.log(`search is ${this.searchText}`);
    }
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
        return ControlBase.validateAll(this.controls);
    }
    async onBetaButton() {
        let r = await this.validateAll();
        if (r) {
            console.log(`can save`);
        } else {
            console.log(`cannot save`);
        }
        switch (this.member.choice) {
            case Choice.First:
                this.member.choice = Choice.Second;
                break;
            case Choice.Second:
                this.member.choice = Choice.Third;
                break;
            case Choice.Third:
                this.member.choice = Choice.First;
                break;
        }
    }
    choiceToValues(): EnumValue[] {
        let r: EnumValue[] = [];
        for (var v in Choice) {
            if (typeof Choice[v] === 'number') {
                r.push({ value: <any>Choice[v], name: v })
            }
        }
        console.log(`${JSON.stringify(r)}`);
        return r;
    }
    get debug() {
        let d = {
            member: this.member,
            fl: this.findItem(this.dropdownList, this.selectedDropdownItem),
            sl: this.findItem(this.dropdownList2, this.selectedDropdownItem2) };
        return JSON.stringify(d, null, 2);
    }
    findItem(list: ListItem[], value: number): ListItem | undefined {
        return list.find((item, i) => {
            return item.value === value;
        });
    }
}
