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
    Application,
    ApplicationFromJSON,
    ApplicationToJSON,
    ErrorResponse,
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
} from '../models';

export interface CreateApplicationRequest {
    application: Application;
    customer_id: string;
    device_id: string;
}

export interface DeleteApplicationRequest {
    customer_id: string;
    device_id: string;
    application_id: string;
}

export interface FindApplicationRequest {
    customer_id: string;
    device_id: string;
    application_id: string;
}

export interface ListApplicationsRequest {
    customer_id: string;
    device_id: string;
}

export interface UpdateApplicationRequest {
    application: Application;
    customer_id: string;
    device_id: string;
    application_id: string;
}

/**
 * no description
 */
export class ApplicationsApi extends runtime.BaseAPI {

    /**
     * Create application
     * Create an application
     */
    async createApplicationRaw(requestParameters: CreateApplicationRequest): Promise<runtime.ApiResponse<Application>> {
        if (requestParameters.application === null || requestParameters.application === undefined) {
            throw new runtime.RequiredError('application','Required parameter requestParameters.application was null or undefined when calling createApplication.');
        }

        if (requestParameters.customer_id === null || requestParameters.customer_id === undefined) {
            throw new runtime.RequiredError('customer_id','Required parameter requestParameters.customer_id was null or undefined when calling createApplication.');
        }

        if (requestParameters.device_id === null || requestParameters.device_id === undefined) {
            throw new runtime.RequiredError('device_id','Required parameter requestParameters.device_id was null or undefined when calling createApplication.');
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
            path: `/customers/{customerId}/devices/{deviceId}/applications`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customer_id))).replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.device_id))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ApplicationToJSON(requestParameters.application),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => ApplicationFromJSON(jsonValue));
    }

    /**
     * Create application
     * Create an application
     */
    async createApplication(requestParameters: CreateApplicationRequest): Promise<Application> {
        const response = await this.createApplicationRaw(requestParameters);
        return await response.value();
    }

    /**
     * Delete an application
     * Delete application
     */
    async deleteApplicationRaw(requestParameters: DeleteApplicationRequest): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.customer_id === null || requestParameters.customer_id === undefined) {
            throw new runtime.RequiredError('customer_id','Required parameter requestParameters.customer_id was null or undefined when calling deleteApplication.');
        }

        if (requestParameters.device_id === null || requestParameters.device_id === undefined) {
            throw new runtime.RequiredError('device_id','Required parameter requestParameters.device_id was null or undefined when calling deleteApplication.');
        }

        if (requestParameters.application_id === null || requestParameters.application_id === undefined) {
            throw new runtime.RequiredError('application_id','Required parameter requestParameters.application_id was null or undefined when calling deleteApplication.');
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
            path: `/customers/{customerId}/devices/{deviceId}/applications/{applicationId}`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customer_id))).replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.device_id))).replace(`{${"applicationId"}}`, encodeURIComponent(String(requestParameters.application_id))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Delete an application
     * Delete application
     */
    async deleteApplication(requestParameters: DeleteApplicationRequest): Promise<void> {
        await this.deleteApplicationRaw(requestParameters);
    }

    /**
     * Finds an application
     * Finds an application
     */
    async findApplicationRaw(requestParameters: FindApplicationRequest): Promise<runtime.ApiResponse<Application>> {
        if (requestParameters.customer_id === null || requestParameters.customer_id === undefined) {
            throw new runtime.RequiredError('customer_id','Required parameter requestParameters.customer_id was null or undefined when calling findApplication.');
        }

        if (requestParameters.device_id === null || requestParameters.device_id === undefined) {
            throw new runtime.RequiredError('device_id','Required parameter requestParameters.device_id was null or undefined when calling findApplication.');
        }

        if (requestParameters.application_id === null || requestParameters.application_id === undefined) {
            throw new runtime.RequiredError('application_id','Required parameter requestParameters.application_id was null or undefined when calling findApplication.');
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
            path: `/customers/{customerId}/devices/{deviceId}/applications/{applicationId}`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customer_id))).replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.device_id))).replace(`{${"applicationId"}}`, encodeURIComponent(String(requestParameters.application_id))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => ApplicationFromJSON(jsonValue));
    }

    /**
     * Finds an application
     * Finds an application
     */
    async findApplication(requestParameters: FindApplicationRequest): Promise<Application> {
        const response = await this.findApplicationRaw(requestParameters);
        return await response.value();
    }

    /**
     * List applications
     * List applications
     */
    async listApplicationsRaw(requestParameters: ListApplicationsRequest): Promise<runtime.ApiResponse<Array<Application>>> {
        if (requestParameters.customer_id === null || requestParameters.customer_id === undefined) {
            throw new runtime.RequiredError('customer_id','Required parameter requestParameters.customer_id was null or undefined when calling listApplications.');
        }

        if (requestParameters.device_id === null || requestParameters.device_id === undefined) {
            throw new runtime.RequiredError('device_id','Required parameter requestParameters.device_id was null or undefined when calling listApplications.');
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
            path: `/customers/{customerId}/devices/{deviceId}/applications`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customer_id))).replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.device_id))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(ApplicationFromJSON));
    }

    /**
     * List applications
     * List applications
     */
    async listApplications(requestParameters: ListApplicationsRequest): Promise<Array<Application>> {
        const response = await this.listApplicationsRaw(requestParameters);
        return await response.value();
    }

    /**
     * Updates an application
     * Updates application
     */
    async updateApplicationRaw(requestParameters: UpdateApplicationRequest): Promise<runtime.ApiResponse<Application>> {
        if (requestParameters.application === null || requestParameters.application === undefined) {
            throw new runtime.RequiredError('application','Required parameter requestParameters.application was null or undefined when calling updateApplication.');
        }

        if (requestParameters.customer_id === null || requestParameters.customer_id === undefined) {
            throw new runtime.RequiredError('customer_id','Required parameter requestParameters.customer_id was null or undefined when calling updateApplication.');
        }

        if (requestParameters.device_id === null || requestParameters.device_id === undefined) {
            throw new runtime.RequiredError('device_id','Required parameter requestParameters.device_id was null or undefined when calling updateApplication.');
        }

        if (requestParameters.application_id === null || requestParameters.application_id === undefined) {
            throw new runtime.RequiredError('application_id','Required parameter requestParameters.application_id was null or undefined when calling updateApplication.');
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
            path: `/customers/{customerId}/devices/{deviceId}/applications/{applicationId}`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customer_id))).replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.device_id))).replace(`{${"applicationId"}}`, encodeURIComponent(String(requestParameters.application_id))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: ApplicationToJSON(requestParameters.application),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => ApplicationFromJSON(jsonValue));
    }

    /**
     * Updates an application
     * Updates application
     */
    async updateApplication(requestParameters: UpdateApplicationRequest): Promise<Application> {
        const response = await this.updateApplicationRaw(requestParameters);
        return await response.value();
    }

}
