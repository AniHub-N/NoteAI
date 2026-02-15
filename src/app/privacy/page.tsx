"use client";

import { Sparkles, Shield, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white py-24 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -z-10" />

            <div className="max-w-3xl mx-auto">
                <Link href="/">
                    <Button variant="ghost" className="mb-8 text-zinc-400 hover:text-white -ml-4">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>
                </Link>

                <div className="flex items-center gap-2 font-black text-2xl tracking-tighter mb-8">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <span>Privacy Policy</span>
                </div>

                <div className="prose prose-invert max-w-none space-y-8 text-zinc-400">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                        <p>
                            Welcome to NotesAI. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you how we handle your data when you visit our website
                            and use our AI-powered lecture note services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Data We Collect</h2>
                        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Identity Data:</strong> Includes first name, last name, and username provided via our authentication partner (Clerk).</li>
                            <li><strong>Contact Data:</strong> Includes email address.</li>
                            <li><strong>Audio/Video Data:</strong> The lecture files you upload or record for transcription.</li>
                            <li><strong>Usage Data:</strong> Includes information about how you use our website and services.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. How Your Data Is Used</h2>
                        <p>
                            We use your data primarily to provide the service: transcribing your audio, generating AI summaries,
                            and creating quizzes. Your files are processed using secure AI APIs (Groq and Google Gemini)
                            and are stored encrypted in our database.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Data Retention</h2>
                        <p>
                            We will only retain your personal data for as long as necessary to fulfil the purposes we collected it for.
                            You can delete your lectures at any time via the dashboard.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
                        <p>
                            If you have any questions about this privacy policy or our privacy practices, please contact us at:
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
