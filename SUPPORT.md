<!--suppress HtmlDeprecatedAttribute -->
<h1 align="center">Support</h1>

<div align="center">
  <h6>
    <a rel="noopener noreferrer" href="README.md">Readme</a>
    ·
    <a rel="noopener noreferrer" href="CODE_OF_CONDUCT.md">Code of Conduct</a>
    ·
    <a rel="noopener noreferrer" href="CONTRIBUTING.md">Contributing</a>
    ·
    <a rel="noopener noreferrer" href="SECURITY.md">Security Policy</a>
    ·
    <a rel="noopener noreferrer" href="RELEASING.md">Releasing</a>
    ·
    <a rel="noopener noreferrer" href="LICENSE.md">License</a>
  </h6>
</div>

## What Kind of Support Is Available

Rhumb provides best-effort, community-driven support for:

- Reproducible bugs with clear steps
- Parser, layout and export issues
- Documentation fixes and clarifications
- Clearly scoped feature requests
- Questions about the supported source syntax and the profile format

## What Is Not Considered Support

| Not covered                       | Reason                                    |
|-----------------------------------|-------------------------------------------|
| Real-time or chat-based support   | There is no dedicated support staff       |
| Private troubleshooting           | Support is handled publicly when possible |
| Custom feature development        | Rhumb is not a consulting service         |
| SLAs or guaranteed response times | Support is best-effort                    |
| Debugging heavily modified forks  | Too many variables are involved           |

## Where to Ask for Help

```mermaid
flowchart TD
  A{"What do you need?"} --> B["Something is broken<br/>or missing"]
  A --> C["A question or<br/>an idea to discuss"]
  A --> D["A security<br/>vulnerability"]
  B --> E(["Open an issue"])
  C --> F(["GitHub Discussions"])
  D --> G(["Email privately -<br/>see SECURITY.md"])

  classDef step stroke:#666, rx:6, ry:6
  classDef bad  stroke:#a33
  classDef good stroke:#1f6feb

  class A,B,C,D step
  class E,F good
  class G bad
```

| Topic                         | Channel                                                                    |
|-------------------------------|----------------------------------------------------------------------------|
| **Bugs and feature requests** | [Open an issue](https://github.com/nykonhrytsyshyn/rhumb/issues)           |
| **Questions and discussion**  | [GitHub Discussions](https://github.com/nykonhrytsyshyn/rhumb/discussions) |
| **Security vulnerabilities**  | Follow [`SECURITY.md`](SECURITY.md); do not report publicly                |

> [!TIP]
> A small reproducible example helps more than a screenshot alone. Paste the
> diagram source into the issue.

## Before Opening an Issue

> [!IMPORTANT]
> Low-effort, vague or off-topic issues may be closed without response.

- [ ] Search existing issues first
- [ ] Confirm the problem is reproducible
- [ ] Include the smallest source diagram that demonstrates it
- [ ] Include browser, OS, Node/pnpm version and the selected profile when relevant
- [ ] Include the exact error and the expected behavior

#

<h6 align="center">
  Clear reports, clear scope, clear expectations.
</h6>
