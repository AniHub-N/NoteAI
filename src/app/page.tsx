import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Brain, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-purple-500/30">
      <header className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span>NotesAI</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#about" className="hover:text-white transition-colors">About</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-zinc-400 hover:text-white">
            Log in
          </Link>
          <Link href="/dashboard">
            <Button className="bg-white text-black hover:bg-zinc-200">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center md:py-32">
          <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-sm text-zinc-400 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2"></span>
            v1.0 Now Live for Students
          </div>
          <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Never miss a <br /> lecture detail again.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-400 md:text-xl">
            Turn hour-long lectures into 5-minute study guides, quizzes, and summaries instantly.
            The AI study companion designed for top students.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto hover-scale transition-all duration-200">
                Start Recording
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/lectures/1">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base border-zinc-800 bg-transparent text-white hover:bg-zinc-900 w-full sm:w-auto hover-lift transition-all duration-200">
                View Demo
              </Button>
            </Link>
          </div>

          <div id="features" className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full max-w-5xl">
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Summaries</h3>
              <p className="text-zinc-400">Instantly generate structured notes, key takeaways, and definitions from any audio.</p>
            </div>
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Auto-Quizzes</h3>
              <p className="text-zinc-400">Test your knowledge with automatically generated exam-style questions.</p>
            </div>
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Viral Sharing</h3>
              <p className="text-zinc-400">Share beautiful study notes with classmates via link or QR code instantly.</p>
            </div>
          </div>


          <div id="pricing" className="mt-32 w-full max-w-5xl text-center">
            <h2 className="text-3xl font-bold mb-12">Simple Pricing</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/30">
                <h3 className="text-xl font-bold mb-4">Free</h3>
                <p className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal text-zinc-400">/mo</span></p>
                <ul className="text-left space-y-2 mb-8 text-zinc-400">
                  <li>• 3 Lectures / month</li>
                  <li>• Basic Summaries</li>
                </ul>
                <Button variant="outline" className="w-full">Get Started</Button>
              </div>
              <div className="p-8 rounded-2xl border border-indigo-500/30 bg-indigo-900/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-600 text-xs px-3 py-1 rounded-bl-lg">POPULAR</div>
                <h3 className="text-xl font-bold mb-4">Pro</h3>
                <p className="text-3xl font-bold mb-4">$9<span className="text-sm font-normal text-zinc-400">/mo</span></p>
                <ul className="text-left space-y-2 mb-8 text-zinc-300">
                  <li>• Unlimited Lectures</li>
                  <li>• Advanced Quizzes</li>
                  <li>• Export to PDF</li>
                </ul>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Upgrade (Coming Soon)</Button>
              </div>
            </div>
          </div>

          <div id="about" className="mt-32 w-full max-w-3xl text-center mb-20">
            <h2 className="text-3xl font-bold mb-6">About NotesAI</h2>
            <p className="text-zinc-400 text-lg">
              Built for students who want to study smarter, not harder. Our mission is to leverage AI to turn chaotic lecture recordings into organized, actionable knowledge.
            </p>
          </div>
        </section>
      </main>
    </div >
  );
}
