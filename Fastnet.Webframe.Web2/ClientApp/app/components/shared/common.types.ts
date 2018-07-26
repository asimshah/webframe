export class MessageBox {
    caption: string = "Message";
    isAlert: boolean = false;
    message: string = "<div>No message provided</div>";
    confirmBox: boolean = false;
    confirmClose: (r: boolean) => void;
}
export class Member {
    id: string;
    isAdministrator: boolean;
    emailAddress: string;
    emailAddressConfirmed: boolean;
    firstName: string;
    lastName: string;
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