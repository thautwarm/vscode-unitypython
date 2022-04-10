'use strict';
import * as vscode from 'vscode';
import * as core from './core'

export async function activate(context: vscode.ExtensionContext) {
    const commandStart = vscode.commands.registerCommand("unitypython.start", async () => {
        await core.start(context);
    });
    const commandBuild = vscode.commands.registerCommand("unitypython.rebuild", async () => {
        await core.rebuildWithCurrentWorkspace();
    });
    const recompileWatcher = vscode.workspace.createFileSystemWatcher("**/*.py").onDidChange(async (uri) => {
        let wf = vscode.workspace.getWorkspaceFolder(uri);
        if (wf) {
            await core.rebuild(wf);
        }
    });
    const resetWatcher = vscode.workspace.createFileSystemWatcher("**/.unitypython.json").onDidCreate(async (uri) => {
        let wf = vscode.workspace.getWorkspaceFolder(uri);
        if (wf) {
            await core.setup(context, wf);
        }
    });
    context.subscriptions.push(
        commandStart,
        commandBuild,
        recompileWatcher,
        resetWatcher
    );
    vscode.commands.executeCommand("unitypython.start");
    return {}
}
