import * as vscode from 'vscode';
import { NPCSheetEditorProvider } from './npcSheetEditor';
import * as markdown_utilities from './markdown-utilities';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(NPCSheetEditorProvider.register(context));
	return markdown_utilities.activate(context);
}
