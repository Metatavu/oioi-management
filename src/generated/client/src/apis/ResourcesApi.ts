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


import * as runtime from '../runtime';
import {
    ErrorResponse,
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
    Resource,
    ResourceFromJSON,
    ResourceToJSON,
} from '../models';

export interface CreateResourceRequest {
    resource: Resource;
    customer_id: string;
    device_id: string;
    application_id: string;
}

export interface DeleteResourceRequest {
    customer_id: string;
    device_id: string;
    application_id: string;
    resource_id: string;
}

export interface FindResourceRequest {
    customer_id: string;
    device_id: string;
    application_id: string;
    resource_id: string;
}

export interface ListResourcesRequest {
    customer_id: string;
    device_id: string;
    application_id: string;
    parent_id?: string;
}

export interface UpdateResourceRequest {
    resource: Resource;
    customer_id: string;
    device_id: string;
    application_id: string;
    resource_id: string;
}

/**
 * no description
 */
export class ResourcesApi extends runtime.BaseAPI {

    /**
     * Create resource
     * Create a resource
     */
    async createResourceRaw(requestParameters: CreateResourceRequest): Promise<runtime.ApiResponse<Resource>> {
        if (requestParameters.resource === null || requestParameters.resource === undefined) {
            throw new runtime.RequiredError('resource','Required parameter requestParameters.resource was null or undefined when calling createResource.');
        }

        if (requestParameters.customer_id === null || requestParameters.customer_id === undefined) {
            throw new runtime.RequiredError('customer_id','Required parameter requestParameters.customer_id was null or undefined when calling createResource.');
        }

        if (requestParameters.device_id === null || requestParameters.device_id === undefined) {
            throw new runtime.RequiredError('device_id','Required parameter requestParameters.device_id was null or undefined when calling createResource.');
        }

        if (requestParameters.application_id === null || requestParameters.application_id === undefined) {
            throw new runtime.RequiredError('application_id','Required parameter requestParameters.application_id was null or undefined when calling createResource.');
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
            path: `/customers/{customerId}/devices/{deviceId}/applications/{applicationId}/resources`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customer_id))).replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.device_id))).replace(`{${"applicationId"}}`, encodeURIComponent(String(requestParameters.application_id))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ResourceToJSON(requestParameters.resource),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => ResourceFromJSON(jsonValue));
    }

    /**
     * Create resource
     * Create a resource
     */
    async createResource(requestParameters: CreateResourceRequest): Promise<Resource> {
        const response = await this.createResourceRaw(requestParameters);
        return await response.value();
    }

    /**
     * Delete an resource
     * Delete resource
     */
    async deleteResourceRaw(requestParameters: DeleteResourceRequest): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.customer_id === null || requestParameters.customer_id === undefined) {
            throw new runtime.RequiredError('customer_id','Required parameter requestParameters.customer_id was null or undefined when calling deleteResource.');
        }

        if (requestParameters.device_id === null || requestParameters.device_id === undefined) {
            throw new runtime.RequiredError('device_id','Required parameter requestParameters.device_id was null or undefined when calling deleteResource.');
        }

        if (requestParameters.application_id === null || requestParameters.application_id === undefined) {
            throw new runtime.RequiredError('application_id','Required parameter requestParameters.application_id was null or undefined when calling deleteResource.');
        }

        if (requestParameters.resource_id === null || requestParameters.resource_id === undefined) {
            throw new runtime.RequiredError('resource_id','Required parameter requestParameters.resource_id was null or undefined when calling deleteResource.');
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
            path: `/customers/{customerId}/devices/{deviceId}/applications/{applicationId}/resources/{resourceId}`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customer_id))).replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.device_id))).replace(`{${"applicationId"}}`, encodeURIComponent(String(requestParameters.application_id))).replace(`{${"resourceId"}}`, encodeURIComponent(String(requestParameters.resource_id))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Delete an resource
     * Delete resource
     */
    async deleteResource(requestParameters: DeleteResourceRequest): Promise<void> {
        await this.deleteResourceRaw(requestParameters);
    }

    /**
     * Finds an resource
     * Finds a resource
     */
    async findResourceRaw(requestParameters: FindResourceRequest): Promise<runtime.ApiResponse<Resource>> {
        if (requestParameters.customer_id === null || requestParameters.customer_id === undefined) {
            throw new runtime.RequiredError('customer_id','Required parameter requestParameters.customer_id was null or undefined when calling findResource.');
        }

        if (requestParameters.device_id === null || requestParameters.device_id === undefined) {
            throw new runtime.RequiredError('device_id','Required parameter requestParameters.device_id was null or undefined when calling findResource.');
        }

        if (requestParameters.application_id === null || requestParameters.application_id === undefined) {
            throw new runtime.RequiredError('application_id','Required parameter requestParameters.application_id was null or undefined when calling findResource.');
        }

        if (requestParameters.resource_id === null || requestParameters.resource_id === undefined) {
            throw new runtime.RequiredError('resource_id','Required parameter requestParameters.resource_id was null or undefined when calling findResource.');
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
            path: `/customers/{customerId}/devices/{deviceId}/applications/{applicationId}/resources/{resourceId}`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customer_id))).replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.device_id))).replace(`{${"applicationId"}}`, encodeURIComponent(String(requestParameters.application_id))).replace(`{${"resourceId"}}`, encodeURIComponent(String(requestParameters.resource_id))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => ResourceFromJSON(jsonValue));
    }

    /**
     * Finds an resource
     * Finds a resource
     */
    async findResource(requestParameters: FindResourceRequest): Promise<Resource> {
        const response = await this.findResourceRaw(requestParameters);
        return await response.value();
    }

    /**
     * List resources
     * List resources
     */
    async listResourcesRaw(requestParameters: ListResourcesRequest): Promise<runtime.ApiResponse<Array<Resource>>> {
        if (requestParameters.customer_id === null || requestParameters.customer_id === undefined) {
            throw new runtime.RequiredError('customer_id','Required parameter requestParameters.customer_id was null or undefined when calling listResources.');
        }

        if (requestParameters.device_id === null || requestParameters.device_id === undefined) {
            throw new runtime.RequiredError('device_id','Required parameter requestParameters.device_id was null or undefined when calling listResources.');
        }

        if (requestParameters.application_id === null || requestParameters.application_id === undefined) {
            throw new runtime.RequiredError('application_id','Required parameter requestParameters.application_id was null or undefined when calling listResources.');
        }

        const queryParameters: runtime.HTTPQuery = {};

        if (requestParameters.parent_id !== undefined) {
            queryParameters['parentId'] = requestParameters.parent_id;
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
            path: `/customers/{customerId}/devices/{deviceId}/applications/{applicationId}/resources`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customer_id))).replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.device_id))).replace(`{${"applicationId"}}`, encodeURIComponent(String(requestParameters.application_id))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(ResourceFromJSON));
    }

    /**
     * List resources
     * List resources
     */
    async listResources(requestParameters: ListResourcesRequest): Promise<Array<Resource>> {
        const response = await this.listResourcesRaw(requestParameters);
        return await response.value();
    }

    /**
     * Updates resource
     * Updates resource
     */
    async updateResourceRaw(requestParameters: UpdateResourceRequest): Promise<runtime.ApiResponse<Resource>> {
        if (requestParameters.resource === null || requestParameters.resource === undefined) {
            throw new runtime.RequiredError('resource','Required parameter requestParameters.resource was null or undefined when calling updateResource.');
        }

        if (requestParameters.customer_id === null || requestParameters.customer_id === undefined) {
            throw new runtime.RequiredError('customer_id','Required parameter requestParameters.customer_id was null or undefined when calling updateResource.');
        }

        if (requestParameters.device_id === null || requestParameters.device_id === undefined) {
            throw new runtime.RequiredError('device_id','Required parameter requestParameters.device_id was null or undefined when calling updateResource.');
        }

        if (requestParameters.application_id === null || requestParameters.application_id === undefined) {
            throw new runtime.RequiredError('application_id','Required parameter requestParameters.application_id was null or undefined when calling updateResource.');
        }

        if (requestParameters.resource_id === null || requestParameters.resource_id === undefined) {
            throw new runtime.RequiredError('resource_id','Required parameter requestParameters.resource_id was null or undefined when calling updateResource.');
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
            path: `/customers/{customerId}/devices/{deviceId}/applications/{applicationId}/resources/{resourceId}`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customer_id))).replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.device_id))).replace(`{${"applicationId"}}`, encodeURIComponent(String(requestParameters.application_id))).replace(`{${"resourceId"}}`, encodeURIComponent(String(requestParameters.resource_id))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: ResourceToJSON(requestParameters.resource),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => ResourceFromJSON(jsonValue));
    }

    /**
     * Updates resource
     * Updates resource
     */
    async updateResource(requestParameters: UpdateResourceRequest): Promise<Resource> {
        const response = await this.updateResourceRaw(requestParameters);
        return await response.value();
    }

}
