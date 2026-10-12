import { type ChangeEvent, type JSX, useId, useRef, useState } from "react";

import { IconDownload, IconUpload } from "@tabler/icons-react";

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
import { profileCatalog } from "../../model/profile-catalog";

export interface ConfigTabProps {
  readonly profiles: readonly StandardProfile[];
  readonly profile: StandardProfile | undefined;
  readonly onProfileChange: (id: string) => void;
}

export function ConfigTab({
  profiles,
  profile,
  onProfileChange,
}: ConfigTabProps): JSX.Element {
  const t = useT();
  const selectId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<{
    readonly kind: "ok" | "error";
    readonly text: string;
  } | null>(null);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (file === undefined) {
      return;
    }

    try {
      const raw: unknown = JSON.parse(await file.text());
      const loaded = profileCatalog.register(raw);

      onProfileChange(loaded.id);
      setNotice({
        kind: "ok",
        text: t("editor.config.loaded", { title: loaded.title }),
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
        <Label htmlFor={selectId} className="text-xs uppercase">
          {t("editor.config.standard")}
        </Label>

        <Select
          value={profile?.id ?? null}
          onValueChange={(value) => {
            if (typeof value === "string") {
              onProfileChange(value);
            }
          }}
        >
          <SelectTrigger id={selectId} className="w-full rounded-xl">
            <SelectValue>
              {(value: string | null) =>
                profiles.find((candidate) => candidate.id === value)?.title ??
                value
              }
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            {profiles.map((candidate) => (
              <SelectItem key={candidate.id} value={candidate.id}>
                {candidate.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="text-xs text-muted-foreground">
          {t("editor.config.description")}
        </p>
      </div>

      <div className="flex flex-col gap-2">
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
            disabled={profile === undefined}
            onClick={() => {
              if (profile !== undefined) {
                downloadProfile(profile);
              }
            }}
          >
            <IconDownload /> {t("editor.config.download")}
          </Button>
        </div>

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

        {notice !== null && (
          <p
            role={notice.kind === "error" ? "alert" : "status"}
            className={
              notice.kind === "error"
                ? "rounded-2xl border border-destructive/40 px-3 py-2 text-xs whitespace-pre-wrap text-destructive"
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
