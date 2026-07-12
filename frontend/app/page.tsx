import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl w-full text-center relative overflow-hidden rounded-3xl bg-hero-glow p-12">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm text-xs text-gray-600 mb-6">
          ✨ One idea, five formats, twenty seconds
        </span>
        <h1 className="text-3xl md:text-4xl font-medium leading-tight mb-4">
          Stop rewriting the same idea five times a week
        </h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Turn one topic into a blog post, LinkedIn post, tweet thread, YouTube
          script, and email newsletter — instantly, with AI.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/signup" className="bg-brand-400 text-white rounded-xl px-6 py-2.5 shadow-sm">
            Get started free
          </Link>
          <Link href="/login" className="bg-surface-1 rounded-xl px-6 py-2.5 shadow-sm">
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
