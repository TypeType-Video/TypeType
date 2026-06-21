import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ConfirmModal } from "../components/confirm-modal";
import { useSettings } from "../hooks/use-settings";
import { allowHideEverything } from "../lib/hide-everything";
import { ROW, ToggleSwitch } from "./settings-toggle-switch";

const HIDE_STEPS = [
  {
    title: "Hide everything?",
    description: "All those recommendations, comments and shorts we worked so hard on, gone.",
    confirm: "Yeah, hide it",
  },
  {
    title: "Are you sure?",
    description: "Like, actually sure? You will have nothing left to scroll.",
    confirm: "I am sure",
  },
  {
    title: "Are you SURE sure?!",
    description: "We spent months on this. Months. And poof, you want it gone?",
    confirm: "Yes, gone",
  },
  {
    title: "LAST CHANCE.",
    description: "Okay fine. Do not say we did not warn you.",
    confirm: "Fine, I'll hide it",
  },
];

export function HideEverythingToggle() {
  const { update } = useSettings();
  const navigate = useNavigate();
  const [step, setStep] = useState(-1);
  const current = step >= 0 ? HIDE_STEPS[step] : null;
  const onConfirm = () => {
    if (step < HIDE_STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    update.mutate({
      hideContinueWatching: true,
      hideHomeRecommendations: true,
      hideRelatedVideos: true,
      hideComments: true,
      hideShorts: true,
    });
    allowHideEverything();
    navigate({ to: "/hide-everything" });
  };
  return (
    <>
      <div className={ROW}>
        <div className="flex flex-col gap-1">
          <span className="text-fg text-sm">Hide everything</span>
          <span className="text-fg-soft text-xs">
            Hide every recommendation, comment, and surface at once.
          </span>
        </div>
        <ToggleSwitch checked={step >= 0} onClick={() => setStep(0)} />
      </div>
      {current && (
        <ConfirmModal
          title={current.title}
          description={current.description}
          confirmLabel={current.confirm}
          onConfirm={onConfirm}
          onCancel={() => setStep(-1)}
        />
      )}
    </>
  );
}
