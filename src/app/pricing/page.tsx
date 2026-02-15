"use client";

import { useState } from "react";
import { Check, Sparkles, Zap, Shield, Rocket, Smartphone, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const tiers = [
    {
        name: "Free",
        price: "₹0",
        description: "Perfect for students starting out",
        features: [
            "3 Lectures / month",
            "Basic AI Summaries",
            "Full Transcript View",
            "Standard Practice Quiz",
            "Community Access"
        ],
        buttonText: "Current Plan",
        highlight: false,
    },
    {
        name: "Pro",
        price: "₹299",
        description: "For students who want the academic edge",
        features: [
            "Unlimited Lectures",
            "Advanced AI Brain (Gemini Pro)",
            "Dynamic Practice Quizzes",
            "Export to PDF & Markdown",
            "Priority Processing",
            "Early Access to Features",
            "Advanced Analytics"
        ],
        buttonText: "Upgrade Now",
        highlight: true,
        qrPath: "/payments/pro-qr.png"
    },
    {
        name: "Pay As You Go",
        price: "₹10",
        description: "Only pay for what you actually use",
        features: [
            "₹10 per hour of audio",
            "No monthly commitment",
            "Same features as Pro",
            "Perfect for one-off seminars",
            "Buy credits anytime",
            "No expiry on credits"
        ],
        buttonText: "Buy Credits",
        highlight: false,
        qrPath: "/payments/otg-qr.png"
    }
];

export default function PricingPage() {
    const [selectedTier, setSelectedTier] = useState<typeof tiers[0] | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const handlePlanAction = (tier: typeof tiers[0]) => {
        if (tier.name === "Free") {
            window.location.href = "/dashboard/upload";
            return;
        }
        setSelectedTier(tier);
        setIsPaymentOpen(true);
    };

    return (
        <div className="min-h-screen bg-black text-white py-24 px-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -z-10" />

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4 uppercase tracking-widest">
                        <Sparkles className="h-3 w-3" />
                        Power Up Your Learning
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                        Simple, Fair <span className="text-indigo-500">Pricing</span>
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Focus on learning, not note-taking. Choose the plan that fits your semester goals.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {tiers.map((tier, index) => (
                        <Card
                            key={index}
                            className={`relative flex flex-col h-full bg-zinc-950/50 backdrop-blur-xl transition-all duration-500 hover:border-indigo-500/50 group ${tier.highlight
                                ? "border-indigo-500 shadow-2xl shadow-indigo-500/10"
                                : "border-zinc-800"
                                } animate-in fade-in slide-in-from-bottom-5 duration-700`}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {tier.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-[10px] font-black flex items-center gap-1 tracking-widest uppercase shadow-xl">
                                    <Sparkles className="h-3 w-3" />
                                    Popular
                                </div>
                            )}

                            <CardHeader className="pb-8 pt-10 text-center">
                                <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
                                    {tier.name}
                                </CardTitle>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-6xl font-black tracking-tighter text-white">
                                        {tier.price}
                                    </span>
                                    <span className="text-zinc-500 font-medium">
                                        {tier.name === "Pay As You Go" ? "/hr" : "/mo"}
                                    </span>
                                </div>
                                <CardDescription className="text-zinc-400 mt-4 text-sm">
                                    {tier.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1 px-8">
                                <div className="space-y-4">
                                    {tier.features.map((feature, fIndex) => (
                                        <div key={fIndex} className="flex items-center gap-3">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 shrink-0">
                                                <Check className="h-3 w-3 text-indigo-500" />
                                            </div>
                                            <span className="text-sm text-zinc-400 font-medium">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>

                            <CardFooter className="pt-8 pb-10 px-8">
                                <Button
                                    onClick={() => handlePlanAction(tier)}
                                    className={`w-full h-14 text-sm font-black uppercase tracking-widest rounded-xl transition-all ${tier.name === "Free"
                                        ? "bg-white text-black hover:bg-zinc-200"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20"
                                        }`}
                                >
                                    {tier.buttonText}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* FAQ / Trust Badges */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 text-center max-w-4xl mx-auto border-t border-zinc-900 pt-16">
                    <div className="group">
                        <div className="mb-6 mx-auto h-12 w-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 transition-colors group-hover:border-indigo-500/50">
                            <Zap className="h-6 w-6 text-indigo-500" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Lightning Fast</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">Transcripts generated in seconds using enterprise-grade Whisper AI models.</p>
                    </div>
                    <div className="group">
                        <div className="mb-6 mx-auto h-12 w-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 transition-colors group-hover:border-indigo-500/50">
                            <Shield className="h-6 w-6 text-indigo-500" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Secure & Private</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">Your lectures and notes are encrypted. Your data belongs to you alone.</p>
                    </div>
                    <div className="group">
                        <div className="mb-6 mx-auto h-12 w-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 transition-colors group-hover:border-indigo-500/50">
                            <Rocket className="h-6 w-6 text-indigo-500" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Study Harder</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">Auto-generated quizzes help you master technical concepts in half the time.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-24 pb-12 flex flex-col md:flex-row items-center justify-between border-t border-zinc-900 pt-12 gap-6">
                    <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span>NotesAI</span>
                    </div>
                    <div className="flex gap-8 text-sm text-zinc-500 font-medium">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/contact" className="hover:text-white transition-colors text-indigo-500 font-bold">Support</Link>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent className="sm:max-w-[450px] bg-zinc-950 border-zinc-800 text-white p-0 overflow-hidden">
                    <div className="p-8 pb-4">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-indigo-500" />
                                Scan to Pay
                            </DialogTitle>
                            <DialogDescription className="text-zinc-400 text-sm">
                                Complete your payment for the <span className="text-white font-bold">{selectedTier?.name}</span> plan.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-8 flex flex-col items-center">
                            <div className="relative group p-4 bg-white rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10">
                                {selectedTier?.qrPath && (
                                    <img
                                        src={selectedTier.qrPath}
                                        alt="UPI QR Code"
                                        className="h-64 w-64 object-contain"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = "https://placehold.co/400x400?text=Scan+to+Pay";
                                        }}
                                    />
                                )}
                                <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-3xl font-black text-white">{selectedTier?.price}</p>
                                <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">Single Payment</p>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
                                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-2">
                                    <MessageCircle className="h-3 w-3" />
                                    Next Steps
                                </h4>
                                <ol className="text-sm text-zinc-300 space-y-2 list-decimal list-inside">
                                    <li>Scan the QR code above with any UPI app.</li>
                                    <li>Complete the payment of <span className="text-white font-bold">{selectedTier?.price}</span>.</li>
                                    <li>Take a screenshot of the success page.</li>
                                    <li>Send the screenshot & your email to our support.</li>
                                </ol>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Button className="w-full bg-white text-black hover:bg-zinc-200 h-12 font-bold" onClick={() => window.open('mailto:anoteani@gmail.com')}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Email Support
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 p-6 border-t border-zinc-800">
                        <div className="flex items-center gap-3 text-zinc-400">
                            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                <Sparkles className="h-4 w-4 text-indigo-500" />
                            </div>
                            <p className="text-xs leading-relaxed">
                                <span className="text-white font-bold block mb-0.5">Approval within 24 hours</span>
                                Your credits or status will be activated immediately after our team verifies the payment.
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
