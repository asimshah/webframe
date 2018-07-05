import { Member } from "../../shared/common.types";


export class DWHMember extends Member
{
    bmcMembership: string;
    organisation: string;
    pastBookingCount: number;
    futureBookingCount: number;
}