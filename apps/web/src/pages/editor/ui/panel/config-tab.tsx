import { type ChangeEvent, type JSX, useRef, useState } from "react";

import {
  IconDeviceFloppy,
  IconDownload,
  IconRestore,
  IconUpload,
} from "@tabler/icons-react";

import type { StandardProfile } from "@rhumb/profiles";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";
import { Label } from "@shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";

import { downloadProfile } from "../../lib/export-diagram";
import { CUSTOM_PROFILE_ID } from "../../model/profile-catalog";
import type { ProfileEditor } from "../../model/use-profile-editor";
import { ProfileFields } from "./profile-form/profile-fields";

export interface ConfigTabProps {
  readonly editor: ProfileEditor;
  readonly onProfileSelect: (id: string) => void;
}

interface Notice {
  readonly kind: "ok" | "error";
  readonly text: string;
}

export function ConfigTab({
  editor,
  onProfileSelect,
}: ConfigTabProps): JSX.Element {
  const t = useT();
  const input = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const titleOf = (profile: StandardProfile): string =>
    profile.id === CUSTOM_PROFILE_ID
      ? t("editor.config.custom")
      : profile.title;

  const canSave =
    editor.editable && editor.dirty && editor.parsed.profile !== undefined;

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (file === undefined) {
      return;
    }

    try {
      const raw: unknown = JSON.parse(await file.text());
      const loaded = editor.importProfile(raw);

      onProfileSelect(loaded.id);
      setNotice({
        kind: "ok",
        text: t("editor.config.loaded", { title: file.name }),
      });
    } catch (error) {
      const details = error instanceof Error ? error.message : String(error);

      setNotice({
        kind: "error",
        text: `${t("editor.config.loadFailed")}\n${details}`,
      });
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <Label className="text-xs uppercase">
          {t("editor.config.standard")}
        </Label>

        <Select
          value={editor.selected.id}
          onValueChange={(value) => {
            if (typeof value === "string") {
              onProfileSelect(value);
            }
          }}
        >
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue>
              {(value: string | null) => {
                const found = editor.profiles.find(
                  (candidate) => candidate.id === value,
                );

                return found === undefined ? value : titleOf(found);
              }}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            {editor.profiles.map((candidate) => (
              <SelectItem key={candidate.id} value={candidate.id}>
                {titleOf(candidate)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="text-xs text-muted-foreground">
          {t("editor.config.description")}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          {editor.editable
            ? t("editor.config.customHint")
            : t("editor.config.lockedHint")}
        </p>

        <ProfileFields
          values={editor.values}
          parsed={editor.parsed}
          disabled={!editor.editable}
          onChange={editor.update}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={!canSave}
            onClick={() => {
              if (editor.save()) {
                setNotice({ kind: "ok", text: t("editor.config.saved") });
              }
            }}
          >
            <IconDeviceFloppy /> {t("editor.config.save")}
          </Button>

          <Button
            variant="outline"
            disabled={!editor.editable || !editor.dirty}
            onClick={() => {
              editor.reset();
              setNotice(null);
            }}
          >
            <IconRestore /> {t("editor.config.reset")}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              input.current?.click();
            }}
          >
            <IconUpload /> {t("editor.config.upload")}
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              downloadProfile(editor.active);
            }}
          >
            <IconDownload /> {t("editor.config.download")}
          </Button>
        </div>

        {editor.editable && editor.dirty ? (
          <p className="text-xs text-muted-foreground">
            {t("editor.config.unsaved")}
          </p>
        ) : null}

        <p className="text-xs text-muted-foreground">
          {t("editor.config.uploadHint")} {t("editor.config.downloadHint")}
        </p>

        <input
          ref={input}
          type="file"
          accept="application/json,.json"
          aria-label={t("editor.config.upload")}
          tabIndex={-1}
          className="sr-only"
          onChange={(event) => {
            void handleFile(event);
          }}
        />

        {notice === null ? null : (
          <p
            role={notice.kind === "error" ? "alert" : "status"}
            className={
              notice.kind === "error"
                ? "rounded-2xl border border-destructive/40 px-3 py-2 font-mono text-xs whitespace-pre-wrap text-destructive"
                : "text-xs text-muted-foreground"
            }
          >
            {notice.text}
          </p>
        )}
      </div>
    </div>
  );
}
