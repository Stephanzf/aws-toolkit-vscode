/*!
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

export interface Handlers {
    handlers: {
        [key: string]: {
            runtime:
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
                'java',
            event: string | any,
            environmentVariables: {
                [key: string]: string
            }
        }
    }
}
