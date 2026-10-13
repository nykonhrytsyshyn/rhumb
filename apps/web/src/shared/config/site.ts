import pkg from "../../../package.json";

export const SITE = {
  name: "Rhumb",
  url: "https://rhumb.nykon.me",
  author: { name: "Nykon", url: "https://nykon.me" },
  version: pkg.version,
  repositoryUrl: "https://git.nykon.me/rhumb",
} as const;
