import { useEffect, useState, useRef, type CSSProperties } from "react";
import SEO from "@/components/SEO";
import StyleSurvey from "@/components/StyleSurvey";
import LevelManager from "@/components/LevelManager";
import type { LearningStyle } from "@/types/learning";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const Learn = () => {
  const [style, setStyle] = useState<LearningStyle | null>(null);
  const navigate = useNavigate();
  const [spotPos, setSpotPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("learningStyle") as LearningStyle | null;
    if (saved) setStyle(saved);
  }, []);

  const reset = () => setStyle(null);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSpotPos({ x, y });
  };

  return (
    <>
      <SEO
        title="Learn | AI Personalized Learning"
        description="Take a quick style survey and start an adaptive lesson tailored to how you learn best."
        canonical={typeof window !== "undefined" ? `${window.location.origin}/learn` : "/learn"}
      />
      
      <header className="w-full">
        <nav className="container flex items-center justify-between py-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold gradient-text">Personal</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="hero" size="lg" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="spotlight"
          style={{
            ...(null as unknown as React.CSSProperties),
            ["--spot-x" as any]: `${spotPos.x}%`,
            ["--spot-y" as any]: `${spotPos.y}%`,
          }}
        >
          <div className="container grid gap-10 py-16 md:grid-cols-2 md:gap-12 md:py-24">
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold leading-tight md:text-6xl gradient-text">
                Your Adaptive Learning Journey
              </h1>
              <p className="mt-5 max-w-prose text-lg text-muted-foreground">
                Take a quick style survey and start an adaptive lesson tailored to how you learn best. We'll personalize your experience to help you master topics faster.
              </p>
              {style && (
                <div className="mt-8">
                  <Button variant="outline" size="lg" onClick={reset}>
                    Change learning style
                  </Button>
                </div>
              )}
            </div>
            <div className="relative">
              <div className="card-surface rounded-xl p-8 h-full flex items-center justify-center">
                {!style ? (
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold mb-2">Discover Your Style</h3>
                    <p className="text-muted-foreground">Take our quick survey to get started</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-xl font-semibold mb-2">Ready to Learn</h3>
                    <p className="text-muted-foreground">Your personalized lesson awaits</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="container py-12">
          <div className="grid gap-8">
            {!style ? (
              <StyleSurvey onComplete={(s) => setStyle(s)} />
            ) : (
              <LevelManager 
                style={style} 
              />
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default Learn;
