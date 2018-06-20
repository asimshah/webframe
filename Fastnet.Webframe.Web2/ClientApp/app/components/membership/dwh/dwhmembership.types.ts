import { Member } from "../membership.types";

export class DWHMember extends Member
{
    bmcMembership: string;
    organisation: string;
}