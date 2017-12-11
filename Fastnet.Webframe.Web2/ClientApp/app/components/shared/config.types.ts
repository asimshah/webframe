export enum FactoryName {
    None,
    DonWhillansHut
}
export class RouteRedirection {
    fromRoute: string;
    toRoute: string;
}
export class ClientCustomisation {
    factory: FactoryName;
    routeRedirections: RouteRedirection[];
}