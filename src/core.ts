import * as vscode from 'vscode'
import * as pythonApi from "./pythonApi";
import * as constants from './constants'
import * as cp from "child_process";
import * as path from 'path'
import * as fs from 'fs'
import { ConfigurationTarget, workspace } from 'vscode';

const execShell = (cmd: string, args: string[]) =>
    new Promise<string>((resolve, reject) => {
        cp.execFile(cmd, args, (err, out) => {
            if (err) {
                vscode.window.showErrorMessage(err.message);
                return reject(err);
            }
            return resolve(out);
        });
    });

export async function rebuild(wf: vscode.WorkspaceFolder) {
    if (isInterestedWorkspace(wf)) {
        let outDir = vscode.workspace.getConfiguration("unitypython", wf).get<string>(constants.KeyBuildOutDirectory);
        outDir ??= "Compiled";
        let fsPath = wf.uri.fsPath;
        let pythonPath = await getPythonPath(wf);
        await execShell(
            pythonPath,
            ["-m",
                "unitypython", fsPath,
                "--includesrc",
                "--recursive",
                "--outdir", path.join(fsPath, outDir),
                "--rootdir", fsPath]);
    }
}

export async function rebuildWithCurrentWorkspace() {
    let curDocUri = vscode.window.activeTextEditor?.document.uri;
    if (curDocUri != undefined) {
        let wf = vscode.workspace.getWorkspaceFolder(curDocUri);
        if (wf != undefined) {
            await rebuild(wf);
        }
    }
}

function isInterestedWorkspace(wf: vscode.WorkspaceFolder): boolean {
    return fs.existsSync(
        path.join(wf.uri.fsPath, constants.IndicatorFileName))
}

async function findMatchedWorkspaceWith(callback: (wf: vscode.WorkspaceFolder) => Promise<any>) {
    if (vscode.workspace.workspaceFolders == undefined || vscode.workspace.workspaceFolders.length == 0) {
        return;
    }

    let interestedWorkspaceFolders = vscode.workspace.workspaceFolders.filter(isInterestedWorkspace);
    await Promise.all(interestedWorkspaceFolders.map(callback));
}


async function copyStubs(context: vscode.ExtensionContext, wf: vscode.WorkspaceFolder) {
    let stubDirName = vscode.workspace.getConfiguration("unitypython", wf).get<string>(constants.KeyBuiltinStubDirName) ?? "unitypython-typeshed";
    let resourceStubUri = vscode.Uri.joinPath(context.extensionUri, "resources", "unitypython-typeshed");
    let userStubUri = vscode.Uri.joinPath(wf.uri, stubDirName);
    if (fs.existsSync(userStubUri.fsPath)) {
        return;
    }
    await vscode.workspace.fs.copy(resourceStubUri, userStubUri, { overwrite: false });
}

async function getPythonPath(wf: vscode.WorkspaceFolder) {
    let pythonPath = await vscode.commands.executeCommand<string>("python.interpreterPath", { workspaceFolder: wf.uri.toString() });
    if (pythonPath == undefined) {
        let msg = "'python.interpreterPath' is not defined!";
        vscode.window.showErrorMessage(msg);
        throw new Error(msg);
    }
    return pythonPath;
}

export async function setup(context: vscode.ExtensionContext, wf: vscode.WorkspaceFolder) {
    await pythonApi.pythonExtensionReady();
    let pythonPath = await getPythonPath(wf);
    try {
        await execShell(pythonPath, ["-m", "unitypython", "--help"])
    }
    catch
    {
        await vscode.window.showErrorMessage(
            "unitypython is not installed in your environment." +
            "Select a different Python Environment or install it via:\n" +
            "    pip install unitypython --upgrade")
        return;
    }
    let unityPythonConfig = workspace.getConfiguration("unitypython", wf);
    let pylanceConfig = workspace.getConfiguration("python.analysis", wf);
    let pythonConfig = workspace.getConfiguration("python", wf);

    let easyConfig = unityPythonConfig.get<boolean>(constants.KeyEasyConfig);
    if (easyConfig == undefined) easyConfig = true;
    let stubDirName = vscode.workspace.getConfiguration("unitypython", wf).get<string>(constants.KeyBuiltinStubDirName) ?? "unitypython-typeshed";

    if (!pythonConfig.has("languageServer") || pylanceConfig.get<string>("languageServer") != "Pylance") {
        pythonConfig.update("languageServer", "Pylance", ConfigurationTarget.WorkspaceFolder);
    }
    if (easyConfig) {
        let typeshedPaths = pylanceConfig.get<string[]>("typeshedPaths")
        if (typeshedPaths == undefined)
            pylanceConfig.update("typeshedPaths", [stubDirName], ConfigurationTarget.WorkspaceFolder);
        else if (!typeshedPaths.includes(stubDirName)) {
            let newTypeshedPaths = [stubDirName, ...typeshedPaths]
            pylanceConfig.update("typeshedPaths", newTypeshedPaths, ConfigurationTarget.WorkspaceFolder)
        }
        let typeCheckingMode = pylanceConfig.get<string>("typeCheckingMode")
        if (typeCheckingMode == undefined || typeCheckingMode != 'basic')
            pylanceConfig.update("typeCheckingMode", 'basic', ConfigurationTarget.WorkspaceFolder);

        let useLibraryCodeForTypes = pylanceConfig.get<boolean>("useLibraryCodeForTypes")
        if (useLibraryCodeForTypes == undefined || useLibraryCodeForTypes != true)
            pylanceConfig.update("useLibraryCodeForTypes", true, ConfigurationTarget.WorkspaceFolder);
        await copyStubs(context, wf);
    }
}

export async function start(context: vscode.ExtensionContext) {
    let initTasks = vscode.workspace.workspaceFolders?.map(x => setup(context, x));
    if (initTasks) await Promise.all(initTasks);
}
