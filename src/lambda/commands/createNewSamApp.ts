/*!
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// import * as nls from 'vscode-nls'
// const localize = nls.loadMessageBundle()

import * as os from 'os'
import * as path from 'path'
import * as vscode from 'vscode'
import { LambdaRuntime } from '../models/lambdaRuntime'

class WizardStep {
    public constructor(
        public readonly run: () => Thenable<WizardStep>,
        public readonly isTerminal: boolean = false
    ) {
    }

}

abstract class MultiStepWizard<TResult> {
    protected constructor() {
    }

    public async run(): Promise<TResult | undefined> {
        let step = this.startStep
        while (!step.isTerminal) {
            step = await step.run()
        }

        return this.getResult()
    }

    protected abstract get startStep(): WizardStep

    protected abstract getResult(): TResult | undefined
}

interface SamInitConfig {
    runtime: LambdaRuntime
    template: string
    location: vscode.Uri
    name: string
}

class CreateNewSamAppWizard extends MultiStepWizard<SamInitConfig> {

    private readonly RUNTIME: WizardStep = new WizardStep(async () => {
        const choices: LambdaRuntime[] = [
            'python3.6',
            'python2.7',
            'python',
            'nodejs6.10',
            'nodejs8.10',
            'nodejs4.3',
            'nodejs',
            'dotnetcore2.0',
            'dotnetcore1.0',
            'dotnetcore',
            'dotnet',
            'go1.x',
            'go',
            'java8',
            'java'
        ]

        this.runtime = await vscode.window.showQuickPick(choices, {
            ignoreFocusOut: true
        }) as LambdaRuntime | undefined

        return !!this.runtime ? this.TEMPLATE : this.CANCELLED
    })

    private readonly TEMPLATE: WizardStep = new WizardStep(async () => {
        const choices: string[] = [
            'placeholder'
        ]

        this.template = await vscode.window.showQuickPick(choices, {
            ignoreFocusOut: true
        })

        return !!this.template ? this.LOCATION : this.RUNTIME
    })

    private readonly LOCATION: WizardStep = new WizardStep(async () => {
        const choices: FolderQuickPickItem[] = (vscode.workspace.workspaceFolders || [])
            .map<FolderQuickPickItem>(f => new WorkspaceFolderQuickPickItem(f) )
            .concat([ new BrowseFolderQuickPickItem() ])

        const selection = await vscode.window.showQuickPick(choices, {
            ignoreFocusOut: true
        })
        if (!selection) {
            return this.TEMPLATE
        }
        this.location = await selection.getUri()

        return !!this.location ? this.NAME : this.TEMPLATE
    })

    private readonly NAME: WizardStep = new WizardStep(async () => {
        this.name = await await vscode.window.showInputBox({
            value: 'my-sam-app',
            prompt: 'Choose a name for your new application',
            placeHolder: 'application name',
            ignoreFocusOut: true,

            validateInput(value: string): string | undefined | null | Thenable<string | undefined | null> {
                return path.normalize(path.basename(value)) === path.normalize(value) ?
                    undefined :
                    `The path separator (${path.sep}) is not allowed in application names`
            }
        })

        return !!this.name ? this.DONE : this.LOCATION
    })

    private readonly DONE: WizardStep = new WizardStep(async () => this.DONE, true)

    private readonly CANCELLED: WizardStep = new WizardStep(async () => this.CANCELLED, true)

    private runtime?: LambdaRuntime
    private template?: string
    private location?: vscode.Uri
    private name?: string

    public constructor() {
        super()
    }

    protected get startStep() {
        return this.RUNTIME
    }

    protected getResult() {
        if (!this.runtime || !this.template || !this.location || !this.name) {
            // This should never happen, as we validate each parameter after each step.
            throw new Error(`Could not create new SAM application. Invalid config: ${JSON.stringify({
                runtime: this.runtime,
                template: this.template,
                location: this.location,
                name: this.name
            })}`)
        }

        return {
            runtime: this.runtime,
            template: this.template,
            location: this.location,
            name: this.name
        }
    }
}

interface FolderQuickPickItem extends vscode.QuickPickItem {
    getUri(): Thenable<vscode.Uri | undefined>
}

class WorkspaceFolderQuickPickItem implements FolderQuickPickItem {
    public readonly label: string

    public constructor(private readonly folder: vscode.WorkspaceFolder) {
        this.label = folder.name
    }

    public async getUri(): Promise<vscode.Uri | undefined> {
        return this.folder.uri
    }
}

class BrowseFolderQuickPickItem implements FolderQuickPickItem {
    public readonly label: string = 'Browse...'

    public async getUri(): Promise<vscode.Uri | undefined> {
        const workspaceFolders = vscode.workspace.workspaceFolders
        const defaultUri = !!workspaceFolders && workspaceFolders.length > 0 ?
            workspaceFolders[0].uri :
            vscode.Uri.parse(os.homedir())

        const result = await vscode.window.showOpenDialog({
            defaultUri,
            openLabel: 'Select the directory in which your app will be created',
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false
        })

        if (!result || !result.length) {
            return undefined
        }

        return result[0]
    }
}

export async function createNewSamApp() {
    const config = await new CreateNewSamAppWizard().run()
    if (!config) {
        return
    }

    // TODO: Implement for real.
    console.log(`successfully prompted for sam init configuration ${JSON.stringify(config)}`)
}
