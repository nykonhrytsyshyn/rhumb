import pkg from "../../../package.json";

export const SITE = {
  name: "Rhumb",
  url: "https://rhumb.nykon.me",
  author: { name: "Nykon", url: "https://nykon.me" },
  version: pkg.version,
} as const;
