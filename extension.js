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
            const haml = document.getText();
            try {
                const erb = await run(haml);
                editor.edit(editBuilder => {
                    const entireRange = new vscode.Range(
                        document.positionAt(0),
                        document.positionAt(document.getText().length)
                    );
                    editBuilder.replace(entireRange, erb);
                }).then(success => {
                    if (success) {
                        console.log('Text successfully replaced with the conversion result.');
                        vscode.window.showInformationMessage(`Your text was converted to: ${erb}`);
                    } else {
                        console.error('Failed to replace text.');
                    }
                });
            } catch (error) {
                console.error('Error during conversion:', error);
                vscode.window.showErrorMessage(`Conversion failed: ${error.message}`);
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
