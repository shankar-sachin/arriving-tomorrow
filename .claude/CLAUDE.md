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
- Don't push to `main` unless the user explicitly says to for that change.

## Agent team

The main session (Opus 5.5) is the **orchestrator**. It talks to the user, breaks work down, starts every agent itself, reviews and integrates the results, commits, pushes, and opens PRs. The team is flat: agents never start other agents (nesting is switched off in `.claude/settings.json`), commit, push, or open PRs.

| Agent | Model | Count | Use for |
| --- | --- | --- | --- |
| `lead` | Sonnet 5.5, medium effort | 1 | Investigation, plans, the hard implementation, and reviewing diffs. |
| `builder` | Haiku 5.5 | up to 5 at once | Small, clearly specified tasks, including read-only audits of one area. |

How a feature flows:
1. **Plan:** for anything non-trivial, the lead investigates and returns numbered steps, marking which can run in parallel. Trivial changes skip this.
2. **Build:** the orchestrator starts up to five builders in parallel on the mechanical steps, and the lead on the hard ones. Agents that edit code run with `isolation: "worktree"` so they never collide.
3. **Integrate:** the orchestrator merges the worktrees, resolves overlaps, and runs `npx tsc`, `npx vitest run` and the build.
4. **Review:** for larger changes, the lead reviews the combined diff; the orchestrator fixes what it finds.
5. **Ship:** the orchestrator checks the UI in a browser when the change is visual, commits as the user, pushes, opens the PR, and strips any session-link footer from it.

Audits work the same way: the orchestrator splits the codebase into up to five areas, gives each to a builder, and has the lead verify the combined findings before they reach the user.
