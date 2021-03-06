// tslint:disable
// eslint-disable
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
    ResourceType,
    ResourceTypeFromJSON,
    ResourceTypeFromJSONTyped,
    ResourceTypeToJSON,
} from './';

/**
 * 
 * @export
 * @interface Resource
 */
export interface Resource {
    /**
     * Resource id.
     * @type {string}
     * @memberof Resource
     */
    readonly id?: string;
    /**
     * Resource parent id.
     * @type {string}
     * @memberof Resource
     */
    parent_id?: string;
    /**
     * 
     * @type {number}
     * @memberof Resource
     */
    order_number?: number;
    /**
     * 
     * @type {ResourceType}
     * @memberof Resource
     */
    type: ResourceType;
    /**
     * 
     * @type {Array<KeyValueProperty>}
     * @memberof Resource
     */
    styles?: Array<KeyValueProperty>;
    /**
     * 
     * @type {Array<KeyValueProperty>}
     * @memberof Resource
     */
    properties?: Array<KeyValueProperty>;
    /**
     * Resource display name.
     * @type {string}
     * @memberof Resource
     */
    name: string;
    /**
     * Resource data, either URL on images, videos, etc and text data on text resources
     * @type {string}
     * @memberof Resource
     */
    data?: string;
    /**
     * Resource slug name.
     * @type {string}
     * @memberof Resource
     */
    slug: string;
    /**
     * Creation time
     * @type {Date}
     * @memberof Resource
     */
    readonly created_at?: Date;
    /**
     * Last modification time
     * @type {Date}
     * @memberof Resource
     */
    readonly modified_at?: Date;
    /**
     * 
     * @type {string}
     * @memberof Resource
     */
    creator_id?: string;
    /**
     * 
     * @type {string}
     * @memberof Resource
     */
    last_modifier_id?: string;
}

export function ResourceFromJSON(json: any): Resource {
    return ResourceFromJSONTyped(json, false);
}

export function ResourceFromJSONTyped(json: any, ignoreDiscriminator: boolean): Resource {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'parent_id': !exists(json, 'parentId') ? undefined : json['parentId'],
        'order_number': !exists(json, 'orderNumber') ? undefined : json['orderNumber'],
        'type': ResourceTypeFromJSON(json['type']),
        'styles': !exists(json, 'styles') ? undefined : (json['styles'] as Array<any>).map(KeyValuePropertyFromJSON),
        'properties': !exists(json, 'properties') ? undefined : (json['properties'] as Array<any>).map(KeyValuePropertyFromJSON),
        'name': json['name'],
        'data': !exists(json, 'data') ? undefined : json['data'],
        'slug': json['slug'],
        'created_at': !exists(json, 'createdAt') ? undefined : new Date(json['createdAt']),
        'modified_at': !exists(json, 'modifiedAt') ? undefined : new Date(json['modifiedAt']),
        'creator_id': !exists(json, 'creatorId') ? undefined : json['creatorId'],
        'last_modifier_id': !exists(json, 'lastModifierId') ? undefined : json['lastModifierId'],
    };
}

export function ResourceToJSON(value?: Resource | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'parentId': value.parent_id,
        'orderNumber': value.order_number,
        'type': ResourceTypeToJSON(value.type),
        'styles': value.styles == null ? undefined : (value.styles as Array<any>).map(KeyValuePropertyToJSON),
        'properties': value.properties == null ? undefined : (value.properties as Array<any>).map(KeyValuePropertyToJSON),
        'name': value.name,
        'data': value.data,
        'slug': value.slug,
        'creatorId': value.creator_id,
        'lastModifierId': value.last_modifier_id,
    };
}


