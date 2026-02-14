"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Users, Gift, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ReferralPage() {
    const [copied, setCopied] = useState(false);
    const referralCode = "NOTES-AI-ABC123";
    const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/signup?ref=${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black animate-fade-in">
            <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/50 backdrop-blur-xl px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Referral Program</h1>
                    </div>
                </div>
            </header>

            <main className="container max-w-4xl mx-auto py-10 px-4">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                        <Gift className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Earn Free Credits</h2>
                    <p className="text-zinc-500">Invite friends and get 1 month free for each signup!</p>
                </div>

                <div className="grid gap-6 mb-8">
                    <Card className="hover-lift">
                        <CardHeader>
                            <CardTitle>Your Referral Link</CardTitle>
                            <CardDescription>Share this link with friends to earn rewards</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="referral-link" className="sr-only">Referral Link</Label>
                                    <Input
                                        id="referral-link"
                                        value={referralLink}
                                        readOnly
                                        className="h-10"
                                    />
                                </div>
                                <Button onClick={handleCopy} className="bg-indigo-600 hover:bg-indigo-700">
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center mb-3">
                                        <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="font-semibold mb-1">Total Referrals</h3>
                                    <p className="text-3xl font-bold text-indigo-600">12</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-3">
                                        <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="font-semibold mb-1">Credits Earned</h3>
                                    <p className="text-3xl font-bold text-green-600">$36</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-3">
                                        <Gift className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="font-semibold mb-1">Free Months</h3>
                                    <p className="text-3xl font-bold text-purple-600">3</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>How It Works</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-3">
                                <li className="flex gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-semibold">1</span>
                                    <span>Share your unique referral link with friends</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-semibold">2</span>
                                    <span>They sign up and start using NotesAI</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-semibold">3</span>
                                    <span>You both get 1 month free when they upgrade to Pro!</span>
                                </li>
                            </ol>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
