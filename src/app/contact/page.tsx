"use client";

import { MessageCircle, Mail, ChevronLeft, Github } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-black text-white py-24 px-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] -z-10" />

            <div className="max-w-3xl mx-auto">
                <Link href="/">
                    <Button variant="ghost" className="mb-8 text-zinc-400 hover:text-white -ml-4">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>
                </Link>

                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4 uppercase tracking-widest">
                        <MessageCircle className="h-3 w-3" />
                        We&apos;re here to help
                    </div>
                    <h1 className="text-5xl font-black tracking-tight mb-4">Contact <span className="text-indigo-500">Support</span></h1>
                    <p className="text-zinc-400 text-lg">Have questions about your plan, payments, or a technical issue? Drop us a line.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-zinc-950/50 border-zinc-800 hover:border-indigo-500/50 transition-colors group">
                        <CardContent className="p-8 text-center italic">
                            <div className="mx-auto h-12 w-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 mb-6 group-hover:bg-indigo-600/10 transition-colors">
                                <Mail className="h-6 w-6 text-indigo-500" />
                            </div>
                            <h3 className="font-bold text-xl mb-2 text-white">Email Us</h3>
                            <p className="text-zinc-400 text-sm mb-6">Best for payment verification screenshots and detailed technical bugs.</p>
                            <a href="mailto:anoteani@gmail.com">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold">
                                    anoteani@gmail.com
                                </Button>
                            </a>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-950/50 border-zinc-800 hover:border-indigo-500/50 transition-colors group">
                        <CardContent className="p-8 text-center">
                            <div className="mx-auto h-12 w-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 mb-6 group-hover:bg-indigo-600/10 transition-colors">
                                <Github className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-bold text-xl mb-2 text-white">GitHub</h3>
                            <p className="text-zinc-400 text-sm mb-6">Contribute to the project or open a public issue if you&apos;re a developer.</p>
                            <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-900 font-bold">
                                View Repository
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-16 p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 text-center">
                    <p className="text-indigo-400 font-medium mb-2">Expected Response Time</p>
                    <p className="text-zinc-500 text-sm">We typically respond to support queries within <span className="text-white font-bold">12-24 hours</span> during semester periods.</p>
                </div>
            </div>
        </div>
    );
}
