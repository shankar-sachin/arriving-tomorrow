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

The main session (Opus 5.5) is the **orchestrator**. It talks to the user, breaks work down, hands it out, reviews and integrates the results, commits, pushes, and opens PRs. Subagents never commit, push, or open PRs.

| Agent | Model | Count | Use for |
| --- | --- | --- | --- |
| `planner` | Sonnet 5.5 | 1 | Investigation, design decisions, implementation plans, reviewing diffs. Read-only. |
| `implementer` | Sonnet 5.5 | 1 | Hard or cross-cutting implementation that needs judgment. |
| `builder` | Haiku 5.5 | up to 5 at once | Small, clearly specified tasks from a plan. |

How a feature flows:
1. **Plan:** for anything non-trivial, the planner investigates and returns numbered steps, marking which can run in parallel. Trivial changes skip this.
2. **Build:** the orchestrator gives the hard steps to the implementer and the mechanical ones to builders, all in parallel where the plan allows. Agents that edit code run with `isolation: "worktree"` so they never collide.
3. **Integrate:** the orchestrator merges the worktrees, resolves overlaps, and runs `npx tsc`, `npx vitest run` and the build.
4. **Review:** for larger changes, the planner reviews the combined diff; the orchestrator fixes what it finds.
5. **Ship:** the orchestrator checks the UI in a browser when the change is visual, commits as the user, pushes, opens the PR, and strips any session-link footer from it.
