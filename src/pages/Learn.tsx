import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import StyleSurvey from "@/components/StyleSurvey";
import LevelManager from "@/components/LevelManager";
import type { LearningStyle } from "@/types/learning";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Learn = () => {
  const [style, setStyle] = useState<LearningStyle | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("learningStyle") as LearningStyle | null;
    if (saved) setStyle(saved);
  }, []);

  const reset = () => setStyle(null);

  const handleGoHome = () => {
    
    navigate("/");
  };

  return (
    <>
      <SEO
        title="Learn | AI Personalized Learning"
        description="Take a quick style survey and start an adaptive lesson tailored to how you learn best."
        canonical={typeof window !== "undefined" ? `${window.location.origin}/learn` : "/learn"}
      />
      <main className="container py-12">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your adaptive learning journey</h1>
          {style && (
            <Button variant="outline" onClick={reset}>
              Change learning style
            </Button>
          )}
        </header>

        <section className="grid gap-8">
          {!style ? (
            <StyleSurvey onComplete={(s) => setStyle(s)} />
          ) : (
            <LevelManager 
              style={style} 
              onGoHome={handleGoHome}
            />
          )}
        </section>
      </main>
    </>
  );
};

export default Learn;
