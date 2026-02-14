"use client";

import { Check, Sparkles, Zap, Shield, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const tiers = [
    {
        name: "Free",
        price: "₹0",
        description: "Perfect for trying out NotesAI",
        features: [
            "3 Lecture Processings/month",
            "Full Transcript & Summary",
            "Basic Practice Quizzes",
            "7 Days History",
            "Community Support"
        ],
        buttonText: "Current Plan",
        highlight: false,
    },
    {
        name: "Pro",
        price: "₹299",
        description: "Ultimate study companion for serious students",
        features: [
            "Unlimited Lecture Processings",
            "Advanced AI Brain (Gemini 2.0 Pro)",
            "Custom Practice Quizzes",
            "Unlimited History Storage",
            "Priority Support",
            "Export to PDF & Markdown",
            "Early Access to new features"
        ],
        buttonText: "Upgrade to Pro",
        highlight: true,
    }
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-zinc-900 dark:text-white">
                        Simple, Transparent <span className="text-indigo-600">Pricing</span>
                    </h1>
                    <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
                        Choose the plan that fits your study needs. Unlock the full power of AI for your education.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {tiers.map((tier, index) => (
                        <Card
                            key={index}
                            className={`relative flex flex-col h-full transition-all duration-300 hover:scale-105 ${tier.highlight
                                ? "border-2 border-indigo-500 shadow-2xl shadow-indigo-500/10 dark:bg-zinc-900"
                                : "border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/50"
                                } animate-fade-in-up`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {tier.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    MOST POPULAR
                                </div>
                            )}

                            <CardHeader className="pb-8">
                                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                                <CardDescription className="text-zinc-500">{tier.description}</CardDescription>
                                <div className="mt-6 flex items-baseline">
                                    <span className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">{tier.price}</span>
                                    <span className="ml-1 text-xl font-medium text-zinc-500">/month</span>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1">
                                <ul className="space-y-4">
                                    {tier.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-start gap-3">
                                            <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                                                <Check className="h-3 w-3 text-indigo-600" />
                                            </div>
                                            <span className="text-zinc-600 dark:text-zinc-400">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter className="pt-8">
                                <Button
                                    onClick={() => {
                                        if (tier.name === "Free") {
                                            window.location.href = "/dashboard/upload";
                                        } else {
                                            alert("Pro membership is launching soon! We are currently finalizing Indian payment gateway integration (Stripe/Razorpay). Stay tuned!");
                                        }
                                    }}
                                    className={`w-full h-12 text-lg font-bold transition-all ${tier.highlight
                                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                                        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                                        }`}
                                >
                                    {tier.buttonText}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center animate-fade-in">
                    <div className="flex flex-col items-center">
                        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                            <Zap className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-bold mb-2">Lightning Fast</h3>
                        <p className="text-sm text-zinc-500">Transcripts generated in seconds using Whisper AI.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="mb-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                            <Shield className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-bold mb-2">Secure Storage</h3>
                        <p className="text-sm text-zinc-500">Your data is encrypted and private to you.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="mb-4 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
                            <Rocket className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="font-bold mb-2">Academic Edge</h3>
                        <p className="text-sm text-zinc-500">Get ahead with AI-powered study questions.</p>
                    </div>
                </div>

                <div className="mt-20 text-center text-zinc-500 text-sm">
                    <p>Have questions? <Link href="/contact" className="text-indigo-600 hover:underline">Contact our support team</Link></p>
                </div>
            </div>
        </div>
    );
}
