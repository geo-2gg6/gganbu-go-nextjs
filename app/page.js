import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-5xl font-bold uppercase tracking-wider">Gganbu Go</h1>
      <p className="mt-4 text-2xl text-gray-300">○ △ □</p>
      <div className="mt-12 flex w-full max-w-xs flex-col items-center space-y-4">
        <Link href="/host" className="w-full rounded-lg bg-[--pink] py-4 text-xl font-bold uppercase transition hover:scale-105">
          Start a Game
        </Link>
        <Link href="/join" className="w-full rounded-lg bg-[--teal] py-4 text-xl font-bold uppercase transition hover:scale-105">
          Join a Game
        </Link>
      </div>
    </main>
  );
}