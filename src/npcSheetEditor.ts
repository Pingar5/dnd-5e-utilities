import * as path from 'path';
import * as vscode from 'vscode';
import { getNonce } from './util';

const default_content = {
    "Name": "New NPC",
    "AC": 0,
    "HP": 0,
    "Speed": "6w",
    "Prof": 2,
    "Size": "M",
    "Str": 0, 
    "Dex": 0,
    "Con": 0,
    "Int": 0,
    "Wis": 0,
    "Cha": 0,
    "Skills": "",
    "Languages": ["—"],
    "Features": [
      {
        "Name": "Feature Name",
        "Text": "Feature Description"
      }
    ],
    "Actions": [
      {
        "Name": "Action Name",
        "Text": "Action Description"
      }
    ],
    "LegendaryActions": [
      {
        "Name": "Legendary Action Name",
        "Text": "Legendary Action Description"
      }
    ],
    "Notes": "Example notes."
  };

export class NPCSheetEditorProvider implements vscode.CustomTextEditorProvider {

    public static register(context : vscode.ExtensionContext): vscode.Disposable {
        context.subscriptions.push(vscode.commands.registerCommand('dnd-5e-utilities.npcSheet.new', () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders) {
				vscode.window.showErrorMessage("Creating a new NPC Sheet requires an open workspace");
				return;
            }
            
			const uri = vscode.Uri.joinPath(workspaceFolders[0].uri, `New NPC.npc`)
                .with({ scheme: 'untitled' });

            vscode.commands.executeCommand('vscode.openWith', uri, NPCSheetEditorProvider.viewType);
        }));

        const provider = new NPCSheetEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(NPCSheetEditorProvider.viewType, provider);
        return providerRegistration;
    }

    private static readonly viewType = 'dnd-5e-utilities.npcSheet';
    
    constructor(
        private readonly context: vscode.ExtensionContext
    ) { }

    public async resolveCustomTextEditor(
        document: vscode.TextDocument, 
        webviewPanel: vscode.WebviewPanel, 
        token: vscode.CancellationToken
    ): Promise<void> {
		webviewPanel.webview.options = {
			enableScripts: true,
        };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: 'update',
                text: document.getText(),
            });
        }

        const documentChangeSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() == document.uri.toString()) {
                updateWebview();
            }
        });

        webviewPanel.webview.onDidReceiveMessage(e => {
            if (e.type == "no-content") {
                const edit = new vscode.WorkspaceEdit();
                edit.replace(
                    document.uri,
                    new vscode.Range(0, 0, document.lineCount, 0),
                    JSON.stringify(default_content, null, 2)
                );

                vscode.workspace.applyEdit(edit);
                vscode.window.showInformationMessage(document.fileName);
                document.save();
            }
        });

        webviewPanel.onDidDispose(() => {
            documentChangeSubscription.dispose();
        });

        updateWebview();
    }
    

    private getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(vscode.Uri.file(
            path.join(this.context.extensionPath, 'media', 'npc-sheet', 'npc-sheet.js')
        ));
        const styleResetUri = webview.asWebviewUri(vscode.Uri.file(
            path.join(this.context.extensionPath, 'media', 'reset.css')
        ));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.file(
            path.join(this.context.extensionPath, 'media', 'vscode.css')
        ));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.file(
            path.join(this.context.extensionPath, 'media', 'npc-sheet', 'npc-sheet.css')
        ));

        const nonce = getNonce();

        return /* html */`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">

                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

                <link href="${styleResetUri}" rel="stylesheet" />
                <link href="${styleVSCodeUri}" rel="stylesheet" />
                <link href="${styleMainUri}" rel="stylesheet" />

                <title id="title"></title>
            </head>
            <body>
                <div class="sheet">
                    <table class="character">
                        <tr class="name-row">
                            <td><b class="Name"></b></td>
                        </tr>
                        <tr class="basics-row">
                        <td>
                            <b>AC</b> <span class="AC"></span>
                            <b>HP</b> <span class="HP"></span>
                            <b>SPD</b> <span class="Speed"></span>
                            <b>PROF</b> <span class="Prof"></span>
                            <b>SIZE</b> <span class="Size"></span>

                            <br>

                            <b>S</b> <span class="Str"></span>
                            <b>D</b> <span class="Dex"></span>
                            <b>C</b> <span class="Con"></span>
                            <b>I</b> <span class="Wis"></span>
                            <b>W</b> <span class="Int"></span>
                            <b>C</b> <span class="Cha"></span>

                            <br>

                            <b>Speaks</b> <span class="Languages"></span>

                            <br>

                            <span class="Skills"></span>
                        </td>
                        </tr>
                        <tr class="features-row">
                            <td class="features"></td>
                        </tr>
                        <tr class="actions-row">
                            <td class="actions"></td>

                        </tr>
                        <tr class="legendary-actions-row">
                            <td class="legendary-actions"></td>

                        </tr>
                    </table>
                    <div class="notes"></div>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>
        
        `;
    }
}