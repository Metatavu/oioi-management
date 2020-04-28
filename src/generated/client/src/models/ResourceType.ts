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

/**
 * 
 * @export
 * @enum {string}
 */
export enum ResourceType {
    ROOT = 'ROOT',
    INTRO = 'INTRO',
    LANGUAGEMENU = 'LANGUAGE_MENU',
    LANGUAGE = 'LANGUAGE',
    SLIDESHOW = 'SLIDESHOW',
    MENU = 'MENU',
    PAGE = 'PAGE',
    PDF = 'PDF',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    TEXT = 'TEXT'
}

export function ResourceTypeFromJSON(json: any): ResourceType {
    return ResourceTypeFromJSONTyped(json, false);
}

export function ResourceTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): ResourceType {
    return json as ResourceType;
}

export function ResourceTypeToJSON(value?: ResourceType): any {
    return value as any;
}

