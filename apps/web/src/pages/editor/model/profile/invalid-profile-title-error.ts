import type { TitleIssue } from "./check-title";

export class InvalidProfileTitleError extends Error {
  public readonly issue: TitleIssue;

  public constructor(issue: TitleIssue) {
    super(`Invalid standard name: ${issue}`);
    this.name = "InvalidProfileTitleError";
    this.issue = issue;
  }
}
