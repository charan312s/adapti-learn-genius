import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { LearningStyle } from "@/types/learning";

interface StyleSurveyProps {
  onComplete: (style: LearningStyle) => void;
}

const options: { value: LearningStyle; label: string; helper: string }[] = [
  { value: "visual", label: "Visual", helper: "Diagrams, charts, and images" },
  { value: "auditory", label: "Auditory", helper: "Listen to explanations" },
  { value: "reading", label: "Reading/Writing", helper: "Detailed text and notes" },
  { value: "kinesthetic", label: "Kinesthetic", helper: "Hands-on, interactive demos" },
];

const StyleSurvey = ({ onComplete }: StyleSurveyProps) => {
  const [value, setValue] = useState<LearningStyle | "">("");
  // Only capture learning style for now

  const handleSubmit = () => {
    if (!value) return;
    localStorage.setItem("learningStyle", value);
    toast.success("Learning style saved. Your lessons will adapt automatically.");
    onComplete(value as LearningStyle);
  };

  return (
    <section className="card-surface rounded-xl p-6">
      <h2 className="text-2xl font-semibold">Your learning style</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose the option that best fits how you prefer to learn.
      </p>
      <RadioGroup value={value} onValueChange={(v) => setValue(v as LearningStyle)} className="mt-5 grid gap-4">
        {options.map((opt) => (
          <div key={opt.value} className="flex items-start gap-3 rounded-lg border p-4 hover:bg-accent/50 transition">
            <RadioGroupItem value={opt.value} id={opt.value} />
            <div className="grid gap-1">
              <Label htmlFor={opt.value} className="cursor-pointer font-medium">
                {opt.label}
              </Label>
              <p className="text-sm text-muted-foreground">{opt.helper}</p>
            </div>
          </div>
        ))}
      </RadioGroup>
      <div className="mt-6">
        <Button onClick={handleSubmit} disabled={!value} variant="hero">
          Save and continue
        </Button>
      </div>
    </section>
  );
};

export default StyleSurvey;
