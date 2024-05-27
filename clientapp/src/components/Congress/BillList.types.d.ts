//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v11.0.0.0 (Newtonsoft.Json v13.0.0.0) (http://NJsonSchema.org)
// </auto-generated>
//----------------------







export class LatestAction implements ILatestAction {
    actionDate!: Date;
    text!: string;

    [key: string]: any;

    constructor(data?: ILatestAction) {
        if (data) {
            for (const property in data) {
                if (Object.prototype.hasOwnProperty.call(data, property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            for (const property in _data) {
                if (Object.prototype.hasOwnProperty.call(_data, property))
                    this[property] = _data[property];
            }
            this.actionDate = _data["actionDate"] ? new Date(_data["actionDate"].toString()) : <any>undefined;
            this.text = _data["text"];
        }
    }

    static fromJS(data: any): LatestAction {
        data = typeof data === 'object' ? data : {};
        const result = new LatestAction();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (const property in this) {
            if (Object.prototype.hasOwnProperty.call(this, property))
                data[property] = this[property];
        }
        data["actionDate"] = this.actionDate ? formatDate(this.actionDate) : <any>undefined;
        data["text"] = this.text;
        return data;
    }
}

export interface ILatestAction {
    actionDate: Date;
    text: string;

    [key: string]: any;
}

export class Bill implements IBill {
    congress!: number;
    latestAction!: LatestAction;
    number!: string;
    originChamber!: string;
    originChamberCode!: string;
    title!: string;
    type!: string;
    updateDate!: Date;
    updateDateIncludingText!: Date;
    url!: string;

    [key: string]: any;

    constructor(data?: IBill) {
        if (data) {
            for (const property in data) {
                if (Object.prototype.hasOwnProperty.call(data, property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            for (const property in _data) {
                if (Object.prototype.hasOwnProperty.call(_data, property))
                    this[property] = _data[property];
            }
            this.congress = _data["congress"];
            this.latestAction = _data["latestAction"] ? LatestAction.fromJS(_data["latestAction"]) : <any>undefined;
            this.number = _data["number"];
            this.originChamber = _data["originChamber"];
            this.originChamberCode = _data["originChamberCode"];
            this.title = _data["title"];
            this.type = _data["type"];
            this.updateDate = _data["updateDate"] ? new Date(_data["updateDate"].toString()) : <any>undefined;
            this.updateDateIncludingText = _data["updateDateIncludingText"] ? new Date(_data["updateDateIncludingText"].toString()) : <any>undefined;
            this.url = _data["url"];
        }
    }

    static fromJS(data: any): Bill {
        data = typeof data === 'object' ? data : {};
        const result = new Bill();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (const property in this) {
            if (Object.prototype.hasOwnProperty.call(this, property))
                data[property] = this[property];
        }
        data["congress"] = this.congress;
        data["latestAction"] = this.latestAction ? this.latestAction.toJSON() : <any>undefined;
        data["number"] = this.number;
        data["originChamber"] = this.originChamber;
        data["originChamberCode"] = this.originChamberCode;
        data["title"] = this.title;
        data["type"] = this.type;
        data["updateDate"] = this.updateDate ? formatDate(this.updateDate) : <any>undefined;
        data["updateDateIncludingText"] = this.updateDateIncludingText ? this.updateDateIncludingText.toISOString() : <any>undefined;
        data["url"] = this.url;
        return data;
    }
}

export interface IBill {
    congress: number;
    latestAction: LatestAction;
    number: string;
    originChamber: string;
    originChamberCode: string;
    title: string;
    type: string;
    updateDate: Date;
    updateDateIncludingText: Date;
    url: string;

    [key: string]: any;
}

export class Pagination implements IPagination {
    count!: number;
    next!: string;

    [key: string]: any;

    constructor(data?: IPagination) {
        if (data) {
            for (const property in data) {
                if (Object.prototype.hasOwnProperty.call(data, property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            for (const property in _data) {
                if (Object.prototype.hasOwnProperty.call(_data, property))
                    this[property] = _data[property];
            }
            this.count = _data["count"];
            this.next = _data["next"];
        }
    }

    static fromJS(data: any): Pagination {
        data = typeof data === 'object' ? data : {};
        const result = new Pagination();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (const property in this) {
            if (Object.prototype.hasOwnProperty.call(this, property))
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
    contentType!: string;
    format!: string;

    [key: string]: any;

    constructor(data?: IRequest) {
        if (data) {
            for (const property in data) {
                if (Object.prototype.hasOwnProperty.call(data, property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            for (const property in _data) {
                if (Object.prototype.hasOwnProperty.call(_data, property))
                    this[property] = _data[property];
            }
            this.contentType = _data["contentType"];
            this.format = _data["format"];
        }
    }

    static fromJS(data: any): Request {
        data = typeof data === 'object' ? data : {};
        const result = new Request();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (const property in this) {
            if (Object.prototype.hasOwnProperty.call(this, property))
                data[property] = this[property];
        }
        data["contentType"] = this.contentType;
        data["format"] = this.format;
        return data;
    }
}

export interface IRequest {
    contentType: string;
    format: string;

    [key: string]: any;
}

export class BillListAllResponse implements IBillListAllResponse {
    bills!: Bill[];
    pagination!: Pagination;
    request!: Request;

    [key: string]: any;

    constructor(data?: IBillListAllResponse) {
        if (data) {
            for (const property in data) {
                if (Object.prototype.hasOwnProperty.call(data, property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            for (const property in _data) {
                if (Object.prototype.hasOwnProperty.call(_data, property))
                    this[property] = _data[property];
            }
            if (Array.isArray(_data["bills"])) {
                this.bills = [] as any;
                for (const item of _data["bills"])
                    this.bills!.push(Bill.fromJS(item));
            }
            this.pagination = _data["pagination"] ? Pagination.fromJS(_data["pagination"]) : <any>undefined;
            this.request = _data["request"] ? Request.fromJS(_data["request"]) : <any>undefined;
        }
    }

    static fromJS(data: any): BillListAllResponse {
        data = typeof data === 'object' ? data : {};
        const result = new BillListAllResponse();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (const property in this) {
            if (Object.prototype.hasOwnProperty.call(this, property))
                data[property] = this[property];
        }
        if (Array.isArray(this.bills)) {
            data["bills"] = [];
            for (const item of this.bills)
                data["bills"].push(item.toJSON());
        }
        data["pagination"] = this.pagination ? this.pagination.toJSON() : <any>undefined;
        data["request"] = this.request ? this.request.toJSON() : <any>undefined;
        return data;
    }
}

export interface IBillListAllResponse {
    bills: Bill[];
    pagination: Pagination;
    request: Request;

    [key: string]: any;
}

function formatDate(d: Date) {
    return d.getFullYear() + '-' + 
        (d.getMonth() < 9 ? ('0' + (d.getMonth()+1)) : (d.getMonth()+1)) + '-' +
        (d.getDate() < 10 ? ('0' + d.getDate()) : d.getDate());
}