import { Inject, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

class DataResult {
    data: any;
    exceptionMessage: string;
    message: string;
    success: boolean;
}

export abstract class BaseService {
    private baseUrl: string;
    private initialised: boolean = false;
    constructor(protected http: Http) {
    }
    protected query(url: string): Promise<DataResult> {
        return this.http.get(url)
            .map(r => {
                let dr = r.json() as DataResult;
                console.log(`${JSON.stringify(dr)}`);
                if (!dr.success) {
                    console.log(`${JSON.stringify(dr)}`);
                }
                //} else {
                //    console.log(`${JSON.stringify(dr)}`);
                //}
                return dr;
            })
            .catch(this.handleError)
            .toPromise();
    }
    protected post(url: string, data: any): Promise<DataResult> {
        return this.http.post(url, data)
            .map(r => {
                let dr = r.json() as DataResult;
                console.log(`${JSON.stringify(dr)}`);
                if (!dr.success) {
                    console.log(`${JSON.stringify(dr)}`);
                } else {
                    console.log(`${JSON.stringify(dr)}`);
                }
                return dr;
            })
            .catch(this.handleError)
            .toPromise();
    }
    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}