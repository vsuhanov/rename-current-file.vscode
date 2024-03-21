import *  as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('rename-current-file.renameCurrentFile', async () => {

		let fileUri = vscode.window.activeTextEditor?.document.uri;

		if (!fileUri && vscode.window.visibleTextEditors.length > 0) {
			fileUri = vscode.window.visibleTextEditors[0].document.uri;
		}
		const input = vscode.window.tabGroups?.activeTabGroup?.activeTab?.input as unknown as { uri: vscode.Uri };
		if (!fileUri && input?.uri) {
			fileUri = input.uri as vscode.Uri;
		}

		if (!fileUri) {
			vscode.window.showErrorMessage('No file is open for renaming.');
			return;
		}

		const currentFilePath = fileUri.fsPath;
		const currentFileBasename = path.basename(currentFilePath);
		const indexOfFirstDot = currentFileBasename.indexOf('.');

		const newFileName = await vscode.window.showInputBox({
			value: currentFileBasename,
			prompt: 'Rename to:',
			valueSelection: indexOfFirstDot !== -1 ? [0, indexOfFirstDot] : [0, currentFileBasename.length]
		});

		if (!newFileName || newFileName === currentFileBasename) {
			return;
		}

		const newFilePath = path.join(path.dirname(currentFilePath), newFileName);

		try {
			fs.renameSync(currentFilePath, newFilePath);
			const newFileUri = vscode.Uri.file(newFilePath);
			vscode.commands.executeCommand('vscode.open', newFileUri);
		} catch (error) {
			vscode.window.showErrorMessage(`Error renaming file: ${error}`);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }