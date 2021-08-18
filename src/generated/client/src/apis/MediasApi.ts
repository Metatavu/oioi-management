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


import * as runtime from '../runtime';
import {
    ErrorResponse,
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
    Media,
    MediaFromJSON,
    MediaToJSON,
    MediaType,
    MediaTypeFromJSON,
    MediaTypeToJSON,
} from '../models';

export interface CreateMediaRequest {
    media: Media;
    customerId: string;
}

export interface DeleteMediaRequest {
    customerId: string;
    mediaId: string;
}

export interface FindMediaRequest {
    customerId: string;
    mediaId: string;
}

export interface ListMediasRequest {
    customerId: string;
    type?: MediaType;
}

export interface UpdateMediaRequest {
    media: Media;
    customerId: string;
    mediaId: string;
}

/**
 * 
 */
export class MediasApi extends runtime.BaseAPI {

    /**
     * Create media
     * Create a media
     */
    async createMediaRaw(requestParameters: CreateMediaRequest): Promise<runtime.ApiResponse<Media>> {
        if (requestParameters.media === null || requestParameters.media === undefined) {
            throw new runtime.RequiredError('media','Required parameter requestParameters.media was null or undefined when calling createMedia.');
        }

        if (requestParameters.customerId === null || requestParameters.customerId === undefined) {
            throw new runtime.RequiredError('customerId','Required parameter requestParameters.customerId was null or undefined when calling createMedia.');
        }

        const queryParameters: runtime.HTTPQuery = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json;charset=utf-8';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = typeof token === 'function' ? token("BearerAuth", []) : token;

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/customers/{customerId}/medias`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customerId))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: MediaToJSON(requestParameters.media),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => MediaFromJSON(jsonValue));
    }

    /**
     * Create media
     * Create a media
     */
    async createMedia(requestParameters: CreateMediaRequest): Promise<Media> {
        const response = await this.createMediaRaw(requestParameters);
        return await response.value();
    }

    /**
     * Delete a media
     * Delete media
     */
    async deleteMediaRaw(requestParameters: DeleteMediaRequest): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.customerId === null || requestParameters.customerId === undefined) {
            throw new runtime.RequiredError('customerId','Required parameter requestParameters.customerId was null or undefined when calling deleteMedia.');
        }

        if (requestParameters.mediaId === null || requestParameters.mediaId === undefined) {
            throw new runtime.RequiredError('mediaId','Required parameter requestParameters.mediaId was null or undefined when calling deleteMedia.');
        }

        const queryParameters: runtime.HTTPQuery = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = typeof token === 'function' ? token("BearerAuth", []) : token;

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/customers/{customerId}/medias/{mediaId}`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customerId))).replace(`{${"mediaId"}}`, encodeURIComponent(String(requestParameters.mediaId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Delete a media
     * Delete media
     */
    async deleteMedia(requestParameters: DeleteMediaRequest): Promise<void> {
        await this.deleteMediaRaw(requestParameters);
    }

    /**
     * Finds a media
     * Finds a media
     */
    async findMediaRaw(requestParameters: FindMediaRequest): Promise<runtime.ApiResponse<Media>> {
        if (requestParameters.customerId === null || requestParameters.customerId === undefined) {
            throw new runtime.RequiredError('customerId','Required parameter requestParameters.customerId was null or undefined when calling findMedia.');
        }

        if (requestParameters.mediaId === null || requestParameters.mediaId === undefined) {
            throw new runtime.RequiredError('mediaId','Required parameter requestParameters.mediaId was null or undefined when calling findMedia.');
        }

        const queryParameters: runtime.HTTPQuery = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = typeof token === 'function' ? token("BearerAuth", []) : token;

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/customers/{customerId}/medias/{mediaId}`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customerId))).replace(`{${"mediaId"}}`, encodeURIComponent(String(requestParameters.mediaId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => MediaFromJSON(jsonValue));
    }

    /**
     * Finds a media
     * Finds a media
     */
    async findMedia(requestParameters: FindMediaRequest): Promise<Media> {
        const response = await this.findMediaRaw(requestParameters);
        return await response.value();
    }

    /**
     * List medias
     * List medias
     */
    async listMediasRaw(requestParameters: ListMediasRequest): Promise<runtime.ApiResponse<Array<Media>>> {
        if (requestParameters.customerId === null || requestParameters.customerId === undefined) {
            throw new runtime.RequiredError('customerId','Required parameter requestParameters.customerId was null or undefined when calling listMedias.');
        }

        const queryParameters: runtime.HTTPQuery = {};

        if (requestParameters.type !== undefined) {
            queryParameters['type'] = requestParameters.type;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = typeof token === 'function' ? token("BearerAuth", []) : token;

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/customers/{customerId}/medias`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customerId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(MediaFromJSON));
    }

    /**
     * List medias
     * List medias
     */
    async listMedias(requestParameters: ListMediasRequest): Promise<Array<Media>> {
        const response = await this.listMediasRaw(requestParameters);
        return await response.value();
    }

    /**
     * Updates a media
     * Updates media
     */
    async updateMediaRaw(requestParameters: UpdateMediaRequest): Promise<runtime.ApiResponse<Media>> {
        if (requestParameters.media === null || requestParameters.media === undefined) {
            throw new runtime.RequiredError('media','Required parameter requestParameters.media was null or undefined when calling updateMedia.');
        }

        if (requestParameters.customerId === null || requestParameters.customerId === undefined) {
            throw new runtime.RequiredError('customerId','Required parameter requestParameters.customerId was null or undefined when calling updateMedia.');
        }

        if (requestParameters.mediaId === null || requestParameters.mediaId === undefined) {
            throw new runtime.RequiredError('mediaId','Required parameter requestParameters.mediaId was null or undefined when calling updateMedia.');
        }

        const queryParameters: runtime.HTTPQuery = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json;charset=utf-8';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = typeof token === 'function' ? token("BearerAuth", []) : token;

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/customers/{customerId}/medias/{mediaId}`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customerId))).replace(`{${"mediaId"}}`, encodeURIComponent(String(requestParameters.mediaId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: MediaToJSON(requestParameters.media),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => MediaFromJSON(jsonValue));
    }

    /**
     * Updates a media
     * Updates media
     */
    async updateMedia(requestParameters: UpdateMediaRequest): Promise<Media> {
        const response = await this.updateMediaRaw(requestParameters);
        return await response.value();
    }

}
