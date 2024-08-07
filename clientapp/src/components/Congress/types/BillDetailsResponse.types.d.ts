/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable no-prototype-builtins */

//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v11.0.0.0 (Newtonsoft.Json v13.0.0.0) (http://NJsonSchema.org)
// </auto-generated>
//----------------------







export class Bill implements IBill {
    actions!: Actions;
    amendments!: Actions;
    cboCostEstimates!: CboCostEstimate[];
    committeeReports!: CommitteeReport[];
    committees!: Actions;
    congress!: number;
    constitutionalAuthorityStatementText!: string;
    cosponsors!: Cosponsors;
    introducedDate!: Date;
    latestAction!: LatestAction;
    laws!: Law[];
    number!: string;
    originChamber!: string;
    originChamberCode!: string;
    policyArea!: PolicyArea;
    relatedBills!: Actions;
    sponsors!: Sponsor[];
    subjects!: Actions;
    summaries!: Actions;
    textVersions!: Actions;
    title!: string;
    titles!: Actions;
    type!: string;
    updateDate!: Date;
    updateDateIncludingText!: Date;

    [key: string]: any;

    constructor(data?: IBill) {
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
            this.actions = _data["actions"] ? Actions.fromJS(_data["actions"]) : <any>undefined;
            this.amendments = _data["amendments"] ? Actions.fromJS(_data["amendments"]) : <any>undefined;
            if (Array.isArray(_data["cboCostEstimates"])) {
                this.cboCostEstimates = [] as any;
                for (let item of _data["cboCostEstimates"])
                    this.cboCostEstimates!.push(CboCostEstimate.fromJS(item));
            }
            if (Array.isArray(_data["committeeReports"])) {
                this.committeeReports = [] as any;
                for (let item of _data["committeeReports"])
                    this.committeeReports!.push(CommitteeReport.fromJS(item));
            }
            this.committees = _data["committees"] ? Actions.fromJS(_data["committees"]) : <any>undefined;
            this.congress = _data["congress"];
            this.constitutionalAuthorityStatementText = _data["constitutionalAuthorityStatementText"];
            this.cosponsors = _data["cosponsors"] ? Cosponsors.fromJS(_data["cosponsors"]) : <any>undefined;
            this.introducedDate = _data["introducedDate"] ? new Date(_data["introducedDate"].toString()) : <any>undefined;
            this.latestAction = _data["latestAction"] ? LatestAction.fromJS(_data["latestAction"]) : <any>undefined;
            if (Array.isArray(_data["laws"])) {
                this.laws = [] as any;
                for (let item of _data["laws"])
                    this.laws!.push(Law.fromJS(item));
            }
            this.number = _data["number"];
            this.originChamber = _data["originChamber"];
            this.originChamberCode = _data["originChamberCode"];
            this.policyArea = _data["policyArea"] ? PolicyArea.fromJS(_data["policyArea"]) : <any>undefined;
            this.relatedBills = _data["relatedBills"] ? Actions.fromJS(_data["relatedBills"]) : <any>undefined;
            if (Array.isArray(_data["sponsors"])) {
                this.sponsors = [] as any;
                for (let item of _data["sponsors"])
                    this.sponsors!.push(Sponsor.fromJS(item));
            }
            this.subjects = _data["subjects"] ? Actions.fromJS(_data["subjects"]) : <any>undefined;
            this.summaries = _data["summaries"] ? Actions.fromJS(_data["summaries"]) : <any>undefined;
            this.textVersions = _data["textVersions"] ? Actions.fromJS(_data["textVersions"]) : <any>undefined;
            this.title = _data["title"];
            this.titles = _data["titles"] ? Actions.fromJS(_data["titles"]) : <any>undefined;
            this.type = _data["type"];
            this.updateDate = _data["updateDate"] ? new Date(_data["updateDate"].toString()) : <any>undefined;
            this.updateDateIncludingText = _data["updateDateIncludingText"] ? new Date(_data["updateDateIncludingText"].toString()) : <any>undefined;
        }
    }

    static fromJS(data: any): Bill {
        data = typeof data === 'object' ? data : {};
        let result = new Bill();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (var property in this) {
            if (this.hasOwnProperty(property))
                data[property] = this[property];
        }
        data["actions"] = this.actions ? this.actions.toJSON() : <any>undefined;
        data["amendments"] = this.amendments ? this.amendments.toJSON() : <any>undefined;
        if (Array.isArray(this.cboCostEstimates)) {
            data["cboCostEstimates"] = [];
            for (let item of this.cboCostEstimates)
                data["cboCostEstimates"].push(item.toJSON());
        }
        if (Array.isArray(this.committeeReports)) {
            data["committeeReports"] = [];
            for (let item of this.committeeReports)
                data["committeeReports"].push(item.toJSON());
        }
        data["committees"] = this.committees ? this.committees.toJSON() : <any>undefined;
        data["congress"] = this.congress;
        data["constitutionalAuthorityStatementText"] = this.constitutionalAuthorityStatementText;
        data["cosponsors"] = this.cosponsors ? this.cosponsors.toJSON() : <any>undefined;
        data["introducedDate"] = this.introducedDate ? formatDate(this.introducedDate) : <any>undefined;
        data["latestAction"] = this.latestAction ? this.latestAction.toJSON() : <any>undefined;
        if (Array.isArray(this.laws)) {
            data["laws"] = [];
            for (let item of this.laws)
                data["laws"].push(item.toJSON());
        }
        data["number"] = this.number;
        data["originChamber"] = this.originChamber;
        data["originChamberCode"] = this.originChamberCode;
        data["policyArea"] = this.policyArea ? this.policyArea.toJSON() : <any>undefined;
        data["relatedBills"] = this.relatedBills ? this.relatedBills.toJSON() : <any>undefined;
        if (Array.isArray(this.sponsors)) {
            data["sponsors"] = [];
            for (let item of this.sponsors)
                data["sponsors"].push(item.toJSON());
        }
        data["subjects"] = this.subjects ? this.subjects.toJSON() : <any>undefined;
        data["summaries"] = this.summaries ? this.summaries.toJSON() : <any>undefined;
        data["textVersions"] = this.textVersions ? this.textVersions.toJSON() : <any>undefined;
        data["title"] = this.title;
        data["titles"] = this.titles ? this.titles.toJSON() : <any>undefined;
        data["type"] = this.type;
        data["updateDate"] = this.updateDate ? this.updateDate.toISOString() : <any>undefined;
        data["updateDateIncludingText"] = this.updateDateIncludingText ? this.updateDateIncludingText.toISOString() : <any>undefined;
        return data;
    }
}

