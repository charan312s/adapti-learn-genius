import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LearningLevel, LearningStyle } from "@/types/learning";
import { toast } from "sonner";

interface AdaptiveLessonProps {
  level: LearningLevel;
  style: LearningStyle;
  onComplete: (levelId: number, score: number, attempts: number) => void;
}

const AdaptiveLesson = ({ level, style, onComplete }: AdaptiveLessonProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<string>("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);

  const currentQuestion = level.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === level.questions.length - 1;

  const submit = () => {
    if (selected === null) return;
    
    setAttempts(attempts + 1);
    const correct = selected === currentQuestion.answerIndex;
    
    if (correct) {
      setScore(score + 1);
      setResult("Correct!");
      toast.success("Great job! That's correct.");
      setShowExplanation(true);
    } else {
      setResult("Not quite—try again.");
      toast.error("Not quite right. Try again!");
      setShowExplanation(false);
    }
  };

  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);

  // Parse backend hint into { hint, next }
  const parseHint = (raw: string) => {
    if (!raw) return { hint: '', next: '' };
    // Normalize separators
    const normalized = raw.replace(/\r/g, '\n');
    const sanitize = (s: string) => {
      if (!s) return '';
      // Remove all asterisks and common markdown emphasis markers
      let out = s.replace(/\*/g, '');
      // Remove surrounding quotes and excessive whitespace
      out = out.replace(/^\s*["'“”]+/, '').replace(/["'“”]+\s*$/, '');
      out = out.replace(/\s+/g, ' ').trim();
      return out;
    };
    // Look for common 'Next' separators
    const nextMarkers = [/Next step:\s*/i, /Next:\s*/i, /Next steps?:\s*/i, /Suggestion:\s*/i];
    for (const m of nextMarkers) {
      const idx = normalized.search(m);
      if (idx >= 0) {
        const before = normalized.slice(0, idx).trim();
        const after = normalized.slice(idx).replace(m, '').trim();
        // Use the first line of 'before' as hint and everything in 'after' as next
        return { hint: sanitize(before), next: sanitize(after) };
      }
    }

    // Fallback: split by double newlines
  const parts = normalized.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  return { hint: sanitize(parts[0] || ''), next: sanitize(parts[1] || '') };
  };

  const fetchHint = async () => {
    try {
      setLoadingHint(true);
      setHint(null);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ai/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : undefined },
        body: JSON.stringify({ prompt: currentQuestion.prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setHint(data.hint);
      } else {
        setHint('No hint available');
      }
    } catch (e) {
      setHint('Failed to fetch hint');
    } finally {
      setLoadingHint(false);
    }
  };

  const nextQuestion = () => {
    if (isLastQuestion) {
      // Level completed
      setLevelCompleted(true);
      onComplete(level.id, score + 1, attempts);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelected(null);
      setResult("");
      setShowExplanation(false);
    }
  };

  const retryQuestion = () => {
    setSelected(null);
    setResult("");
    setShowExplanation(false);
  };

  // Content by learning style
  const ReadingBlock = (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {/** show subject context when available */}
      {level && typeof (undefined) !== 'undefined' && null}
      
      {/** subjectName will be injected by parent if available via prop */}
      {/* placeholder - will render subjectName above specific sections when provided */}
      {level.id === 1 && (
        <>
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
        </>
      )}
      {level.id === 2 && (
        <>
          <p>
            Comparing fractions requires understanding their relative sizes. There are several methods:
          </p>
          <ul>
            <li><strong>Decimal conversion:</strong> Convert to decimals (1/4 = 0.25, 1/3 ≈ 0.33)</li>
            <li><strong>Cross multiplication:</strong> Compare a/b vs c/d by checking if a×d &gt; b×c</li>
            <li><strong>Common denominator:</strong> Find equivalent fractions with same denominator</li>
          </ul>
        </>
      )}
      {level.id === 3 && (
        <>
          <p>
            Adding fractions follows specific rules based on denominators:
          </p>
          <ul>
            <li><strong>Same denominators:</strong> Add numerators, keep denominator (1/4 + 2/4 = 3/4)</li>
            <li><strong>Different denominators:</strong> Find common denominator first</li>
            <li><strong>Mixed numbers:</strong> Convert to improper fractions, then add</li>
          </ul>
        </>
      )}
      {level.id === 4 && (
        <>
          <p>
            Advanced fraction operations combine multiple concepts:
          </p>
          <ul>
            <li><strong>Multiplication:</strong> Multiply numerators and denominators separately</li>
            <li><strong>Division:</strong> Multiply by the reciprocal (a/b ÷ c/d = a/b × d/c)</li>
            <li><strong>Complex expressions:</strong> Use order of operations (PEMDAS)</li>
          </ul>
        </>
      )}
    </div>
  );

  const VisualBlock = (
    <div className="grid gap-4">
  {/* Subject context shown above visual examples if provided */}
      {level.id === 1 && (
        <>
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
        </>
      )}
      {level.id === 2 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-blue-200 rounded-lg flex items-center justify-center text-lg font-bold">
                3/5
              </div>
              <p className="text-xs mt-2">Decimal: 0.6</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-green-200 rounded-lg flex items-center justify-center text-lg font-bold">
                2/3
              </div>
              <p className="text-xs mt-2">Decimal: 0.67</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Visual comparison shows 2/3 is larger than 3/5
          </p>
        </>
      )}
      {level.id === 3 && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-200 rounded flex items-center justify-center text-sm">
                1/4
              </div>
            </div>
            <div className="text-center flex items-center justify-center text-2xl">
              +
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-200 rounded flex items-center justify-center text-sm">
                1/4
              </div>
            </div>
          </div>
          <div className="text-center mt-2">
            <div className="w-20 h-16 mx-auto bg-green-200 rounded flex items-center justify-center text-sm font-bold">
              2/4 = 1/2
            </div>
          </div>
        </>
      )}
      {level.id === 4 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-purple-200 rounded-lg flex items-center justify-center text-sm">
                1/2 × 3/4
              </div>
              <p className="text-xs mt-2">Multiply numerators and denominators</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-orange-200 rounded-lg flex items-center justify-center text-sm">
                3/8
              </div>
              <p className="text-xs mt-2">Result</p>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const [n, setN] = useState(1);
  const [d, setD] = useState(4);
  const KinestheticBlock = (
    <div className="grid gap-3">
  {/* Kinesthetic examples may reference the subject if provided */}
      {level.id === 1 && (
        <>
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
        </>
      )}
      {level.id === 2 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm block mb-2">First Fraction</label>
              <div className="flex gap-2">
                <input type="number" min="1" max="10" className="w-16 px-2 py-1 border rounded" placeholder="num" />
                <span className="text-lg">/</span>
                <input type="number" min="1" max="10" className="w-16 px-2 py-1 border rounded" placeholder="den" />
              </div>
            </div>
            <div>
              <label className="text-sm block mb-2">Second Fraction</label>
              <div className="flex gap-2">
                <input type="number" min="1" max="10" className="w-16 px-2 py-1 border rounded" placeholder="num" />
                <span className="text-lg">/</span>
                <input type="number" min="1" max="10" className="w-16 px-2 py-1 border rounded" placeholder="den" />
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Adjust the fractions to see which is larger
          </p>
        </>
      )}
      {level.id === 3 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm block mb-2">First Fraction</label>
              <div className="flex gap-2">
                <input type="number" min="1" max="8" className="w-16 px-2 py-1 border rounded" placeholder="num" />
                <span className="text-lg">/</span>
                <input type="number" min="1" max="8" className="w-16 px-2 py-1 border rounded" placeholder="den" />
              </div>
            </div>
            <div>
              <label className="text-sm block mb-2">Second Fraction</label>
              <div className="flex gap-2">
                <input type="number" min="1" max="8" className="w-16 px-2 py-1 border rounded" placeholder="num" />
                <span className="text-lg">/</span>
                <input type="number" min="1" max="8" className="w-16 px-2 py-1 border rounded" placeholder="den" />
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Practice adding fractions with different denominators
          </p>
        </>
      )}
      {level.id === 4 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm block mb-2">First Fraction</label>
              <div className="flex gap-2">
                <input type="number" min="1" max="10" className="w-16 px-2 py-1 border rounded" placeholder="num" />
                <span className="text-lg">/</span>
                <input type="number" min="1" max="10" className="w-16 px-2 py-1 border rounded" placeholder="den" />
              </div>
            </div>
            <div>
              <label className="text-sm block mb-2">Operation</label>
              <select className="w-full px-2 py-1 border rounded">
                <option>×</option>
                <option>÷</option>
                <option>+</option>
                <option>-</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Practice different fraction operations
          </p>
        </>
      )}
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
      
      let text = "";
      if (level.id === 1) {
        text = "Fractions represent parts of a whole. One half means one out of two equal parts. Compare by converting to decimals or using cross multiplication.";
      } else if (level.id === 2) {
        text = "To compare fractions, convert them to decimals or find a common denominator. For example, 2/3 is larger than 3/5 because 0.67 is greater than 0.6.";
      } else if (level.id === 3) {
        text = "When adding fractions, first ensure they have the same denominator. Add the numerators and keep the denominator. Simplify the result if possible.";
      } else if (level.id === 4) {
        text = "For multiplication, multiply numerators and denominators separately. For division, multiply by the reciprocal of the second fraction.";
      }
      
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
      <p className="text-sm text-muted-foreground">
        {level.id === 1 && "Listen to fraction basics explained"}
        {level.id === 2 && "Hear fraction comparison methods"}
        {level.id === 3 && "Learn fraction addition rules"}
        {level.id === 4 && "Understand advanced operations"}
      </p>
    </div>
  );

  // Alternative content selection method
  let selectedContent;
  switch (style) {
    case 'visual':
      selectedContent = VisualBlock;
      break;
    case 'auditory':
      selectedContent = AuditoryBlock;
      break;
    case 'reading':
      selectedContent = ReadingBlock;
      break;
    case 'kinesthetic':
      selectedContent = KinestheticBlock;
      break;
    default:
      selectedContent = null;
  }

  // Fallback content if style is not found
  const fallbackContent = (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <p className="text-sm text-yellow-800">
        <strong>Debug:</strong> Learning style "{style}" not found. Available styles: visual, auditory, reading, kinesthetic
      </p>
      <p className="text-sm text-yellow-700 mt-2">
        Current content: {selectedContent ? 'Found' : 'Not found'}
      </p>
    </div>
  );

  if (levelCompleted) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <CardTitle>Level Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <p className="text-lg">Congratulations! You've completed this level.</p>
          <p className="text-muted-foreground">
            Score: {score}/{level.questions.length} | Attempts: {attempts}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="grid gap-6">
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span>{level.title}</span>
            {/** show subject name if passed */}
            {/** subjectName prop is available from parent */}
            {/** render below when provided */}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {level.questions.length}</span>
            <span>•</span>
            <span>Score: {score}/{level.questions.length}</span>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* subject context removed */}
          {selectedContent || fallbackContent}
        </CardContent>
      </Card>

      <Card className="card-surface">
        <CardHeader>
          <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="font-medium text-lg">{currentQuestion.prompt}</p>
          
          <div className="grid gap-2 sm:grid-cols-2">
            {currentQuestion.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`rounded-md border px-4 py-3 text-left transition ${
                  selected === i ? "bg-accent border-primary" : "hover:bg-accent/60"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {result && (
            <div className={`p-4 rounded-lg ${
              result === "Correct!" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}>
              <p className={`font-medium ${
                result === "Correct!" ? "text-green-800" : "text-red-800"
              }`}>
                {result}
              </p>
              {showExplanation && (
                <p className="text-sm text-green-700 mt-2">
                  {currentQuestion.explanation}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            {!result ? (
              <Button onClick={submit} disabled={selected === null}>
                Submit Answer
              </Button>
            ) : result === "Correct!" ? (
              <Button onClick={nextQuestion}>
                {isLastQuestion ? "Complete Level" : "Next Question"}
              </Button>
            ) : (
              <Button onClick={retryQuestion} variant="outline">
                Try Again
              </Button>
            )}
            <div className="ml-auto text-right flex flex-col items-end gap-2">
              <Button
                onClick={fetchHint}
                disabled={loadingHint}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-pink-500 hover:from-indigo-700 hover:to-pink-600 text-white shadow-lg"
              >
                <span className="text-xl">🤖</span>
                <span className="font-semibold">{loadingHint ? 'Thinking...' : 'AI Hint'}</span>
              </Button>

              {hint && (
                (() => {
                  const parts = parseHint(hint);
                  return (
                    <div className="mt-2 w-full max-w-md bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-xl p-4 animate-fade-in">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-pink-50 text-xs font-medium text-indigo-700 dark:text-indigo-200">
                            <span className="text-sm">🤖</span>
                            <span>AI Hint</span>
                          </div>
                          <h4 className="mt-3 text-sm font-semibold">Hint</h4>
                        </div>
                        <button onClick={() => setHint(null)} className="text-sm text-muted-foreground hover:text-foreground">✕</button>
                      </div>

                      <div className="mt-2 text-sm text-foreground">
                        <p className="leading-relaxed">{parts.hint}</p>
                        {parts.next && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-800 border rounded">
                            <div className="text-xs font-semibold text-muted-foreground">Next step</div>
                            <div className="mt-1 text-sm">{parts.next}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default AdaptiveLesson;
