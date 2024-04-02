/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IActionContext } from "@microsoft/vscode-azext-utils";
import { pickMongo } from "../../mongo/commands/pickMongo";
import * as vscodeUtil from "../../utils/vscodeUtils";
import { setConnectedNode } from "../setConnectedNode";
import { MongoDatabaseTreeItem } from "../tree/MongoDatabaseTreeItem";

export async function launchMongoCopilot(context: IActionContext, node?: MongoDatabaseTreeItem): Promise<void> {
    if (!node) {
        node = await pickMongo<MongoDatabaseTreeItem>(context, MongoDatabaseTreeItem.contextValue);
    }
    setConnectedNode(node);
    const sampleQuestion = `Get 5 documents, order by time\n`;
    await vscodeUtil.showNewFile(sampleQuestion, `copilot for ${node.label}`, ".copilot");
}
