import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LearningStyle } from "@/types/learning";
import { toast } from "sonner";

interface AdaptiveLessonProps {
  style: LearningStyle;
}

type Question = {
  prompt: string;
  options: string[];
  answerIndex: number;
};

type Difficulty = 1 | 2 | 3;

const QUESTIONS: Record<Difficulty, Question> = {
  1: {
    prompt: "What is 1/2 of 8?",
    options: ["2", "3", "4", "6"],
    answerIndex: 2,
  },
  2: {
    prompt: "Which fraction is larger?",
    options: ["3/5", "2/3"],
    answerIndex: 1, // 2/3 ~ 0.666 > 3/5 = 0.6
  },
  3: {
    prompt: "What is 3/4 + 2/8?",
    options: ["5/8", "1", "7/8"],
    answerIndex: 1,
  },
};

function getInitialDifficulty(): Difficulty {
  const saved = Number(localStorage.getItem("difficulty") || 1);
  return (Math.min(3, Math.max(1, saved)) as Difficulty) || 1;
}

const AdaptiveLesson = ({ style }: AdaptiveLessonProps) => {
  const [difficulty, setDifficulty] = useState<Difficulty>(getInitialDifficulty());
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<string>("");
  const streakRef = useRef(0);

  useEffect(() => {
    localStorage.setItem("difficulty", String(difficulty));
  }, [difficulty]);

  const question = useMemo(() => QUESTIONS[difficulty], [difficulty]);

  const submit = () => {
    if (selected === null) return;
    const correct = selected === question.answerIndex;
    setResult(correct ? "Correct!" : "Not quite—try again.");
    if (correct) {
      toast.success("Nice work! Difficulty adjusted.");
      streakRef.current += 1;
      if (streakRef.current >= 2 && difficulty < 3) {
        setDifficulty((d) => ((d + 1) as Difficulty));
        streakRef.current = 0;
      }
    } else {
      toast.error("We'll make it a bit easier for now.");
      streakRef.current = 0;
      if (difficulty > 1) setDifficulty((d) => ((d - 1) as Difficulty));
    }
  };

  // Content by learning style
  const ReadingBlock = (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <p>
        Fractions represent a part of a whole. For example, 1/2 means one of two
        equal parts. To compare fractions like 2/3 and 3/5, bring them to a
        common baseline by comparing decimal values (≈0.67 vs 0.6) or by
        cross-multiplying (2×5 vs 3×3).
      </p>
      <ul>
        <li>Add with common denominators: 2/8 + 3/8 = 5/8.</li>
        <li>Convert when needed: 2/8 + 1/4 → 2/8 + 2/8 = 4/8 = 1/2.</li>
      </ul>
    </div>
  );

  const VisualBlock = (
    <div className="grid gap-4">
      <svg viewBox="0 0 100 100" className="w-full max-w-xs">
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0%" stopColor={`hsl(var(--primary))`} />
            <stop offset="100%" stopColor={`hsl(var(--primary-glow))`} />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="#eee" />
        <path d="M50,50 L50,5 A45,45 0 0,1 95,50 Z" fill="url(#g)" />
        <text x="50" y="55" textAnchor="middle" fontSize="12" fill="currentColor">
          1/4 shaded
        </text>
      </svg>
      <p className="text-sm text-muted-foreground max-w-prose">
        Visualizing parts of a whole helps build intuition. Here, a quarter of
        the circle is shaded.
      </p>
    </div>
  );

  const [n, setN] = useState(1);
  const [d, setD] = useState(4);
  const KinestheticBlock = (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        <label className="text-sm">Numerator</label>
        <input type="range" min={0} max={d} value={n} onChange={(e) => setN(Number(e.target.value))} />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm">Denominator</label>
        <input
          type="range"
          min={1}
          max={12}
          value={d}
          onChange={(e) => {
            const nd = Number(e.target.value);
            setD(nd);
            if (n > nd) setN(nd);
          }}
        />
      </div>
      <div className="rounded-lg border p-3 text-sm">
        Fraction: {n}/{d} ≈ {(n / d).toFixed(2)}
      </div>
    </div>
  );

  const [speaking, setSpeaking] = useState(false);
  const speechUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const playNarration = () => {
    try {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }
      const text =
        "Fractions represent parts of a whole. One half means one out of two equal parts. Compare by converting to decimals or using cross multiplication.";
      const u = new SpeechSynthesisUtterance(text);
      speechUtterance.current = u;
      u.onend = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    } catch {
      toast.error("Narration is not supported in this browser.");
    }
  };

  const AuditoryBlock = (
    <div className="grid gap-3">
      <Button onClick={playNarration} variant="secondary">
        {speaking ? "Stop narration" : "Play narration"}
      </Button>
      <p className="text-sm text-muted-foreground">Use headphones for best focus.</p>
    </div>
  );

  const content = {
    visual: VisualBlock,
    auditory: AuditoryBlock,
    reading: ReadingBlock,
    kinesthetic: KinestheticBlock,
  }[style];

  return (
    <section className="grid gap-6">
      <Card className="card-surface">
        <CardHeader>
          <CardTitle>Fractions basics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          {content}
        </CardContent>
      </Card>

      <Card className="card-surface">
        <CardHeader>
          <CardTitle>Quick check (Level {difficulty})</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="font-medium">{question.prompt}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`rounded-md border px-4 py-2 text-left transition ${
                  selected === i ? "bg-accent" : "hover:bg-accent/60"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={submit}>Submit</Button>
            {result && <span className="text-sm text-muted-foreground">{result}</span>}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default AdaptiveLesson;
