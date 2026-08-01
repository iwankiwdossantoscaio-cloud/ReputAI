# Bob AI CLI

Bob AI CLI is a lightweight VS Code helper for AI coding workflows. It makes it easy to:

- copy a precise code reference with file and line numbers
- send selected code to a terminal for Claude Code or similar CLIs
- generate quick action prompts for code review, refactors, tests, and docs

## Commands

- Bob AI CLI: Copy Code Reference
- Bob AI CLI: Send to Terminal
- Bob AI CLI: Quick Action Template

## Settings

- `bobAiCli.defaultCliCommand` — change the terminal command used for the send-to-terminal action. Default: `claude`

## Usage

1. Open a file in VS Code and select code.
2. Run one of the Bob AI CLI commands from the Command Palette.
3. Paste the copied text or send it to the terminal for your AI CLI workflow.

## Development

```bash
npm install
npm run compile
```
