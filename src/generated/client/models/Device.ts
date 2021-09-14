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
import {
    KeyValueProperty,
    KeyValuePropertyFromJSON,
    KeyValuePropertyFromJSONTyped,
    KeyValuePropertyToJSON,
} from './';

/**
 * 
 * @export
 * @interface Device
 */
export interface Device {
    /**
     * Device id.
     * @type {string}
     * @memberof Device
     */
    readonly id?: string;
    /**
     * Device name.
     * @type {string}
     * @memberof Device
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof Device
     */
    imageUrl?: string;
    /**
     * 
     * @type {string}
     * @memberof Device
     */
    apiKey?: string;
    /**
     * 
     * @type {Array<KeyValueProperty>}
     * @memberof Device
     */
    metas?: Array<KeyValueProperty>;
    /**
     * Creation time
     * @type {Date}
     * @memberof Device
     */
    readonly createdAt?: Date;
    /**
     * Last modification time
     * @type {Date}
     * @memberof Device
     */
    readonly modifiedAt?: Date;
    /**
     * 
     * @type {string}
     * @memberof Device
     */
    creatorId?: string;
    /**
     * 
     * @type {string}
     * @memberof Device
     */
    lastModifierId?: string;
}

export function DeviceFromJSON(json: any): Device {
    return DeviceFromJSONTyped(json, false);
}

export function DeviceFromJSONTyped(json: any, ignoreDiscriminator: boolean): Device {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'name': json['name'],
        'imageUrl': !exists(json, 'imageUrl') ? undefined : json['imageUrl'],
        'apiKey': !exists(json, 'apiKey') ? undefined : json['apiKey'],
        'metas': !exists(json, 'metas') ? undefined : ((json['metas'] as Array<any>).map(KeyValuePropertyFromJSON)),
        'createdAt': !exists(json, 'createdAt') ? undefined : (new Date(json['createdAt'])),
        'modifiedAt': !exists(json, 'modifiedAt') ? undefined : (new Date(json['modifiedAt'])),
        'creatorId': !exists(json, 'creatorId') ? undefined : json['creatorId'],
        'lastModifierId': !exists(json, 'lastModifierId') ? undefined : json['lastModifierId'],
    };
}

export function DeviceToJSON(value?: Device | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'name': value.name,
        'imageUrl': value.imageUrl,
        'apiKey': value.apiKey,
        'metas': value.metas === undefined ? undefined : ((value.metas as Array<any>).map(KeyValuePropertyToJSON)),
        'creatorId': value.creatorId,
        'lastModifierId': value.lastModifierId,
    };
}

