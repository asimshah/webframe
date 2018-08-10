
export class Member {
    id: string;
    isAdministrator: boolean;
    emailAddress: string;
    emailAddressConfirmed: boolean;
    firstName: string;
    lastName: string;
    name: string
    password: string;
    phoneNumber: string;
    creationDate?: Date;
    lastLoginDate?: Date;
    disabled: boolean;
    creationDateFormatted: string;
    lastLoginDateFormatted: string;
    constructor() {
        this.isAdministrator = false;
        this.firstName = "";
        this.lastName = "";
        this.emailAddress = "";
        this.phoneNumber = "";
        this.disabled = false;
    }
}
export enum GroupTypes {
    None = 0,
    User = 1,
    System = 2,
    SystemDefinedMembers = 4
}
export class Group {
    groupId: number;
    parentGroupId?: number;
    name: string;
    description: string;
    weight: number;
    type: GroupTypes;
    //subGroups: Group[] = [];
}
export class MemberIdList {
    Ids: string[];
}

