import * as vscode from "vscode";

export interface PythonExtensionApi {
    /**
     * Promise indicating whether all parts of the extension have completed loading or not.
     * @type {Promise<void>}
     * @memberof IExtensionApi
     */
    ready: Promise<void>;
}

export async function pythonExtensionReady() {
	const pythonExt = vscode.extensions.getExtension<PythonExtensionApi>('ms-python.python');

	if (!pythonExt) {
		vscode.window.showErrorMessage('Please install python extension');
		return Promise.reject();
	}

	if (!pythonExt.isActive) {
		await pythonExt.exports.ready;
	}
}