"use client";

import { Sparkles, FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white py-24 px-6 relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -z-10" />

            <div className="max-w-3xl mx-auto">
                <Link href="/">
                    <Button variant="ghost" className="mb-8 text-zinc-400 hover:text-white -ml-4">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>
                </Link>

                <div className="flex items-center gap-2 font-black text-2xl tracking-tighter mb-8">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                        <FileText className="h-5 w-5 text-white" />
                    </div>
                    <span>Terms of Service</span>
                </div>

                <div className="prose prose-invert max-w-none space-y-8 text-zinc-400">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using NotesAI, you agree to be bound by these Terms of Service.
                            If you do not agree to all of these terms, do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                        <p>
                            NotesAI provides AI-powered audio transcription, summarization, and quiz generation tools for educational purposes.
                            We offer both free and paid (Pro/OTG) tiers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. User Conduct</h2>
                        <p>
                            You agree not to use the service for any illegal purposes or to upload content that violates
                            intellectual property rights. You are responsible for all activity that occurs under your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Payment and Refunds</h2>
                        <p>
                            Paid plans (Pro and OTG) are managed via manual UPI payments as described on our Pricing page.
                            Activation occurs within 24 hours of verification. Refunds are handled on a case-by-cease basis via support.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
                        <p>
                            NotesAI provides tools to assist with learning. While we strive for high accuracy, AI-generated content
                            may occasionally contain errors. We are not responsible for academic performance or data loss.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Contact</h2>
                        <p>
                            Questions about the Terms of Service should be sent to:
                            <br />
                            <a href="mailto:anoteani@gmail.com" className="text-indigo-500 font-bold hover:underline">anoteani@gmail.com</a>
                        </p>
                    </section>

                    <div className="pt-12 border-t border-zinc-900 text-sm">
                        Last Updated: February 15, 2026
                    </div>
                </div>
            </div>
        </div>
    );
}
