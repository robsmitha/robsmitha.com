/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable no-prototype-builtins */

//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v11.0.0.0 (Newtonsoft.Json v13.0.0.0) (http://NJsonSchema.org)
// </auto-generated>
//----------------------







export class Amendment implements IAmendment {
    congress!: number;
    number!: string;
    type!: string;
    updateDate!: Date;
    url!: string;

    [key: string]: any;

    constructor(data?: IAmendment) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            for (var property in _data) {
                if (_data.hasOwnProperty(property))
                    this[property] = _data[property];
            }
            this.congress = _data["congress"];
            this.number = _data["number"];
            this.type = _data["type"];
            this.updateDate = _data["updateDate"] ? new Date(_data["updateDate"].toString()) : <any>undefined;
            this.url = _data["url"];
        }
    }

    static fromJS(data: any): Amendment {
        data = typeof data === 'object' ? data : {};
        let result = new Amendment();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (var property in this) {
            if (this.hasOwnProperty(property))
                data[property] = this[property];
        }
        data["congress"] = this.congress;
        data["number"] = this.number;
        data["type"] = this.type;
        data["updateDate"] = this.updateDate ? this.updateDate.toISOString() : <any>undefined;
        data["url"] = this.url;
        return data;
    }
}

export interface IAmendment {
    congress: number;
    number: string;
    type: string;
    updateDate: Date;
    url: string;

    [key: string]: any;
}

export class Pagination implements IPagination {
    count!: number;
    next!: string;

    [key: string]: any;

    constructor(data?: IPagination) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            for (var property in _data) {
                if (_data.hasOwnProperty(property))
                    this[property] = _data[property];
            }
            this.count = _data["count"];
            this.next = _data["next"];
        }
    }

    static fromJS(data: any): Pagination {
        data = typeof data === 'object' ? data : {};
        let result = new Pagination();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (var property in this) {
            if (this.hasOwnProperty(property))
                data[property] = this[property];
        }
        data["count"] = this.count;
        data["next"] = this.next;
        return data;
    }
}

export interface IPagination {
    count: number;
    next: string;

    [key: string]: any;
}

export class Request implements IRequest {
    billNumber!: string;
    billType!: string;
    billUrl!: string;
    congress!: string;
    contentType!: string;
    format!: string;

    [key: string]: any;

    constructor(data?: IRequest) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            for (var property in _data) {
                if (_data.hasOwnProperty(property))
                    this[property] = _data[property];
            }
            this.billNumber = _data["billNumber"];
            this.billType = _data["billType"];
            this.billUrl = _data["billUrl"];
            this.congress = _data["congress"];
            this.contentType = _data["contentType"];
            this.format = _data["format"];
        }
    }

    static fromJS(data: any): Request {
        data = typeof data === 'object' ? data : {};
        let result = new Request();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (var property in this) {
            if (this.hasOwnProperty(property))
                data[property] = this[property];
        }
        data["billNumber"] = this.billNumber;
        data["billType"] = this.billType;
        data["billUrl"] = this.billUrl;
        data["congress"] = this.congress;
        data["contentType"] = this.contentType;
        data["format"] = this.format;
        return data;
    }
}

export interface IRequest {
    billNumber: string;
    billType: string;
    billUrl: string;
    congress: string;
    contentType: string;
    format: string;

    [key: string]: any;
}

export class BillAmendmentsResponse implements IBillAmendmentsResponse {
    amendments!: Amendment[];
    pagination!: Pagination;
    request!: Request;

    [key: string]: any;

    constructor(data?: IBillAmendmentsResponse) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            for (var property in _data) {
                if (_data.hasOwnProperty(property))
                    this[property] = _data[property];
            }
            if (Array.isArray(_data["amendments"])) {
                this.amendments = [] as any;
                for (let item of _data["amendments"])
                    this.amendments!.push(Amendment.fromJS(item));
            }
            this.pagination = _data["pagination"] ? Pagination.fromJS(_data["pagination"]) : <any>undefined;
            this.request = _data["request"] ? Request.fromJS(_data["request"]) : <any>undefined;
        }
    }

    static fromJS(data: any): BillAmendmentsResponse {
        data = typeof data === 'object' ? data : {};
        let result = new BillAmendmentsResponse();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (var property in this) {
            if (this.hasOwnProperty(property))
                data[property] = this[property];
        }
        if (Array.isArray(this.amendments)) {
            data["amendments"] = [];
            for (let item of this.amendments)
                data["amendments"].push(item.toJSON());
        }
        data["pagination"] = this.pagination ? this.pagination.toJSON() : <any>undefined;
        data["request"] = this.request ? this.request.toJSON() : <any>undefined;
        return data;
    }
}

export interface IBillAmendmentsResponse {
    amendments: Amendment[];
    pagination: Pagination;
    request: Request;

    [key: string]: any;
}
