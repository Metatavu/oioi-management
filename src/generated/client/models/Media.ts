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
    MediaType,
    MediaTypeFromJSON,
    MediaTypeFromJSONTyped,
    MediaTypeToJSON,
} from './';

/**
 * 
 * @export
 * @interface Media
 */
export interface Media {
    /**
     * Media id.
     * @type {string}
     * @memberof Media
     */
    readonly id?: string;
    /**
     * 
     * @type {string}
     * @memberof Media
     */
    url: string;
    /**
     * 
     * @type {MediaType}
     * @memberof Media
     */
    type: MediaType;
    /**
     * 
     * @type {string}
     * @memberof Media
     */
    contentType: string;
    /**
     * Creation time
     * @type {Date}
     * @memberof Media
     */
    readonly createdAt?: Date;
    /**
     * Last modification time
     * @type {Date}
     * @memberof Media
     */
    readonly modifiedAt?: Date;
    /**
     * 
     * @type {string}
     * @memberof Media
     */
    creatorId?: string;
    /**
     * 
     * @type {string}
     * @memberof Media
     */
    lastModifierId?: string;
}

export function MediaFromJSON(json: any): Media {
    return MediaFromJSONTyped(json, false);
}

export function MediaFromJSONTyped(json: any, ignoreDiscriminator: boolean): Media {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'url': json['url'],
        'type': MediaTypeFromJSON(json['type']),
        'contentType': json['contentType'],
        'createdAt': !exists(json, 'createdAt') ? undefined : (new Date(json['createdAt'])),
        'modifiedAt': !exists(json, 'modifiedAt') ? undefined : (new Date(json['modifiedAt'])),
        'creatorId': !exists(json, 'creatorId') ? undefined : json['creatorId'],
        'lastModifierId': !exists(json, 'lastModifierId') ? undefined : json['lastModifierId'],
    };
}

export function MediaToJSON(value?: Media | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'url': value.url,
        'type': MediaTypeToJSON(value.type),
        'contentType': value.contentType,
        'creatorId': value.creatorId,
        'lastModifierId': value.lastModifierId,
    };
}


