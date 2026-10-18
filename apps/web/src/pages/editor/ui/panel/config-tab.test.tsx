import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { memoryStorage } from "@shared/lib/testing/memory-storage";

import { downloadProfile } from "../../lib/export-diagram";
import {
  CUSTOM_PROFILE_ID,
  CUSTOM_PROFILE_STORAGE_KEY,
  ProfileCatalog,
} from "../../model/profile-catalog";
import { useProfileEditor } from "../../model/use-profile-editor";
import { ConfigTab } from "./config-tab";

vi.mock("../../lib/export-diagram", () => ({ downloadProfile: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.localStorage.clear();
});

interface HarnessProps {
  readonly catalog: ProfileCatalog;
  readonly onProfileSelect?: (id: string) => void;
}

function Harness({ catalog, onProfileSelect = vi.fn() }: HarnessProps) {
  const editor = useProfileEditor(catalog);

  return <ConfigTab editor={editor} onProfileSelect={onProfileSelect} />;
}

function renderTab(options: { custom?: boolean } = {}) {
  const storage = memoryStorage();
  const catalog = new ProfileCatalog(storage);

  if (options.custom === true) {
    window.localStorage.setItem("rhumb:profile", CUSTOM_PROFILE_ID);
  }

  const onProfileSelect = vi.fn();

  render(<Harness catalog={catalog} onProfileSelect={onProfileSelect} />);

  return { catalog, storage, onProfileSelect };
}

function pick(file: File): void {
  fireEvent.change(screen.getByLabelText("Load profile"), {
    target: { files: [file] },
  });
}

/** The control that sits next to a field's label text. */
function controlOf(label: string | RegExp, selector: string): Element {
  const control = screen
    .getByText(label)
    .parentElement?.querySelector(selector);

  if (control === null || control === undefined) {
    throw new Error(`No control next to ${String(label)}`);
  }

  return control;
}

/** The grid step sits in a group that starts closed. */
function gridField(): HTMLInputElement {
  if (screen.queryByText(/Grid step/) === null) {
    fireEvent.click(screen.getByRole("button", { name: /Page and spacing/ }));
  }

  const field = controlOf(/Grid step/, "input");

  if (!(field instanceof HTMLInputElement)) {
    throw new Error("The grid field is not an input");
  }

  return field;
}

describe("ConfigTab", () => {
  it("starts on the default standard and locks its values", () => {
    const { catalog } = renderTab();
    const [standard] = catalog.getSnapshot();

    expect(controlOf("Standard", '[role="combobox"]').textContent).toContain(
      standard?.title,
    );
    expect(gridField().value).toBe(String(standard?.grid));
    expect(gridField().disabled).toBe(true);
    expect(screen.getByText(/Built-in standards are read-only/)).toBeDefined();
    expect(screen.getByRole("button", { name: /Save/ })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("unlocks the values of the custom standard", () => {
    renderTab({ custom: true });

    expect(gridField().disabled).toBe(false);
    expect(screen.getByText(/Changes are drawn right away/)).toBeDefined();
    expect(controlOf("Standard", '[role="combobox"]').textContent).toContain(
      "Custom",
    );
  });

  it("flags invalid input and blocks saving until it is fixed", () => {
    renderTab({ custom: true });
    const save = screen.getByRole("button", { name: /Save/ });

    fireEvent.change(gridField(), { target: { value: "abc" } });

    expect(gridField().getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Enter a number")).toBeDefined();
    expect(save).toHaveProperty("disabled", true);

    fireEvent.change(gridField(), { target: { value: "0" } });
    expect(screen.getByText("Must be greater than zero")).toBeDefined();

    fireEvent.change(gridField(), { target: { value: "6" } });
    expect(screen.queryByText("Must be greater than zero")).toBeNull();
    expect(gridField().getAttribute("aria-invalid")).toBe("false");
    expect(save).toHaveProperty("disabled", false);
  });

  it("saves the edited values and says so", async () => {
    const { catalog, storage } = renderTab({ custom: true });

    fireEvent.change(gridField(), { target: { value: "8" } });
    expect(screen.getByText("Unsaved changes")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: /Save/ }));

    expect((await screen.findByRole("status")).textContent).toBe("Saved");
    expect(catalog.getSnapshot().at(-1)?.grid).toBe(8);
    expect(storage.getItem(CUSTOM_PROFILE_STORAGE_KEY)).toContain('"grid":8');
    expect(screen.queryByText("Unsaved changes")).toBeNull();
  });

  it("puts the saved values back when changes are reset", () => {
    const { catalog } = renderTab({ custom: true });
    const original = catalog.getSnapshot().at(-1)?.grid;

    fireEvent.change(gridField(), { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: /Reset changes/ }));

    expect(gridField().value).toBe(String(original));
  });

  it("opens the groups of fields on demand", async () => {
    renderTab({ custom: true });

    expect(screen.queryByLabelText(/Line width/)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Lines and arrows/ }));

    expect(await screen.findByText(/Line width/)).toBeDefined();
  });

  it("downloads the profile that is being drawn", () => {
    const { catalog } = renderTab();

    fireEvent.click(screen.getByRole("button", { name: /Download profile/ }));

    expect(downloadProfile).toHaveBeenCalledWith(catalog.getSnapshot()[0]);
  });

  it("loads a valid profile file into the custom standard", async () => {
    const { catalog, onProfileSelect } = renderTab();
    const [first] = catalog.getSnapshot();

    pick(
      new File(
        [JSON.stringify({ ...first, id: "other", grid: 12 })],
        "mine.json",
      ),
    );

    await waitFor(() => {
      expect(onProfileSelect).toHaveBeenCalledWith(CUSTOM_PROFILE_ID);
    });
    expect((await screen.findByRole("status")).textContent).toBe(
      "Profile loaded: mine.json",
    );
    expect(gridField().value).toBe("12");
  });

  it("reports broken JSON and schema problems", async () => {
    renderTab();

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
    const { onProfileSelect } = renderTab();

    fireEvent.change(screen.getByLabelText("Load profile"), {
      target: { files: [] },
    });

    expect(onProfileSelect).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("keeps the label style among the other settings of the standard", async () => {
    renderTab({ custom: true });

    expect(screen.queryByText("Line labels")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Lines and arrows/ }));
    await screen.findByText("Line labels");
    const style = controlOf("Line labels", '[role="combobox"]');

    expect(style.textContent).toContain("Beside the line");
    expect(style).toHaveProperty("disabled", false);
  });

  it("shows the label style of a built-in standard, locked", async () => {
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: /Lines and arrows/ }));
    await screen.findByText("Line labels");
    const style = controlOf("Line labels", '[role="combobox"]');

    expect(style.textContent).toContain("Beside the line");
    expect(style.hasAttribute("disabled")).toBe(true);
  });
});
