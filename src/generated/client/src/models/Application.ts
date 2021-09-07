/* tslint:disable */
/* eslint-disable */
/**
 * OiOi content management API
 * OiOi content management API spec
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface Application
 */
export interface Application {
    /**
     * Application id.
     * @type {string}
     * @memberof Application
     */
    readonly id?: string;
    /**
     * Application root resource id.
     * @type {string}
     * @memberof Application
     */
    readonly rootResourceId?: string;
    /**
     * Application name.
     * @type {string}
     * @memberof Application
     */
    name: string;
    /**
     * Id of currently active content version resource
     * @type {string}
     * @memberof Application
     */
    activeContentVersionResourceId?: string;
    /**
     * Creation time
     * @type {Date}
     * @memberof Application
     */
    readonly createdAt?: Date;
    /**
     * Last modification time
     * @type {Date}
     * @memberof Application
     */
    readonly modifiedAt?: Date;
    /**
     * 
     * @type {string}
     * @memberof Application
     */
    creatorId?: string;
    /**
     * 
     * @type {string}
     * @memberof Application
     */
    lastModifierId?: string;
}

export function ApplicationFromJSON(json: any): Application {
    return ApplicationFromJSONTyped(json, false);
}

export function ApplicationFromJSONTyped(json: any, ignoreDiscriminator: boolean): Application {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'rootResourceId': !exists(json, 'rootResourceId') ? undefined : json['rootResourceId'],
        'name': json['name'],
        'activeContentVersionResourceId': !exists(json, 'activeContentVersionResourceId') ? undefined : json['activeContentVersionResourceId'],
        'createdAt': !exists(json, 'createdAt') ? undefined : (new Date(json['createdAt'])),
        'modifiedAt': !exists(json, 'modifiedAt') ? undefined : (new Date(json['modifiedAt'])),
        'creatorId': !exists(json, 'creatorId') ? undefined : json['creatorId'],
        'lastModifierId': !exists(json, 'lastModifierId') ? undefined : json['lastModifierId'],
    };
}

export function ApplicationToJSON(value?: Application | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'name': value.name,
        'activeContentVersionResourceId': value.activeContentVersionResourceId,
        'creatorId': value.creatorId,
        'lastModifierId': value.lastModifierId,
    };
}


