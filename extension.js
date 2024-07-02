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

            // Ensure the file has a .haml extension
            if (!oldPath.endsWith('.haml')) {
                console.error('The file does not have a .haml extension.');
                vscode.window.showErrorMessage('The file does not have a .haml extension.');
                return;
            }

            try {
                // Get the original content for conversion
                const haml = document.getText();
                
                // Log input for debugging (ensure sensitive data is not exposed in logs)
                console.log('Original content for conversion:', haml);
                
                const erb = await run(haml);

                // Replace the entire content with the conversion result
                const editSuccess = await editor.edit(editBuilder => {
                    const entireRange = new vscode.Range(
                        document.positionAt(0),
                        document.positionAt(document.getText().length)
                    );
                    editBuilder.replace(entireRange, erb);
                });

                if (editSuccess) {
                    console.log('Text successfully replaced with the conversion result.');
                    vscode.window.showInformationMessage('Text successfully converted.');

                    // Save the original document
                    await document.save();

                    // Determine the new path with the .erb extension
                    const newPath = oldPath.replace(/\.haml$/, '.erb');
                    const newUri = vscode.Uri.file(newPath);

                    // Rename the file
                    await vscode.workspace.fs.rename(oldUri, newUri);

                    // Close the original editor (optional but recommended)
                    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

                    // Open the new file in the editor
                    const newDocument = await vscode.workspace.openTextDocument(newUri);
                    await vscode.window.showTextDocument(newDocument);

                    console.log(`File successfully renamed to ${newUri.fsPath}`);
                    vscode.window.showInformationMessage(`File successfully renamed and text converted to: ${newUri.fsPath}`);
                } else {
                    console.error('Failed to replace text.');
                    vscode.window.showErrorMessage('Failed to replace text.');
                }
            } catch (error) {
                // Log full error details
                console.error('Error during conversion:', error);

                // Show a more specific error message to the user
                if (error.message.includes('SAFETY')) {
                    vscode.window.showErrorMessage('Conversion blocked due to safety concerns. Please check the content for sensitive or inappropriate material.');
                } else {
                    vscode.window.showErrorMessage(`Error during conversion: ${error.message}`);
                }
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
