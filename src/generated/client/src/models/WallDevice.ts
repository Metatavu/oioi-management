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
    WallDeviceApplication,
    WallDeviceApplicationFromJSON,
    WallDeviceApplicationFromJSONTyped,
    WallDeviceApplicationToJSON,
} from './';

/**
 * 
 * @export
 * @interface WallDevice
 */
export interface WallDevice {
    /**
     * 
     * @type {string}
     * @memberof WallDevice
     */
    name: string;
    /**
     * 
     * @type {Array<WallDeviceApplication>}
     * @memberof WallDevice
     */
    applications: Array<WallDeviceApplication>;
    /**
     * 
     * @type {string}
     * @memberof WallDevice
     */
    activeApplication?: string;
    /**
     * Last modification time
     * @type {Date}
     * @memberof WallDevice
     */
    readonly modifiedAt: Date;
}

export function WallDeviceFromJSON(json: any): WallDevice {
    return WallDeviceFromJSONTyped(json, false);
}

export function WallDeviceFromJSONTyped(json: any, ignoreDiscriminator: boolean): WallDevice {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'name': json['name'],
        'applications': ((json['applications'] as Array<any>).map(WallDeviceApplicationFromJSON)),
        'activeApplication': !exists(json, 'activeApplication') ? undefined : json['activeApplication'],
        'modifiedAt': (new Date(json['modifiedAt'])),
    };
}

export function WallDeviceToJSON(value?: WallDevice | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'name': value.name,
        'applications': ((value.applications as Array<any>).map(WallDeviceApplicationToJSON)),
        'activeApplication': value.activeApplication,
    };
}


