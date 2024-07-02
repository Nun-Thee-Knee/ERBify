const vscode = require('vscode');
const { run } = require('./conversion');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    console.log('Congratulations, your extension "erbify" is now active!');

    const disposable = vscode.commands.registerCommand('erbify.helloWorld', async function () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const oldUri = document.uri;
            const oldPath = oldUri.fsPath;

            const newPath = oldPath.replace(/\.haml$/, '.erb');

            if (!oldPath.endsWith('.haml')) {
                console.error('The file does not have a .haml extension.');
                vscode.window.showErrorMessage('The file does not have a .haml extension.');
                return;
            }

            try {
                const newUri = vscode.Uri.file(newPath);
                await vscode.workspace.fs.rename(oldUri, newUri);

                const newDocument = await vscode.workspace.openTextDocument(newUri);
                const newEditor = await vscode.window.showTextDocument(newDocument);

                const haml = document.getText();
                const erb = await run(haml);

                const editSuccess = await newEditor.edit(editBuilder => {
                    const entireRange = new vscode.Range(
                        newDocument.positionAt(0),
                        newDocument.positionAt(newDocument.getText().length)
                    );
                    editBuilder.replace(entireRange, erb);
                });

                if (editSuccess) {
                    console.log(`File successfully renamed to ${newUri.fsPath}`);
                    console.log('Text successfully replaced with the conversion result.');
                    vscode.window.showInformationMessage(`File successfully renamed and text converted to: ${newUri.fsPath}`);
                } else {
                    console.error('Failed to replace text.');
                    vscode.window.showErrorMessage('Failed to replace text.');
                }
            } catch (error) {
                console.error('Error during conversion or renaming:', error);
                vscode.window.showErrorMessage(`Error during conversion or renaming: ${error.message}`);
            }
        } else {
            console.log('No active text editor found.');
            vscode.window.showInformationMessage('No active text editor found.');
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
