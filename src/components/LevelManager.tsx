import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Lock, Play, Trophy } from "lucide-react";
import type { LearningLevel, LevelProgress, LearningStyle } from "@/types/learning";
import { toast } from "sonner";
import AdaptiveLesson from "./AdaptiveLesson";

interface LevelManagerProps {
  style: LearningStyle;
}

// Define the learning levels
const LEARNING_LEVELS: LearningLevel[] = [
  {
    id: 1,
    title: "Fractions Basics",
    description: "Learn the fundamentals of fractions",
    difficulty: 1,
    requiredScore: 2,
    unlocked: true,
    questions: [
      {
        prompt: "What is 1/2 of 8?",
        options: ["2", "3", "4", "6"],
        answerIndex: 2,
        explanation: "1/2 of 8 means dividing 8 by 2, which equals 4."
      },
      {
        prompt: "Which fraction represents half?",
        options: ["1/3", "1/2", "2/3", "3/4"],
        answerIndex: 1,
        explanation: "1/2 represents one out of two equal parts, which is half."
      }
    ],
    content: {
      visual: "Visual representation of fractions using circles and rectangles",
      auditory: "Audio explanation of fraction concepts",
      reading: "Text-based explanation of fraction fundamentals",
      kinesthetic: "Interactive fraction manipulatives"
    }
  },
  {
    id: 2,
    title: "Comparing Fractions",
    description: "Learn to compare different fractions",
    difficulty: 2,
    requiredScore: 3,
    unlocked: false,
    questions: [
      {
        prompt: "Which fraction is larger: 3/5 or 2/3?",
        options: ["3/5", "2/3", "They are equal", "Cannot compare"],
        answerIndex: 1,
        explanation: "2/3 ≈ 0.667 while 3/5 = 0.6, so 2/3 is larger."
      },
      {
        prompt: "Which fraction is smaller: 1/4 or 1/3?",
        options: ["1/4", "1/3", "They are equal", "Cannot compare"],
        answerIndex: 0,
        explanation: "1/4 = 0.25 while 1/3 ≈ 0.333, so 1/4 is smaller."
      },
      {
        prompt: "What is 1/2 compared to 2/4?",
        options: ["1/2 is larger", "2/4 is larger", "They are equal", "Cannot compare"],
        answerIndex: 2,
        explanation: "1/2 and 2/4 are equivalent fractions (both equal 0.5)."
      }
    ],
    content: {
      visual: "Visual comparison of fractions using number lines and diagrams",
      auditory: "Audio comparison of fraction values",
      reading: "Text explanation of fraction comparison methods",
      kinesthetic: "Interactive fraction comparison tools"
    }
  },
  {
    id: 3,
    title: "Adding Fractions",
    description: "Learn to add fractions with common denominators",
    difficulty: 3,
    requiredScore: 3,
    unlocked: false,
    questions: [
      {
        prompt: "What is 1/4 + 1/4?",
        options: ["1/8", "1/2", "2/4", "2/8"],
        answerIndex: 1,
        explanation: "1/4 + 1/4 = 2/4 = 1/2 (simplified)."
      },
      {
        prompt: "What is 2/8 + 3/8?",
        options: ["5/16", "5/8", "6/8", "1/2"],
        answerIndex: 1,
        explanation: "2/8 + 3/8 = 5/8 (keep the denominator, add numerators)."
      },
      {
        prompt: "What is 1/3 + 1/6?",
        options: ["2/9", "1/2", "2/6", "3/6"],
        answerIndex: 1,
        explanation: "1/3 = 2/6, so 2/6 + 1/6 = 3/6 = 1/2."
      }
    ],
    content: {
      visual: "Visual representation of fraction addition using diagrams",
      auditory: "Audio explanation of fraction addition steps",
      reading: "Step-by-step text guide for adding fractions",
      kinesthetic: "Interactive fraction addition manipulatives"
    }
  },
  {
    id: 4,
    title: "Advanced Fractions",
    description: "Master complex fraction operations",
    difficulty: 4,
    requiredScore: 4,
    unlocked: false,
    questions: [
      {
        prompt: "What is 3/4 + 2/8?",
        options: ["5/8", "1", "7/8", "6/8"],
        answerIndex: 1,
        explanation: "2/8 = 1/4, so 3/4 + 1/4 = 4/4 = 1."
      },
      {
        prompt: "What is 2/3 - 1/6?",
        options: ["1/3", "1/2", "3/6", "1/6"],
        answerIndex: 1,
        explanation: "2/3 = 4/6, so 4/6 - 1/6 = 3/6 = 1/2."
      },
      {
        prompt: "What is 1/2 × 3/4?",
        options: ["3/8", "4/6", "3/6", "1/2"],
        answerIndex: 0,
        explanation: "Multiply numerators: 1×3=3, multiply denominators: 2×4=8, so 3/8."
      },
      {
        prompt: "What is 3/4 ÷ 1/2?",
        options: ["3/8", "1.5", "6/4", "3/2"],
        answerIndex: 1,
        explanation: "3/4 ÷ 1/2 = 3/4 × 2/1 = 6/4 = 1.5."
      }
    ],
    content: {
      visual: "Advanced visual representations of fraction operations",
      auditory: "Comprehensive audio explanation of complex operations",
      reading: "Detailed text guide for advanced fraction concepts",
      kinesthetic: "Advanced interactive fraction tools"
    }
  }
];