export interface IBill {
    actions: Actions;
    amendments: Actions;
    cboCostEstimates: CboCostEstimate[];
    committeeReports: CommitteeReport[];
    committees: Actions;
    congress: number;
    constitutionalAuthorityStatementText: string;
    cosponsors: Cosponsors;
    introducedDate: Date;
    latestAction: LatestAction;
    laws: Law[];
    number: string;
    originChamber: string;
    originChamberCode: string;
    policyArea: PolicyArea;
    relatedBills: Actions;
    sponsors: Sponsor[];
    subjects: Actions;
    summaries: Actions;
    textVersions: Actions;
    title: string;
    titles: Actions;
    type: string;
    updateDate: Date;
    updateDateIncludingText: Date;

    [key: string]: any;
}

export class Actions implements IActions {
    count!: number;
    url!: string;

    [key: string]: any;

    constructor(data?: IActions) {
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
            this.url = _data["url"];
        }
    }

    static fromJS(data: any): Actions {
        data = typeof data === 'object' ? data : {};
        let result = new Actions();
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
        data["url"] = this.url;
        return data;
    }
}

export interface IActions {
    count: number;
    url: string;

    [key: string]: any;
}

export class CboCostEstimate implements ICboCostEstimate {
    description!: string;
    pubDate!: Date;
    title!: string;
    url!: string;

    [key: string]: any;

    constructor(data?: ICboCostEstimate) {
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
            this.description = _data["description"];
            this.pubDate = _data["pubDate"] ? new Date(_data["pubDate"].toString()) : <any>undefined;
            this.title = _data["title"];
            this.url = _data["url"];
        }
    }

    static fromJS(data: any): CboCostEstimate {
        data = typeof data === 'object' ? data : {};
        let result = new CboCostEstimate();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (var property in this) {
            if (this.hasOwnProperty(property))
                data[property] = this[property];
        }
        data["description"] = this.description;
        data["pubDate"] = this.pubDate ? this.pubDate.toISOString() : <any>undefined;
        data["title"] = this.title;
        data["url"] = this.url;
        return data;
    }
}

export interface ICboCostEstimate {
    description: string;
    pubDate: Date;
    title: string;
    url: string;

    [key: string]: any;
}

export class CommitteeReport implements ICommitteeReport {
    citation!: string;
    url!: string;

    [key: string]: any;

    constructor(data?: ICommitteeReport) {
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
            this.citation = _data["citation"];
            this.url = _data["url"];
        }
    }

    static fromJS(data: any): CommitteeReport {
        data = typeof data === 'object' ? data : {};
        let result = new CommitteeReport();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (var property in this) {
            if (this.hasOwnProperty(property))
                data[property] = this[property];
        }
        data["citation"] = this.citation;
        data["url"] = this.url;
        return data;
    }
}

export interface ICommitteeReport {
    citation: string;
    url: string;

    [key: string]: any;
}

export class Cosponsors implements ICosponsors {
    count!: number;
    countIncludingWithdrawnCosponsors!: number;
    url!: string;

    [key: string]: any;

    constructor(data?: ICosponsors) {
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
            this.countIncludingWithdrawnCosponsors = _data["countIncludingWithdrawnCosponsors"];
            this.url = _data["url"];
        }
    }

    static fromJS(data: any): Cosponsors {
        data = typeof data === 'object' ? data : {};
        let result = new Cosponsors();
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
        data["countIncludingWithdrawnCosponsors"] = this.countIncludingWithdrawnCosponsors;
        data["url"] = this.url;
        return data;
    }
}

