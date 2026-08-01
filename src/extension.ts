import * as path from 'path';
import * as vscode from 'vscode';

type PromptTemplate = {
  label: string;
  description: string;
  build: (code: string, fileName: string, lineLabel: string) => string;
};

const templates: PromptTemplate[] = [
  {
    label: 'Explain this code',
    description: 'Describe the purpose and behavior of the selected code.',
    build: (code, fileName, lineLabel) =>
      `Review the code in ${fileName}${lineLabel} and explain its purpose, how it works, and any important trade-offs.\n\nCode:\n${code}`
  },
  {
    label: 'Review for bugs',
    description: 'Look for logic issues, edge cases, and risks.',
    build: (code, fileName, lineLabel) =>
      `Review the code in ${fileName}${lineLabel} for bugs, edge cases, performance issues, and maintainability concerns. Recommend concrete fixes when appropriate.\n\nCode:\n${code}`
  },
  {
    label: 'Refactor it',
    description: 'Improve clarity and maintainability without changing behavior.',
    build: (code, fileName, lineLabel) =>
      `Refactor the code in ${fileName}${lineLabel} for clarity, simplicity, and maintainability without changing its behavior. Preserve the same API and logic.\n\nCode:\n${code}`
  },
  {
    label: 'Write tests',
    description: 'Generate focused tests for the selected logic.',
    build: (code, fileName, lineLabel) =>
      `Write focused tests for the code in ${fileName}${lineLabel}. Cover core behavior, edge cases, and likely regressions.\n\nCode:\n${code}`
  },
  {
    label: 'Add documentation',
    description: 'Create concise documentation or comments for the code.',
    build: (code, fileName, lineLabel) =>
      `Document the code in ${fileName}${lineLabel}. Add concise explanations for purpose, inputs, outputs, and edge cases.\n\nCode:\n${code}`
  }
];

function getWorkspaceRelativePath(document: vscode.TextDocument): string {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
  if (!workspaceFolder) {
    return document.uri.fsPath;
  }

  return path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath).replace(/\\/g, '/');
}

function getCodeText(document: vscode.TextDocument, selection: vscode.Selection): string {
  if (!selection.isEmpty) {
    return document.getText(selection).trim();
  }

  return document.lineAt(selection.active.line).text.trim();
}

function getLineLabel(selection: vscode.Selection): string {
  const startLine = selection.start.line + 1;
  const endLine = selection.end.line + 1;

  return startLine === endLine ? `:${startLine}` : `:${startLine}-${endLine}`;
}

function getTerminalName(): string {
  return 'Bob AI CLI';
}

function getTerminal(): vscode.Terminal {
  const terminals = vscode.window.terminals.filter((terminal) => terminal.name === getTerminalName());
  if (terminals.length > 0) {
    return terminals[0];
  }

  return vscode.window.createTerminal({
    name: getTerminalName(),
    cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
  });
}

export function activate(context: vscode.ExtensionContext): void {
  const copyReferenceCommand = vscode.commands.registerCommand('bobAI.copyReference', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Open a file before copying a code reference.');
      return;
    }

    const { document, selection } = editor;
    const code = getCodeText(document, selection);
    if (!code) {
      vscode.window.showWarningMessage('Select some code or place the cursor on a line before copying a reference.');
      return;
    }

    const reference = `${getWorkspaceRelativePath(document)}${getLineLabel(selection)}\n\n${code}`;
    await vscode.env.clipboard.writeText(reference);
    vscode.window.showInformationMessage(`Copied code reference for ${getWorkspaceRelativePath(document)}`);
  });

  const sendToTerminalCommand = vscode.commands.registerCommand('bobAI.sendToTerminal', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Open a file before sending code to the terminal.');
      return;
    }

    const { document, selection } = editor;
    const code = getCodeText(document, selection);
    if (!code) {
      vscode.window.showWarningMessage('Select some code or place the cursor on a line before sending it to the terminal.');
      return;
    }

    const terminal = getTerminal();
    terminal.show(true);
    terminal.sendText(code);

    const cliCommand = vscode.workspace.getConfiguration('bobAiCli').get<string>('defaultCliCommand', 'claude');
    vscode.window.showInformationMessage(`Sent selected code to the terminal for ${cliCommand}.`);
  });

  const quickActionCommand = vscode.commands.registerCommand('bobAI.quickAction', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Open a file before generating a quick action.');
      return;
    }

    const { document, selection } = editor;
    const code = getCodeText(document, selection);
    if (!code) {
      vscode.window.showWarningMessage('Select some code before generating a quick action.');
      return;
    }

    const choice = await vscode.window.showQuickPick(
      templates.map((template) => ({
        label: template.label,
        description: template.description,
        detail: template.label
      })),
      { placeHolder: 'Choose a quick action for your selected code' }
    );

    if (!choice) {
      return;
    }

    const template = templates.find((item) => item.label === choice.label);
    if (!template) {
      return;
    }

    const prompt = template.build(code, getWorkspaceRelativePath(document), getLineLabel(selection));
    await vscode.env.clipboard.writeText(prompt);

    const terminal = getTerminal();
    terminal.show(true);
    terminal.sendText(prompt);

    vscode.window.showInformationMessage(`Prepared the "${choice.label}" action and sent it to the terminal.`);
  });

  context.subscriptions.push(copyReferenceCommand, sendToTerminalCommand, quickActionCommand);
}

export function deactivate(): void {
  // no-op
}
