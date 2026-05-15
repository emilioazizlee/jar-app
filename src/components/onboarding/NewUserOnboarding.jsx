import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles } from 'lucide-react';

export default function NewUserOnboarding({ onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedPack, setSelectedPack] = useState(null);

  // Check if onboarding already completed
  useEffect(() => {
    const completed = localStorage.getItem('jar_onboarding_completed');
    if (completed === 'true') {
      onComplete?.();
    }
  }, [onComplete]);

  const handleComplete = () => {
    // Save completion flag to localStorage
    localStorage.setItem('jar_onboarding_completed', 'true');
    
    // Call completion callback
    if (onComplete) {
      onComplete();
    } else {
      // Navigate to dashboard
      navigate('/');
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const starterPacks = [
    {
      id: 'basic',
      name: 'Basic Tracking',
      description: 'Simple expense and task tracking',
      icon: '📊',
    },
    {
      id: 'lifestyle',
      name: 'Full Lifestyle',
      description: 'Track everything: money, health, tasks, diet',
      icon: '🌟',
    },
    {
      id: 'minimal',
      name: 'Minimalist',
      description: 'Just the essentials, nothing extra',
      icon: '✨',
    },
  ];

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`h-1 flex-1 rounded-full transition-all ${
                num <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <Sparkles className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h1 className="text-4xl font-bold mb-4">Welcome to JAR</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Fill your life.
              </p>
              <p className="text-muted-foreground mb-8">
                JAR helps you track everything that matters: expenses, tasks, diet, and more.
                Let's get you set up in 3 quick steps.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  Skip Setup
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Pick Starter Pack */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-3xl font-bold mb-2">Choose Your Style</h2>
              <p className="text-muted-foreground mb-8">
                We'll set up your dashboard based on what you want to track.
              </p>

              <div className="grid gap-4 mb-8">
                {starterPacks.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => setSelectedPack(pack.id)}
                    className={`text-left p-6 rounded-lg border transition-all ${
                      selectedPack === pack.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{pack.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{pack.name}</h3>
                          {selectedPack === pack.id && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {pack.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedPack}
                  className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Ready */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">You're All Set!</h2>
              <p className="text-muted-foreground mb-8">
                Your dashboard is ready. Start tracking what matters.
              </p>
              <button
                onClick={handleComplete}
                className="px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicator */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          Step {step} of 3
        </div>
      </div>
    </div>
  );
}
