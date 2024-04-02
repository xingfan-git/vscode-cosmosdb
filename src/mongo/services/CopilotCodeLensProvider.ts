/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { callWithTelemetryAndErrorHandling, IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";

export class CopilotCodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChangeEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    private _connectedDatabase: string | undefined;
    private _connectedDatabaseInitialized: boolean;

    public get onDidChangeCodeLenses(): vscode.Event<void> {
        return this._onDidChangeEmitter.event;
    }

    public setConnectedDatabase(database: string | undefined): void {
        this._connectedDatabase = database;
        this._connectedDatabaseInitialized = true;
        this._onDidChangeEmitter.fire();
    }

    public provideCodeLenses(document: vscode.TextDocument, _token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
        return callWithTelemetryAndErrorHandling("copilot.provideCodeLenses", (context: IActionContext) => {
            // Suppress except for errors - this can fire on every keystroke
            context.telemetry.suppressIfSuccessful = true;

            const isInitialized = this._connectedDatabaseInitialized;
            const isConnected = !!this._connectedDatabase;
            const database = isConnected && this._connectedDatabase;
            const lenses: vscode.CodeLens[] = [];

            let startPositionOfLastParagraph = new vscode.Position(0, 0);

            for (let lineNumber = document.lineCount - 1; lineNumber >= 0; lineNumber--) {
                const lineText = document.lineAt(lineNumber).text;
                if (lineText.trim().length === 0) {
                    if (lineNumber + 1 < document.lineCount) {
                        startPositionOfLastParagraph = new vscode.Position(lineNumber + 1, 0);
                    }
                    break;
                }
            }
            let endPosition = startPositionOfLastParagraph;
            for (let lineNumber = startPositionOfLastParagraph.line; lineNumber < document.lineCount; lineNumber++) {
                const lineText = document.lineAt(lineNumber).text;
                if (lineText.trim().length > 0) {
                    endPosition = new vscode.Position(lineNumber, lineText.length);
                }
            }

            const codeRange = new vscode.Range(startPositionOfLastParagraph, endPosition);
            const lensRange = new vscode.Range(startPositionOfLastParagraph, startPositionOfLastParagraph);
            lenses.push(<vscode.CodeLens>{
                command: {
                    title: !isInitialized ?
                        'Initializing...' :
                        isConnected ?
                            `Connected to ${database}` :
                            `Connect to a database`,
                    command: isInitialized && 'cosmosDB.connectMongoDB'
                },
                range: lensRange
            },
                <vscode.CodeLens>{
                    command: {
                        title: "Generate vCore Query",
                        command: 'cosmosDB.generateVCoreQuery',
                        arguments: [codeRange]
                    },
                    range: lensRange
                },
                // <vscode.CodeLens>{
                //     command: {
                //         title: "Generate vCore Code",
                //         command: 'cosmosDB.generateVCoreCode'
                //     },
                //     range: lensRange
                // },
                // <vscode.CodeLens>{
                //     command: {
                //         title: "Search vCore Documentation",
                //         command: 'cosmosDB.searchVCoreDocumentation'
                //     },
                //     range: lensRange
                // },
                <vscode.CodeLens>{
                    command: {
                        title: "Execute Query",
                        command: 'cosmosDB.executeMongoCommand',
                        arguments: [startPositionOfLastParagraph]
                    },
                    range: lensRange
                });
            return lenses;
        });
    }
}
