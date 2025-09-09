import { useEffect, useState, useRef, type CSSProperties } from "react";
import SEO from "@/components/SEO";
import StyleSurvey from "@/components/StyleSurvey";
import LevelManager from "@/components/LevelManager";
import type { LearningStyle } from "@/types/learning";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Learn = () => {
  const [style, setStyle] = useState<LearningStyle | null>(null);
  const navigate = useNavigate();
  const [spotPos, setSpotPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { isAuthenticated, user, logout } = useAuth();
  interface Profile { username?: string; firstName?: string; lastName?: string; learningStyle?: string; cgpa?: number; numArrears?: number; email?: string }

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    // Check if user already has a learning style
    if (user?.learningStyle) {
      setStyle(user.learningStyle as LearningStyle);
    }
  }, [isAuthenticated, user, navigate]);

  // No subject fetching on learn page

  // No interests/recommendation flows for now

  const reset = () => setStyle(null);

  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/learn/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: Profile = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    if (isAuthenticated) fetchProfile();
  }, [isAuthenticated]);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSpotPos({ x, y });
  };

  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

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
            <Button variant="outline" size="lg" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <section
          ref={containerRef}
          onMouseMove={handleMouseMove}
    className="spotlight"
        style={((): CSSProperties => {
          const cssVars = { ['--spot-x']: `${spotPos.x}%`, ['--spot-y']: `${spotPos.y}%` } as unknown as CSSProperties;
          return cssVars;
        })()}
        >
          <div className="container grid gap-10 py-16 md:grid-cols-2 md:gap-12 md:py-24">
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold leading-tight md:text-6xl gradient-text">
                Welcome, {user?.firstName || 'Learner'}!
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
              {profile && (
                <div className="absolute right-6 top-6 card-surface p-3 rounded flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold">{(profile.firstName || profile.username || '').slice(0,1).toUpperCase()}</div>
                  <div>
                    <div className="font-semibold">{profile.firstName} {profile.lastName}</div>
                    <div className="text-sm text-muted-foreground">{profile.username}</div>
                    {profile.cgpa != null && <div className="text-sm">CGPA: {profile.cgpa}</div>}
                    {profile.numArrears != null && <div className="text-sm">Arrears: {profile.numArrears}</div>}
                  </div>
                </div>
              )}
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
              <StyleSurvey onComplete={(s) => { setStyle(s); }} />
            ) : (
              <>
                <LevelManager 
                  style={style} 
                />
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default Learn;
