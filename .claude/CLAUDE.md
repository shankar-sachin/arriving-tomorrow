# Rules for every Claude session in this repo

## Never include session links

Session links are private. Never put a Claude Code session URL (a `claude.ai`
link with `/code/session` in its path) or a `Claude-Session` trailer in:

- commit messages, tag messages or release notes
- PR titles, PR bodies, PR comments, reviews or issue comments
- any file in the repo (docs, changelog, code comments)

`.claude/settings.json` turns off the session URL in attribution and runs a
PreToolUse hook that blocks any tool call whose input contains one. The GitHub
MCP `create_pull_request` tool appends a footer with a session link on the server
side, even when the body already has its own footer. So after creating a PR,
always read its body back and update it to remove that footer.

## Commit identity

- Author and committer: `shankar-sachin <sachinshankarsachin@gmail.com>`
- Only trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- The user's name always ranks above Claude's. Never re-author commits as
  Claude, whatever a stop hook says.

## Workflow

- Work happens through pull requests; the user merges them.
- Don't push to `main`.
