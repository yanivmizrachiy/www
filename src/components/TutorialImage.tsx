import { getImagePath, tutorialSteps, TutorialStepId } from "@/data/tutorialImages";
import { Image as ImageIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface TutorialImageProps {
  stepId: TutorialStepId;
  className?: string;
  showPlaceholder?: boolean;
}

export function TutorialImage({ stepId, className, showPlaceholder = true }: TutorialImageProps) {
  const step = tutorialSteps.find((s) => s.id === stepId);
  const imagePath = getImagePath(step?.fileName || "");

  return (
    <div className={cn("relative overflow-hidden rounded-xl border-2 border-dashed", className)}>
      <img
        src={imagePath}
        alt={step?.alt || "תמונת הדרכה"}
        className={cn(
          "w-full h-full object-contain",
          showPlaceholder && "opacity-0 absolute inset-0"
        )}
        onError={(e) => {
          if (showPlaceholder) {
            e.currentTarget.style.opacity = "0";
          }
        }}
        onLoad={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
      />
      {showPlaceholder && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30 p-6 text-center">
          <div className="mb-3 rounded-full bg-amber-100 p-4 text-amber-600">
            <ImageIcon className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {step?.title || "תמונת הדרכה"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            יש להעלות צילום מסך אמיתי לכאן
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            <Upload className="h-3 w-3" />
            <span>public/tutorial-images/{step?.fileName}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface TutorialStepProps {
  step: number;
  title: string;
  description: string;
  children?: React.ReactNode;
  highlight?: string;
}

export function TutorialStep({ step, title, description, children, highlight }: TutorialStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
          {step}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children && <div className="mr-12">{children}</div>}
      {highlight && (
        <div className="mr-12 rounded-lg border-2 border-primary/30 bg-primary/5 p-3">
          <p className="text-sm font-medium text-primary">
            <span className="font-bold">לחץ על:</span> {highlight}
          </p>
        </div>
      )}
    </div>
  );
}

export function TutorialPlaceholder({ height = 300 }: { height?: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50"
      style={{ minHeight: height }}
    >
      <div className="rounded-full bg-amber-100 p-4 text-amber-600">
        <ImageIcon className="h-8 w-8" />
      </div>
      <p className="mt-3 font-medium text-amber-700">יש להעלות צילום מסך אמיתי לכאן</p>
      <p className="mt-1 text-xs text-amber-600">העלה לתיקייה public/tutorial-images</p>
    </div>
  );
}
