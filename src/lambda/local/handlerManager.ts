/*!
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

import { readFileAsJson } from '../../shared/filesystemUtilities'

type LambdaRuntime =
    'python3.6' |
    'python2.7' |
    'python' |
    'nodejs6.10' |
    'nodejs8.10' |
    'nodejs4.3' |
    'nodejs' |
    'dotnetcore2.0' |
    'dotnetcore1.0' |
    'dotnetcore' |
    'dotnet' |
    'go1.x' |
    'go' |
    'java8' |
    'java'

interface HandlerConfig {
    runtime: LambdaRuntime,

    event: string | any,

    environmentVariables: {
        [key: string]: string
    }
}

interface HandlersConfig {
    handlers: {
        [handler: string]: HandlerConfig
    }
}

interface HandlerManager {
    getEvent(handler: string): Thenable<any>

    setEvent(handler: string, event: string | any): Thenable<void>

    getRuntime(handler: string): Thenable<LambdaRuntime>

    setRuntime(handler: string, runtime: LambdaRuntime): Thenable<void>

    getEnvironmentVariable(handler: string, key: string): Thenable<string>

    setEnvironmentVariable(handler: string, key: string, value: string): Thenable<void>
}

class DefaultHandlerManager implements HandlerManager {
    private constructor(private readonly config: HandlersConfig) {
    }

    public async getEvent(handler: string): Promise<any> {
        const event = this.config.handlers[handler].event
        if (typeof event === 'string') {
            throw new Error('Not Implemented')
        } else {
            return event
        }
    }

    public async setEvent(handler: string, event: string | any): Promise<void> {
        this.config.handlers[handler].event = event
    }

    public async getRuntime(handler: string): Promise<LambdaRuntime> {

    }

    public async setRuntime(handler: string, runtime: LambdaRuntime): Promise<void> {

    }

    public async getEnvironmentVariable(handler: string, key: string): Promise<string> {

    }

    public async setEnvironmentVariable(handler: string, key: string, value: string): Promise<void> {

    }

    public static async load(path: string): Promise<HandlerManager> {
        try {
            try {
                return new DefaultHandlerManager(await readFileAsJson(path))
            } catch (e) {
                return new DefaultHandlerManager({
                    handlers: {}
                })
            }
        }
    }
}
