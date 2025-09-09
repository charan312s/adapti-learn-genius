import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-learning.jpg";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { useState, useRef, type CSSProperties } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [spotPos, setSpotPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { isAuthenticated, logout } = useAuth();

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
        title="AI Personalized Learning | Adaptive Study System"
        description="An AI-powered system that adapts lessons and quizzes to your progress and learning style. Learn faster with tailored content."
        canonical={typeof window !== "undefined" ? window.location.origin : "/"}
        image={heroImage}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "AI Personalized Learning",
          applicationCategory: "EducationalApplication",
          operatingSystem: "Web",
          description:
            "An AI-powered system that adapts lessons and quizzes to your progress and learning style.",
        }}
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
            {isAuthenticated ? (
              <>
                <Link to="/learn">
                  <Button variant="outline" size="lg">Continue Learning</Button>
                </Link>
                <Button variant="outline" size="lg" onClick={logout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="outline" size="lg">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" size="lg">Get Started</Button>
                </Link>
              </>
            )}
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
                AI Personalized Learning
              </h1>
              <p className="mt-5 max-w-prose text-lg text-muted-foreground">
                A beautiful adaptive learning experience. We tailor lessons and quizzes to your progress and preferred learning style, helping you master topics faster.
              </p>
              <div className="mt-8 flex items-center gap-4">
                {isAuthenticated ? (
                  <Link to="/learn">
                    <Button variant="hero" size="xl">Continue Learning</Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/signup">
                      <Button variant="hero" size="xl">Get Started</Button>
                    </Link>
                    <Link to="/signin">
                      <Button variant="outline" size="lg">Sign In</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="Illustration of AI adapting learning content to a student dashboard"
                loading="lazy"
                className="w-full rounded-xl border shadow-lg"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;