export interface ICosponsors {
    count: number;
    countIncludingWithdrawnCosponsors: number;
    url: string;

    [key: string]: any;
}

export class LatestAction implements ILatestAction {
    actionDate!: Date;
    text!: string;

    [key: string]: any;

    constructor(data?: ILatestAction) {
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
            this.actionDate = _data["actionDate"] ? new Date(_data["actionDate"].toString()) : <any>undefined;
            this.text = _data["text"];
        }
    }

    static fromJS(data: any): LatestAction {
        data = typeof data === 'object' ? data : {};
        let result = new LatestAction();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (var property in this) {
            if (this.hasOwnProperty(property))
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

export class Law implements ILaw {
    number!: string;
    type!: string;

    [key: string]: any;

    constructor(data?: ILaw) {
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
            this.number = _data["number"];
            this.type = _data["type"];
        }
    }

    static fromJS(data: any): Law {
        data = typeof data === 'object' ? data : {};
        let result = new Law();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (var property in this) {
            if (this.hasOwnProperty(property))
                data[property] = this[property];
        }
        data["number"] = this.number;
        data["type"] = this.type;
        return data;
    }
}

export interface ILaw {
    number: string;
    type: string;

    [key: string]: any;
}

export class PolicyArea implements IPolicyArea {
    name!: string;

    [key: string]: any;

    constructor(data?: IPolicyArea) {
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
            this.name = _data["name"];
        }
    }

    static fromJS(data: any): PolicyArea {
        data = typeof data === 'object' ? data : {};
        let result = new PolicyArea();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (var property in this) {
            if (this.hasOwnProperty(property))
                data[property] = this[property];
        }
        data["name"] = this.name;
        return data;
    }
}

export interface IPolicyArea {
    name: string;

    [key: string]: any;
}

export class Sponsor implements ISponsor {
    bioguideId!: string;
    district!: number;
    firstName!: string;
    fullName!: string;
    isByRequest!: string;
    lastName!: string;
    middleName!: string;
    party!: string;
    state!: string;
    url!: string;

    [key: string]: any;

    constructor(data?: ISponsor) {
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
            this.bioguideId = _data["bioguideId"];
            this.district = _data["district"];
            this.firstName = _data["firstName"];
            this.fullName = _data["fullName"];
            this.isByRequest = _data["isByRequest"];
            this.lastName = _data["lastName"];
            this.middleName = _data["middleName"];
            this.party = _data["party"];
            this.state = _data["state"];
            this.url = _data["url"];
        }
    }

    static fromJS(data: any): Sponsor {
        data = typeof data === 'object' ? data : {};
        let result = new Sponsor();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (var property in this) {
            if (this.hasOwnProperty(property))
                data[property] = this[property];
        }
        data["bioguideId"] = this.bioguideId;
        data["district"] = this.district;
        data["firstName"] = this.firstName;
        data["fullName"] = this.fullName;
        data["isByRequest"] = this.isByRequest;
        data["lastName"] = this.lastName;
        data["middleName"] = this.middleName;
        data["party"] = this.party;
        data["state"] = this.state;
        data["url"] = this.url;
        return data;
    }
}

export interface ISponsor {
    bioguideId: string;
    district: number;
    firstName: string;
    fullName: string;
    isByRequest: string;
    lastName: string;
    middleName: string;
    party: string;
    state: string;
    url: string;

    [key: string]: any;
}

export class Request implements IRequest {
    billNumber!: string;
    billType!: string;
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
        data["congress"] = this.congress;
        data["contentType"] = this.contentType;
        data["format"] = this.format;
        return data;
    }
}

export interface IRequest {
    billNumber: string;
    billType: string;
    congress: string;
    contentType: string;
    format: string;

    [key: string]: any;
}

export class BillDetailsResponse implements IBillDetailsResponse {
    bill!: Bill;
    request!: Request;

    [key: string]: any;

    constructor(data?: IBillDetailsResponse) {
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
            this.bill = _data["bill"] ? Bill.fromJS(_data["bill"]) : <any>undefined;
            this.request = _data["request"] ? Request.fromJS(_data["request"]) : <any>undefined;
        }
    }

    static fromJS(data: any): BillDetailsResponse {
        data = typeof data === 'object' ? data : {};
        let result = new BillDetailsResponse();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (var property in this) {
            if (this.hasOwnProperty(property))
                data[property] = this[property];
        }
        data["bill"] = this.bill ? this.bill.toJSON() : <any>undefined;
        data["request"] = this.request ? this.request.toJSON() : <any>undefined;
        return data;
    }
}

export interface IBillDetailsResponse {
    bill: Bill;
    request: Request;

    [key: string]: any;
}

function formatDate(d: Date) {
    return d.getFullYear() + '-' + 
        (d.getMonth() < 9 ? ('0' + (d.getMonth()+1)) : (d.getMonth()+1)) + '-' +
        (d.getDate() < 10 ? ('0' + d.getDate()) : d.getDate());
}