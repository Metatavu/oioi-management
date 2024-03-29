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
    Device,
    DeviceFromJSON,
    DeviceToJSON,
    ErrorResponse,
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
} from '../models';

export interface CreateDeviceRequest {
    device: Device;
    customerId: string;
}

export interface DeleteDeviceRequest {
    customerId: string;
    deviceId: string;
}

export interface FindDeviceRequest {
    customerId: string;
    deviceId: string;
}

export interface ListDevicesRequest {
    customerId: string;
}

export interface UpdateDeviceRequest {
    device: Device;
    customerId: string;
    deviceId: string;
}

/**
 * 
 */
export class DevicesApi extends runtime.BaseAPI {

    /**
     * Create device
     * Create a device
     */
    async createDeviceRaw(requestParameters: CreateDeviceRequest): Promise<runtime.ApiResponse<Device>> {
        if (requestParameters.device === null || requestParameters.device === undefined) {
            throw new runtime.RequiredError('device','Required parameter requestParameters.device was null or undefined when calling createDevice.');
        }

        if (requestParameters.customerId === null || requestParameters.customerId === undefined) {
            throw new runtime.RequiredError('customerId','Required parameter requestParameters.customerId was null or undefined when calling createDevice.');
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
            path: `/v1/customers/{customerId}/devices`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customerId))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: DeviceToJSON(requestParameters.device),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => DeviceFromJSON(jsonValue));
    }

    /**
     * Create device
     * Create a device
     */
    async createDevice(requestParameters: CreateDeviceRequest): Promise<Device> {
        const response = await this.createDeviceRaw(requestParameters);
        return await response.value();
    }

    /**
     * Delete a device
     * Delete device
     */
    async deleteDeviceRaw(requestParameters: DeleteDeviceRequest): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.customerId === null || requestParameters.customerId === undefined) {
            throw new runtime.RequiredError('customerId','Required parameter requestParameters.customerId was null or undefined when calling deleteDevice.');
        }

        if (requestParameters.deviceId === null || requestParameters.deviceId === undefined) {
            throw new runtime.RequiredError('deviceId','Required parameter requestParameters.deviceId was null or undefined when calling deleteDevice.');
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
            path: `/v1/customers/{customerId}/devices/{deviceId}`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customerId))).replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.deviceId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Delete a device
     * Delete device
     */
    async deleteDevice(requestParameters: DeleteDeviceRequest): Promise<void> {
        await this.deleteDeviceRaw(requestParameters);
    }

    /**
     * Finds a device
     * Finds a device
     */
    async findDeviceRaw(requestParameters: FindDeviceRequest): Promise<runtime.ApiResponse<Device>> {
        if (requestParameters.customerId === null || requestParameters.customerId === undefined) {
            throw new runtime.RequiredError('customerId','Required parameter requestParameters.customerId was null or undefined when calling findDevice.');
        }

        if (requestParameters.deviceId === null || requestParameters.deviceId === undefined) {
            throw new runtime.RequiredError('deviceId','Required parameter requestParameters.deviceId was null or undefined when calling findDevice.');
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
            path: `/v1/customers/{customerId}/devices/{deviceId}`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customerId))).replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.deviceId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => DeviceFromJSON(jsonValue));
    }

    /**
     * Finds a device
     * Finds a device
     */
    async findDevice(requestParameters: FindDeviceRequest): Promise<Device> {
        const response = await this.findDeviceRaw(requestParameters);
        return await response.value();
    }

    /**
     * List devices
     * List devices
     */
    async listDevicesRaw(requestParameters: ListDevicesRequest): Promise<runtime.ApiResponse<Array<Device>>> {
        if (requestParameters.customerId === null || requestParameters.customerId === undefined) {
            throw new runtime.RequiredError('customerId','Required parameter requestParameters.customerId was null or undefined when calling listDevices.');
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
            path: `/v1/customers/{customerId}/devices`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customerId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(DeviceFromJSON));
    }

    /**
     * List devices
     * List devices
     */
    async listDevices(requestParameters: ListDevicesRequest): Promise<Array<Device>> {
        const response = await this.listDevicesRaw(requestParameters);
        return await response.value();
    }

    /**
     * Updates a device
     * Updates device
     */
    async updateDeviceRaw(requestParameters: UpdateDeviceRequest): Promise<runtime.ApiResponse<Device>> {
        if (requestParameters.device === null || requestParameters.device === undefined) {
            throw new runtime.RequiredError('device','Required parameter requestParameters.device was null or undefined when calling updateDevice.');
        }

        if (requestParameters.customerId === null || requestParameters.customerId === undefined) {
            throw new runtime.RequiredError('customerId','Required parameter requestParameters.customerId was null or undefined when calling updateDevice.');
        }

        if (requestParameters.deviceId === null || requestParameters.deviceId === undefined) {
            throw new runtime.RequiredError('deviceId','Required parameter requestParameters.deviceId was null or undefined when calling updateDevice.');
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
            path: `/v1/customers/{customerId}/devices/{deviceId}`.replace(`{${"customerId"}}`, encodeURIComponent(String(requestParameters.customerId))).replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.deviceId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: DeviceToJSON(requestParameters.device),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => DeviceFromJSON(jsonValue));
    }

    /**
     * Updates a device
     * Updates device
     */
    async updateDevice(requestParameters: UpdateDeviceRequest): Promise<Device> {
        const response = await this.updateDeviceRaw(requestParameters);
        return await response.value();
    }

}
