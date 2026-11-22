import { type ChangeEvent, type JSX, useRef, useState } from "react";

import {
  IconDeviceFloppy,
  IconDownload,
  IconInfoTriangle,
  IconRestore,
  IconUpload,
} from "@tabler/icons-react";

import type { StandardProfile } from "@rhumb/profiles";

import { StandardManager } from "@widgets/standard-manager";

import { useT } from "@shared/i18n";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { Alert } from "@shared/ui/alert";
import { Button, ButtonGroup } from "@shared/ui/button";
import { Label } from "@shared/ui/label";

import { downloadProfile } from "../../../../lib/export-diagram";
import type { DiagramLibrary } from "../../../../model/diagram";
import {
  MAX_TITLE_LENGTH,
  type ProfileEditor,
} from "../../../../model/profile";
import { ProfileFields } from "./profile-fields";

type Dialog = "create" | "rename" | "delete";

interface Notice {
  readonly kind: "ok" | "error";
  readonly text: string;
}

function toOption(profile: StandardProfile) {
  return { value: profile.id, label: profile.title };
}

export interface ProfileSectionProps {
  readonly editor: ProfileEditor;
  readonly library: DiagramLibrary;
  readonly onProfileSelect: (id: string) => void;
  readonly onProfileRemove: (
    id: string,
    replacementId: string,
  ) => Promise<boolean>;
}

export function ProfileSection({
  editor,
  library,
  onProfileSelect,
  onProfileRemove,
}: ProfileSectionProps): JSX.Element {
  const t = useT();
  const input = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [baseId, setBaseId] = useState(editor.selected.id);
  const [replacementId, setReplacementId] = useState("");

  const { selected } = editor;
  const builtInOptions = editor.builtIn.map(toOption);
  const customOptions = editor.custom.map(toOption);
  const otherCustomOptions = editor.custom
    .filter((profile) => profile.id !== selected.id)
    .map(toOption);
  const usedBy = library.items?.filter(
    (item) => item.profileId === selected.id,
  ).length;

  const canSave =
    editor.editable && editor.dirty && editor.parsed.profile !== undefined;

  function copyTitleOf(profile: StandardProfile): string {
    return editor.uniqueTitle(
      t("editor.config.copyTitle", { title: profile.title }),
    );
  }

  function created(profile: StandardProfile): void {
    onProfileSelect(profile.id);
    setNotice({
      kind: "ok",
      text: t("editor.config.notices.created", { title: profile.title }),
    });
  }

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
        text: t("editor.config.loaded", { title: loaded.title }),
      });
    } catch (error) {
      setNotice({
        kind: "error",
        text: `${t("editor.config.loadFailed")}\n${getErrorMessage(error)}`,
      });
    }
  }

  async function handleDelete(): Promise<void> {
    const removed = selected;
    const done = await onProfileRemove(removed.id, replacementId);

    setNotice(
      done
        ? {
            kind: "ok",
            text: t("editor.config.notices.deleted", { title: removed.title }),
          }
        : { kind: "error", text: t("editor.config.notices.deleteFailed") },
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <StandardManager>
        <StandardManager.Header
          label={t("editor.config.standard")}
          htmlFor="standard-select"
        >
          <StandardManager.Actions
            customSelected={editor.editable}
            onCreate={() => {
              setBaseId(selected.id);
              setDialog("create");
            }}
            onDuplicate={() => {
              created(editor.create(copyTitleOf(selected), selected.id));
            }}
            onRename={() => {
              setDialog("rename");
            }}
            onDelete={() => {
              setReplacementId(editor.builtIn[0]?.id ?? "");
              setDialog("delete");
            }}
          />
        </StandardManager.Header>

        <StandardManager.Select
          id="standard-select"
          value={selected.id}
          onValueChange={onProfileSelect}
          builtIn={builtInOptions}
          custom={customOptions}
        />

        <p className="text-xs text-muted-foreground">
          {t("editor.config.description")}
        </p>

        <StandardManager.NameDialog
          open={dialog === "create"}
          onOpenChange={(open) => {
            setDialog(open ? "create" : null);
          }}
          mode="create"
          initialName={copyTitleOf(selected)}
          maxLength={MAX_TITLE_LENGTH}
          checkName={(name) => editor.titleIssue(name)}
          onSubmit={(name) => {
            created(editor.create(name, baseId));
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="standard-base" className="text-xs uppercase">
              {t("editor.config.nameDialog.baseLabel")}
            </Label>
            <StandardManager.Select
              id="standard-base"
              value={baseId}
              onValueChange={setBaseId}
              builtIn={builtInOptions}
              custom={customOptions}
              hideEmptyHint
            />
          </div>
        </StandardManager.NameDialog>

        <StandardManager.NameDialog
          open={dialog === "rename"}
          onOpenChange={(open) => {
            setDialog(open ? "rename" : null);
          }}
          mode="rename"
          initialName={selected.title}
          maxLength={MAX_TITLE_LENGTH}
          checkName={(name) => editor.titleIssue(name, selected.id)}
          onSubmit={(name) => {
            editor.rename(name);
            setNotice({
              kind: "ok",
              text: t("editor.config.notices.renamed", { title: name }),
            });
          }}
        />

        <StandardManager.DeleteDialog
          open={dialog === "delete"}
          onOpenChange={(open) => {
            setDialog(open ? "delete" : null);
          }}
          title={selected.title}
          usedBy={usedBy}
          builtIn={builtInOptions}
          custom={otherCustomOptions}
          replacementId={replacementId}
          onReplacementChange={setReplacementId}
          onConfirm={() => {
            void handleDelete();
          }}
        />
      </StandardManager>

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
        <div className="flex min-w-0 flex-wrap gap-2">
          <ButtonGroup className="w-auto max-w-full min-w-0 grow">
            <Button
              disabled={!canSave}
              className="min-w-0 flex-auto shrink overflow-hidden"
              onClick={() => {
                if (editor.save()) {
                  setNotice({ kind: "ok", text: t("editor.config.saved") });
                }
              }}
            >
              <IconDeviceFloppy />
              <span className="min-w-0 truncate">
                {t("editor.config.save")}
              </span>
            </Button>

            <Button
              variant="outline"
              disabled={!editor.editable || !editor.dirty}
              className="min-w-0 flex-auto shrink overflow-hidden"
              onClick={() => {
                editor.reset();
                setNotice(null);
              }}
            >
              <IconRestore />
              <span className="min-w-0 truncate">
                {t("editor.config.reset")}
              </span>
            </Button>
          </ButtonGroup>

          <ButtonGroup className="w-auto max-w-full min-w-0 grow">
            <Button
              variant="outline"
              className="min-w-0 flex-auto shrink overflow-hidden"
              onClick={() => {
                input.current?.click();
              }}
            >
              <IconUpload />
              <span className="min-w-0 truncate">
                {t("editor.config.upload")}
              </span>
            </Button>

            <Button
              variant="outline"
              className="min-w-0 flex-auto shrink overflow-hidden"
              onClick={() => {
                downloadProfile(editor.active);
              }}
            >
              <IconDownload />
              <span className="min-w-0 truncate">
                {t("editor.config.download")}
              </span>
            </Button>
          </ButtonGroup>
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

        {notice?.kind === "error" ? (
          <Alert variant="destructive">
            <IconInfoTriangle className="size-4 shrink-0" />
            {notice.text}
          </Alert>
        ) : null}

        {notice?.kind === "ok" ? (
          <p role="status" className="text-xs text-muted-foreground">
            {notice.text}
          </p>
        ) : null}
      </div>
    </section>
  );
}
