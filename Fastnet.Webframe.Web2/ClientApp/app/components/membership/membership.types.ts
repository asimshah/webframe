export class Member {
    id: string;
    emailAddress: string;
    emailAddressConfirmed: boolean;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    creationDate?: Date;
    lastLoginDate?: Date;
    disabled: boolean;
    formattedCreationDate: string;
    formattedLoginDate: string;
}