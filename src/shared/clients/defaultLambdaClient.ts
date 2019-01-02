/*!
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

import { Lambda } from 'aws-sdk'
import { _Blob } from 'aws-sdk/clients/lambda'
import { ext } from '../extensionGlobals'
import '../utilities/asyncIteratorShim'
import { LambdaClient } from './lambdaClient'

export class DefaultLambdaClient implements LambdaClient {
    public constructor(public readonly regionCode: string) {
    }

    public async deleteFunction(name: string): Promise<void> {
        const sdkClient = await this.createSdkClient()

        const response = await sdkClient.deleteFunction({
            FunctionName: name
        }).promise()

        if (!!response.$response.error) {
            throw response.$response.error
        }
    }

    public async getFunctionConfiguration(name: string): Promise<Lambda.FunctionConfiguration> {
        const sdkClient = await this.createSdkClient()

        const response = await sdkClient.getFunctionConfiguration({
            FunctionName: name
        }).promise()

        return response
    }

    public async invoke(name: string, payload?: _Blob): Promise<Lambda.InvocationResponse> {
        const sdkClient = await this.createSdkClient()

        const response = await sdkClient.invoke({
            FunctionName: name,
            LogType: 'Tail',
            Payload: payload
        }).promise()

        return response
    }

    public async getPolicy(name: string): Promise<Lambda.GetPolicyResponse> {
        const sdkClient = await this.createSdkClient()

        return await sdkClient.getPolicy({
            FunctionName: name
        }).promise()
    }

    public async *listFunctions(): AsyncIterableIterator<Lambda.FunctionConfiguration> {
        const client = await this.createSdkClient()

        const request: Lambda.ListFunctionsRequest = {}
        do {
            const response: Lambda.ListFunctionsResponse = await client.listFunctions(request).promise()
            request.Marker = response.NextMarker

            if (!!response.Functions) {
                yield* response.Functions
            }
        } while (!!request.Marker)
    }

    private async createSdkClient(): Promise<Lambda> {
        return await ext.sdkClientBuilder.createAndConfigureServiceClient(
            options => new Lambda(options),
            undefined,
            this.regionCode
        )
    }
}
