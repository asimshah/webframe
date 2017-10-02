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
    private baseUrl: string | null;
    private initialised: boolean = false;
    constructor(protected http: Http) {
        //console.log(`BaseService(): ${location.protocol}://${location.host}`);
        this.baseUrl = null;
        if (this.RunningInNode()) {
            this.baseUrl = "http://localhost:60933";
        }
    }
    protected query(url: string): Promise<DataResult> {
        if (this.baseUrl != null) {
            url = `${this.baseUrl}/${url}`;
        }
        //let fullUrl = `http://localhost:60933/${url}`;
        return this.http.get(url)
            .map(r => {
                let dr = r.json() as DataResult;
                if (!dr.success) {
                    console.log(`ErrorResult: ${JSON.stringify(dr)}`);
                }
                return dr;
            })
            .catch(this.handleError)
            .toPromise();
    }
    protected post(url: string, data: any): Promise<DataResult> {
        return this.http.post(url, data)
            .map(r => {
                let dr = r.json() as DataResult;
                if (!dr.success) {
                    console.log(`ErrorResult: ${JSON.stringify(dr)}`);
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
    private RunningInNode(): boolean {
        if (typeof window === 'undefined') {
            return true;
        }
        return false;
        //let r = false;
        //try {
        //    r = window === undefined;
            
        //} catch (x) { r = true; };
        //console.log(`running in node = ${r}`);
        //return r;
    }
}