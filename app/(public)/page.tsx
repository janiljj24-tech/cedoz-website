import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-900 text-white">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-blue-500">
          Welcome to CEDOZ
        </h1>
        <p className="text-lg text-slate-300">
          Your web app is deployed and working on Netlify!
        </p>

        <div className="flex justify-center gap-4 pt-6">
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </main>
  );
}