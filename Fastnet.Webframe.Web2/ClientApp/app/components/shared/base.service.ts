import { Inject, OnInit, Injectable } from '@angular/core';
import { Http, Response, Headers, BaseRequestOptions, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


export class ServiceResult {
    success: boolean;
    errors: string[];
    data?: any;
}
export class DataResult {
    data: any;
    exceptionMessage: string;
    message: string;
    success: boolean;
}

export abstract class BaseService {
    private baseUrl: string | null;
    //private initialised: boolean = false;
    constructor(protected http: Http) {
        //console.log(`BaseService(): ${location.protocol}://${location.host}`);
        this.baseUrl = null;
        if (this.RunningInNode()) {
            this.baseUrl = "http://localhost:60933";
        }
    }
    protected async queryFromDataResult<T>(query: string): Promise<T> {
        return new Promise<T>(async (resolve, reject) => {
            let dr = await this.query(query);
            if (dr.success) {
                resolve(dr.data as T);
            } else {
                reject(`${dr.message}, ${dr.exceptionMessage}`);
            }
        });
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
                    if (dr.exceptionMessage !== null) {
                        console.log(`Exception: ${JSON.stringify(dr)}`);
                        dr.message = dr.exceptionMessage;
                    }
                }
                return dr;
            })
            .catch(this.handleError)
            .toPromise();
    }
    protected post(url: string, data?: any): Promise<DataResult> {
        return this.http.post(url, data)
            .map(r => {
                let dr = r.json() as DataResult;
                if (!dr.success) {
                    if (dr.exceptionMessage !== null) {
                        console.log(`Exception: ${JSON.stringify(dr)}`);
                        dr.message = dr.exceptionMessage;
                    }
                }
                return dr;
            })
            .catch(this.handleError)
            .toPromise();
    }
    protected postWithOptions(url: string, data: any, options: RequestOptions): Promise<DataResult> {
        return this.http.post(url, data, options)
            .map(r => {
                let dr = r.json() as DataResult;
                if (!dr.success) {
                    console.log(`ErrorResult: ${JSON.stringify(dr)}`);
                }
                return dr;
            })
            .catch((e) => this.handleError(e))
            .toPromise();
    }
    private handleError(error: any): Promise<any> {
        //console.log('An error occurred', error);
        if (error.status === 401) {
            console.log(`error status 401: ${JSON.stringify(error)}`);
            let msg = "Unauthorised access. If you were logged in, this can occur because you have been idle for a long time. If so, please refresh the browser window and login again.";
            alert(msg);
        } else {
            alert(error);
        }
        return Promise.resolve(error);
        //return Promise.reject(error.message || error);
    }
    private RunningInNode(): boolean {
        if (typeof window === 'undefined') {
            return true;
        }
        return false;
    }

}
@Injectable()
export class DefaultRequestOptions extends BaseRequestOptions {
    headers = new Headers({
        'Content-Type': 'application/json'
    });
}