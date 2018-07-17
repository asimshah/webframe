export class MessageBox {
    caption: string = "Message";
    message: string = "<div>No message provided</div>"
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