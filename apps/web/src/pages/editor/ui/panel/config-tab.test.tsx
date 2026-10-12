import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProfileRegistry } from "@rhumb/profiles";

import { downloadProfile } from "../../lib/export-diagram";
import { ConfigTab } from "./config-tab";

vi.mock("../../lib/export-diagram", () => ({ downloadProfile: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const profiles = ProfileRegistry.withBuiltins().list();
const first = profiles[0];

if (first === undefined) {
  throw new Error("Missing profile");
}

function pick(file: File): void {
  fireEvent.change(screen.getByLabelText("Load profile"), {
    target: { files: [file] },
  });
}

describe("ConfigTab", () => {
  it("shows the selected standard", () => {
    render(
      <ConfigTab
        profiles={profiles}
        profile={first}
        onProfileChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("combobox").textContent).toContain(first.title);
  });

  it("downloads the current profile", () => {
    render(
      <ConfigTab
        profiles={profiles}
        profile={first}
        onProfileChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Download profile/ }));
    expect(downloadProfile).toHaveBeenCalledWith(first);
  });

  it("disables the download without a profile", () => {
    render(
      <ConfigTab
        profiles={profiles}
        profile={undefined}
        onProfileChange={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Download profile/ }),
    ).toHaveProperty("disabled", true);
  });

  it("loads a valid profile, selects it and says so", async () => {
    const onProfileChange = vi.fn();

    render(
      <ConfigTab
        profiles={profiles}
        profile={first}
        onProfileChange={onProfileChange}
      />,
    );

    const custom = { ...first, id: "uploaded", title: "Uploaded standard" };

    pick(new File([JSON.stringify(custom)], "profile.json"));

    await waitFor(() => {
      expect(onProfileChange).toHaveBeenCalledWith("uploaded");
    });
    expect((await screen.findByRole("status")).textContent).toBe(
      "Profile loaded: Uploaded standard",
    );
  });

  it("reports broken JSON and schema problems", async () => {
    render(
      <ConfigTab
        profiles={profiles}
        profile={first}
        onProfileChange={vi.fn()}
      />,
    );
    pick(new File(["{"], "bad.json"));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Could not load the profile",
    );

    pick(new File([JSON.stringify({ id: "x" })], "bad.json"));
    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain(
        "Invalid profile",
      );
    });
  });

  it("ignores an empty selection", () => {
    const onProfileChange = vi.fn();

    render(
      <ConfigTab
        profiles={profiles}
        profile={first}
        onProfileChange={onProfileChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Load profile"), {
      target: { files: [] },
    });
    expect(onProfileChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