const LevelManager = ({ style }: LevelManagerProps) => {
  const [levels, setLevels] = useState<LearningLevel[]>(LEARNING_LEVELS);
  const [progress, setProgress] = useState<LevelProgress[]>([]);
  const [currentLevel, setCurrentLevel] = useState<LearningLevel | null>(null);

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem("levelProgress");
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      // Convert ISO strings back to Date objects
      const progressWithDates = parsed.map((p: any) => ({
        ...p,
        completedAt: p.completedAt ? new Date(p.completedAt) : undefined
      }));
      setProgress(progressWithDates);
    }
  }, []);

  useEffect(() => {
    // Save progress to localStorage
    const progressToSave = progress.map(p => ({
      ...p,
      completedAt: p.completedAt ? p.completedAt.toISOString() : undefined
    }));
    localStorage.setItem("levelProgress", JSON.stringify(progressToSave));
    
    // Update level unlock status based on progress
    setLevels(prevLevels => 
      prevLevels.map(level => {
        if (level.id === 1) return { ...level, unlocked: true };
        
        const previousLevel = progress.find(p => p.levelId === level.id - 1);
        const isUnlocked = previousLevel?.completed || false;
        
        return { ...level, unlocked: isUnlocked };
      })
    );
  }, [progress]);

  const handleLevelSelect = (level: LearningLevel) => {
    setCurrentLevel(level);
  };

  const handleLevelComplete = (levelId: number, score: number, attempts: number) => {
    const newProgress: LevelProgress = {
      levelId,
      completed: score >= levels.find(l => l.id === levelId)?.requiredScore!,
      score,
      attempts,
      completedAt: new Date()
    };

    setProgress(prev => {
      const existing = prev.find(p => p.levelId === levelId);
      if (existing) {
        return prev.map(p => p.levelId === levelId ? newProgress : p);
      } else {
        return [...prev, newProgress];
      }
    });

    toast.success(`Level ${levelId} completed! Score: ${score}/${levels.find(l => l.id === levelId)?.questions.length}`);
    
    // Return to level selection
    setCurrentLevel(null);
  };

  const getLevelProgress = (levelId: number) => {
    return progress.find(p => p.levelId === levelId);
  };

  const getOverallProgress = () => {
    const completed = progress.filter(p => p.completed).length;
    return (completed / levels.length) * 100;
  };

  if (currentLevel) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setCurrentLevel(null)}>
            ← Back to Levels
          </Button>
        </div>
        
        {/* Learning Style Display in Level View */}
        <Card className="card-surface">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Learning Style</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge variant="default" className="capitalize">
                {style}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Content is tailored to your {style} learning preferences
              </p>
            </div>
          </CardContent>
        </Card>
        
        <AdaptiveLesson 
          level={currentLevel} 
          style={style} 
          onComplete={handleLevelComplete}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Learning Levels</h2>
          <p className="text-muted-foreground">Complete levels to unlock new challenges</p>
        </div>
      </div>

      {/* Learning Style Display */}
      <Card className="card-surface">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your Learning Style</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant="default" className="capitalize">
              {style}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Content is tailored to your {style} learning preferences
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {progress.filter(p => p.completed).length}/{levels.length} levels completed
              </span>
            </div>
            <Progress value={getOverallProgress()} className="h-2" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {levels.map((level) => {
          const levelProgress = getLevelProgress(level.id);
          const isCompleted = levelProgress?.completed;
          
          return (
            <Card 
              key={level.id} 
              className={`transition-all hover:shadow-md ${
                !level.unlocked ? 'opacity-60' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{level.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : !level.unlocked ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Play className="h-5 w-5 text-primary" />
                    )}
                    <Badge variant={level.difficulty === 1 ? "secondary" : level.difficulty === 2 ? "default" : "destructive"}>
                      Level {level.difficulty}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{level.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {levelProgress && (
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>Best Score:</span>
                        <span className="font-medium">
                          {levelProgress.score}/{level.questions.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Attempts:</span>
                        <span className="font-medium">{levelProgress.attempts}</span>
                      </div>
                      {levelProgress.completedAt && (
                        <div className="text-xs text-muted-foreground">
                          Completed: {new Date(levelProgress.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button
                    onClick={() => handleLevelSelect(level)}
                    disabled={!level.unlocked}
                    className="w-full"
                    variant={isCompleted ? "outline" : "default"}
                  >
                    {isCompleted ? (
                      <>
                        <Trophy className="h-4 w-4 mr-2" />
                        Replay Level
                      </>
                    ) : !level.unlocked ? (
                      "Locked"
                    ) : (
                      "Start Level"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LevelManager;
