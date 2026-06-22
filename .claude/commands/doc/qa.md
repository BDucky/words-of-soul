---
description: "Generate a QA testing document based on current branch changes"
allowed-tools: Bash(git:*), Read, Write, Glob, Grep, Skill(jira)
---

Generate a QA testing document by analyzing the git diff of the current branch against `origin/dev`.

Steps:

1. **Detect the current branch:**
   ```
   git branch --show-current
   ```

2. **Extract Jira ticket context (if available):**
   Extract the ticket ID from the branch name by looking for a pattern like `cor-XXXX` or `COR-XXXX` (case-insensitive).
   If a ticket ID is found, use the Jira skill to fetch ticket details:
   ```
   /jira get_issue COR-XXXX --no-comments
   ```
   This returns JSON with: summary, description, status, priority, labels, subtasks, etc.
   Use this context to enrich the QA document — especially:
   - The ticket description may contain acceptance criteria or reproduction steps
   - The summary gives a human-written description of the expected behavior
   - Labels/priority help prioritize test scenarios
   - The description may contain "Resolution Criteria:" — these should be included verbatim in the QA doc
   If no ticket ID is found or the fetch fails, continue without Jira context.

3. **Get the diff summary and full diff against dev:**
   ```
   git diff origin/dev...HEAD --stat
   git diff origin/dev...HEAD
   git log origin/dev...HEAD --oneline
   ```

4. **Categorize the changes** by analyzing the diff:
   - `.vue`, `.scss`, `.css` files → **UI/Visual changes** → visual testing steps
   - `graphql`, API-related files → **API changes** → request/response validation
   - Store (`.ts` files in `stores/`) or composable changes → **State management** testing
   - Config, build, or infrastructure files → **Build/Deploy** considerations
   - Test files → note what's already covered by automated tests

5. **Generate a QA testing document** in markdown with these sections:

   ## Summary
   Brief description of what this branch does (1-3 sentences). Reference the branch name and any ticket numbers found in branch name or commit messages.
   If Jira context is available, use the ticket summary and description to write a more accurate and complete summary. Include a link to the Jira ticket.

   ## Resolution Criteria
   If the Jira ticket description contains a "Resolution Criteria:" section, copy it here exactly as written.
   If no resolution criteria are found in the ticket, omit this section entirely.

   ## Areas Affected
   List of areas/modules changed, grouped by category (UI, API, State, etc.).

   ## Test Scenarios
   Numbered list of specific things to test. Each scenario should include:
   - **What to test**: Clear description of the user-facing behavior
   - **Steps**: Step-by-step instructions a QA tester can follow
   - **Expected result**: What should happen

   **Scenario writing rules:**
   - **Consolidate related variations into a single scenario.** If the same behavior applies across multiple variations (e.g., text alignment: left/center/right, or different object types), list them as sub-bullets or a table within ONE scenario — not as separate numbered scenarios.
   - **Avoid repeating setup steps.** If multiple scenarios share the same setup, write the setup once at the top and reference it (e.g., "Using the setup above...").
   - **Write for manual testers, not developers.** Use plain language describing user-visible actions and results. Avoid referencing internal method names, class names, or code-level details in the steps and expected results.
   - **Target 4-8 scenarios total.** Combine aggressively — each scenario should test a distinct *behavior*, not a distinct *parameter value*.

   Prioritize user-facing behaviors over implementation details.
   If the Jira ticket has acceptance criteria (in the description), ensure each criterion has a corresponding test scenario. Flag any acceptance criteria that aren't covered by the code changes.

   ## Edge Cases
   List of edge cases and boundary conditions to verify.

   ## Regression Areas
   Areas that weren't directly changed but could be affected by the changes. Think about what depends on the modified code.

   ## Notes
   Any additional context, known limitations, or things QA should be aware of.
   If Jira context was available, note any discrepancies between the ticket description and the actual code changes.

6. **Write the document** to `.ai/qa/<branch-name>-qa.md` (replace `/` in branch names with `-`).

7. Tell the user the file path so they can review or share it.
