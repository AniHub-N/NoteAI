import { useState } from "react";
import { QuizQuestion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuizViewProps {
    questions: QuizQuestion[];
}

export function QuizView({ questions }: QuizViewProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / questions.length) * 100;

    const handleSubmit = () => {
        if (selectedAnswer === null) return;

        setIsSubmitted(true);
        if (selectedAnswer === currentQuestion.correctAnswer) {
            setScore(score + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsSubmitted(false);
        } else {
            setShowResults(true);
        }
    };

    const handleRetake = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsSubmitted(false);
        setScore(0);
        setShowResults(false);
    };

    if (showResults) {
        return (
            <Card className="w-full max-w-2xl mx-auto mt-10">
                <CardHeader>
                    <CardTitle>Quiz Complete!</CardTitle>
                    <CardDescription>Here is how you did.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-10">
                    <div className="text-6xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">
                        {Math.round((score / questions.length) * 100)}%
                    </div>
                    <p className="text-xl">
                        You got {score} out of {questions.length} correct.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button onClick={handleRetake}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Retake Quiz
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-6 space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-zinc-500">
                    <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                    <span>{Math.round(progress)}% completed</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                            }`}>
                            {currentQuestion.difficulty}
                        </span>
                    </div>
                    <CardTitle className="text-xl leading-snug">{currentQuestion.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <RadioGroup
                        value={selectedAnswer?.toString()}
                        onValueChange={(val) => !isSubmitted && setSelectedAnswer(parseInt(val))}
                    >
                        {currentQuestion.options.map((option, index) => {
                            let className = "flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors";

                            if (isSubmitted) {
                                if (index === currentQuestion.correctAnswer) {
                                    className += " bg-green-50 border-green-500 dark:bg-green-900/20";
                                } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
                                    className += " bg-red-50 border-red-500 dark:bg-red-900/20";
                                }
                            } else if (selectedAnswer === index) {
                                className += " border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/10";
                            }

                            return (
                                <div key={index} className={className} onClick={() => !isSubmitted && setSelectedAnswer(index)}>
                                    <RadioGroupItem value={index.toString()} id={`option-${index}`} className="sr-only" />
                                    <div className="flex-1">
                                        <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                                        {option}
                                    </div>
                                    {isSubmitted && index === currentQuestion.correctAnswer && (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    )}
                                    {isSubmitted && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                    )}
                                </div>
                            );
                        })}
                    </RadioGroup>

                    {isSubmitted && (
                        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800 animate-in fade-in slide-in-from-top-2">
                            <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center">
                                <Lightbulb className="h-4 w-4 mr-2" /> Explanation
                            </h4>
                            <p className="text-sm text-indigo-800 dark:text-indigo-200">
                                {currentQuestion.explanation}
                            </p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end pt-0">
                    {!isSubmitted ? (
                        <Button onClick={handleSubmit} disabled={selectedAnswer === null}>
                            Check Answer
                        </Button>
                    ) : (
                        <Button onClick={handleNext}>
                            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}

import { Lightbulb } from "lucide-react";
