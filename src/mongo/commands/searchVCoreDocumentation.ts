import { IActionContext } from "@microsoft/vscode-azext-utils";

export async function searchVCoreDocumentation(_context: IActionContext): Promise<void> {
    console.log(_context);
}
