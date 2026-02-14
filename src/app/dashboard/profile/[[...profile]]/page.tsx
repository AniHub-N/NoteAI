"use client";

import { UserProfile } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/50 backdrop-blur-xl px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Profile Settings</h1>
                    </div>
                </div>
            </header>

            <main className="container max-w-4xl mx-auto py-10 px-4">
                <UserProfile
                    routing="path"
                    path="/dashboard/profile"
                    appearance={{
                        elements: {
                            rootBox: "w-full",
                            card: "shadow-none border border-zinc-200 dark:border-zinc-800",
                        }
                    }}
                />
            </main>
        </div>
    );
}
