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
    WallResource,
    WallResourceFromJSON,
    WallResourceFromJSONTyped,
    WallResourceToJSON,
} from './';

/**
 * 
 * @export
 * @interface WallApplication
 */
export interface WallApplication {
    /**
     * 
     * @type {WallResource}
     * @memberof WallApplication
     */
    root: WallResource;
    /**
     * Last modification time
     * @type {Date}
     * @memberof WallApplication
     */
    modifiedAt: Date;
}

export function WallApplicationFromJSON(json: any): WallApplication {
    return WallApplicationFromJSONTyped(json, false);
}

export function WallApplicationFromJSONTyped(json: any, ignoreDiscriminator: boolean): WallApplication {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'root': WallResourceFromJSON(json['root']),
        'modifiedAt': (new Date(json['modifiedAt'])),
    };
}

export function WallApplicationToJSON(value?: WallApplication | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'root': WallResourceToJSON(value.root),
        'modifiedAt': (value.modifiedAt.toISOString()),
    };
}


