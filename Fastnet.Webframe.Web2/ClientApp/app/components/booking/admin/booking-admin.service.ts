import { Injectable } from '@angular/core';
import { BaseService, ServiceResult, DataResult } from '../../shared/base.service';
import { Http } from '@angular/http';
import { Group } from '../../shared/common.types';

export class Price {
    priceId: number;
    amount: number;
    isRolling: boolean;
    from: Date;
    fromFormatted: string;
    to: Date | null;
    toFormatted: string;
    constructor() {
        this.amount = 1;
        this.from = new Date();
    }
}

export enum BookingEmailTemplates {
    RegistrationFailed,
    ApprovalRequired,
    WANotification,
    ConfirmedPriv,
    ConfirmedNonPriv,
    WaitingPayment,
    WPNotification,
    Reminder,
    FinalReminder,
    CANNotification,
    AutoCancelled,
    Cancelled,
    EntryCodeNotification,
    WaitingDuePayment
}
export class EmailTemplate {
    template: BookingEmailTemplates;
    subject: string;
    body: string;
}
export class BookingParameters {
    paymentInterval: number;
    cancellationInterval: number;
    firstReminderInterval: number;
    secondReminderInterval: number;
    reminderSuppressionInterval: number;
    entryCodeNotificationInterval: number;
    entryCodeBridgeInterval: number;
    privilegedMembersGroupId: number;
    availableGroups: Group[];
    termsAndConditionsUrl: string;
    paymentGatewayAvailable: boolean;
    today: string;
    privilegedMembers: Group | undefined; // not sent from server
    //maximumOccupants: number;
    //nonBMCMembers: Group

}
export enum BookingsFilter {
    Current,
    UnpaidOnly,
    Cancelled,
    Historic
}
export enum BookingStatus {
    WaitingApproval,
    WaitingPayment,
    Confirmed,
    //AutoCancelled,
    Cancelled,
    WaitingGateway
}

export class Booking {
    bookingId: number;
    reference: string;
    //statusName: string;
    status: BookingStatus;
    memberId: string;
    memberName: string;
    memberEmailAddress: string;
    memberPhoneNumber: string;
    from: string;
    to: string;
    description: string | null;
    createdOn: string;
    partySize: number;
    totalCost: number;
    formattedCost: string;
    isPaid: boolean;
    canPay: boolean;
    notes: string;
    history: string;
    entryInformation: string;
    under18sInParty: boolean;
    numberOfNights: number;
    hasMultipleDays: boolean;
    bmcMembership: string;
    organisation: string;
    //memberIsPrivileged: boolean;
}

@Injectable()
export class BookingAdminService extends BaseService {
    constructor(http: Http) {
        super(http);
    }
    async getPrices(): Promise<Price[]> {
        let query = `bookingadmin/get/prices`;
        return this.getData<Price[]>(query);
    }
    async addPrice(price: Price) {
        let query = `bookingadmin/add/price`;
        return this.postData<Price>(query, price);
    }
    async removePrice(price: Price) {
        let query = `bookingadmin/remove/price`;
        return this.postData<Price>(query, price);
    }
    async editPrice(price: Price) {
        let query = `bookingadmin/edit/price`;
        return this.postData<Price>(query, price);
    }
    async saveEmailTemplate(et: EmailTemplate): Promise<ServiceResult> {
        let query = `bookingadmin/save/emailtemplate`;
        return this.postData<EmailTemplate>(query, et);
    }
    async getEmailTemplate(template: BookingEmailTemplates): Promise<EmailTemplate> {
        let query = `bookingadmin/get/emailtemplate/${template}`;
        return this.getData<EmailTemplate>(query);
    }
    async getEmailTemplateList(): Promise<string[]> {
        let query = `bookingadmin/get/emailtemplatelist`;
        return this.getData<string[]>(query);
    }
    async getParameters(): Promise<BookingParameters> {
        let query = `bookingadmin/get/parameters`;
        return this.getData<BookingParameters>(query);
    }
    async saveParameters(p: BookingParameters): Promise<ServiceResult> {
        let query = `bookingadmin/save/parameters`;
        return this.postData<BookingParameters>(query, p);
    }
    async getBookings(filter: BookingsFilter): Promise<Booking[]> {
        let query = `bookingadmin/get/bookings/${filter}`;
        return this.getData<Booking[]>(query);
    }
    private async getData<T>(query: string): Promise<T> {
        return new Promise<T>(async resolve => {
            let dr = await this.query(query);
            if (dr.success) {
                resolve(dr.data);
            } else {
                resolve();
            }
        });
    }
    private async postData<T>(query: string, data?: T | null): Promise<ServiceResult> {
        return new Promise<ServiceResult>(async resolve => {
            let dr: DataResult;
            if (data && data !== null) {
                dr = await this.post(query, data);
            } else {
                dr = await this.post(query);
            }
            if (dr.success) {
                resolve({ success: true, errors: [] });
            } else {
                let errors = dr.message.split("|");
                resolve({ success: false, errors: errors });
            }
        });
    }
}
