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
 * @interface Customer
 */
export interface Customer {
    /**
     * Customer id.
     * @type {string}
     * @memberof Customer
     */
    readonly id?: string;
    /**
     * Customer name.
     * @type {string}
     * @memberof Customer
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof Customer
     */
    imageUrl?: string;
    /**
     * Creation time
     * @type {Date}
     * @memberof Customer
     */
    readonly createdAt?: Date;
    /**
     * Last modification time
     * @type {Date}
     * @memberof Customer
     */
    readonly modifiedAt?: Date;
    /**
     * 
     * @type {string}
     * @memberof Customer
     */
    creatorId?: string;
    /**
     * 
     * @type {string}
     * @memberof Customer
     */
    lastModifierId?: string;
}

export function CustomerFromJSON(json: any): Customer {
    return CustomerFromJSONTyped(json, false);
}

export function CustomerFromJSONTyped(json: any, ignoreDiscriminator: boolean): Customer {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'name': json['name'],
        'imageUrl': !exists(json, 'imageUrl') ? undefined : json['imageUrl'],
        'createdAt': !exists(json, 'createdAt') ? undefined : (new Date(json['createdAt'])),
        'modifiedAt': !exists(json, 'modifiedAt') ? undefined : (new Date(json['modifiedAt'])),
        'creatorId': !exists(json, 'creatorId') ? undefined : json['creatorId'],
        'lastModifierId': !exists(json, 'lastModifierId') ? undefined : json['lastModifierId'],
    };
}

export function CustomerToJSON(value?: Customer | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'name': value.name,
        'imageUrl': value.imageUrl,
        'creatorId': value.creatorId,
        'lastModifierId': value.lastModifierId,
    };
}


