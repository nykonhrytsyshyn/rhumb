import type { JSX } from "react";
import { useState } from "react";

import { IconBrandGithub } from "@tabler/icons-react";

import { ThemeToggler } from "@features/theme";

import { SITE } from "@shared/config";
import { LANGUAGE_OPTIONS, LanguageSwitcher, useI18n } from "@shared/i18n";
import { usePersistedState } from "@shared/lib/use-persisted-state";
import { Button } from "@shared/ui/button";

import { sampleSource, translateSample } from "../config/samples";
import { useProfiles } from "../model/use-profiles";
import { useRenderedDiagram } from "../model/use-rendered-diagram";
import { DiagramCanvas } from "./canvas";
import { EditorPanel } from "./panel";

const SOURCE_KEY = "rhumb:source";
const PROFILE_KEY = "rhumb:profile";
const WIDE_SCREEN = "(min-width: 768px)";

function startsOpen(): boolean {
  return (
    typeof window.matchMedia !== "function" ||
    window.matchMedia(WIDE_SCREEN).matches
  );
}

export function EditorPage(): JSX.Element {
  const { t, language, setLanguage } = useI18n();
  const profiles = useProfiles();
  const [source, setSource] = usePersistedState(
    SOURCE_KEY,
    sampleSource("algorithm", language),
  );
  const [profileId, setProfileId] = usePersistedState(PROFILE_KEY, "");
  const [panelOpen, setPanelOpen] = useState(startsOpen);
  const [fitKey, setFitKey] = useState(0);

  const profile =
    profiles.find((candidate) => candidate.id === profileId) ?? profiles[0];
  const rendered = useRenderedDiagram(source, profile);

  return (
    <main className="relative flex h-dvh w-full overflow-hidden">
      <h1 className="sr-only">
        {t("common.app.name")}: {t("common.app.tagline")}
      </h1>

      <EditorPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        source={source}
        onSourceChange={setSource}
        error={rendered.error}
        profiles={profiles}
        profile={profile}
        onProfileChange={(id) => {
          setProfileId(id);
          setFitKey((key) => key + 1);
        }}
        onSampleSelect={(next) => {
          setSource(next);
          setFitKey((key) => key + 1);
        }}
      />

      <DiagramCanvas
        state={rendered}
        panelOpen={panelOpen}
        onPanelOpenChange={setPanelOpen}
        fitKey={fitKey}
        footer={
          <>
            <LanguageSwitcher
              language={language}
              onChange={(next) => {
                const translated = translateSample(source, next);

                if (translated !== undefined) {
                  setSource(translated);
                }

                setLanguage(next);
              }}
              options={LANGUAGE_OPTIONS}
              label={t("common.language.label")}
              heading={t("common.language.heading")}
            />

            <ThemeToggler
              label={t("common.theme.toggle")}
              modeLabels={{
                light: t("common.theme.mode.light"),
                dark: t("common.theme.mode.dark"),
                system: t("common.theme.mode.system"),
              }}
            />

            <Button
              variant="outline"
              title={`v${SITE.version}`}
              onClick={() => {
                window.open(
                  SITE.repositoryUrl,
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
              className="gap-3"
            >
              <span className="font-mono text-xs text-muted-foreground">
                v{SITE.version}
              </span>

              <IconBrandGithub />
            </Button>
          </>
        }
      />
    </main>
  );
}
