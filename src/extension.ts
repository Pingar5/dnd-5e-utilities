import * as vscode from 'vscode';
import { NPCSheetEditorProvider } from './npcSheetEditor';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(NPCSheetEditorProvider.register(context));
}
