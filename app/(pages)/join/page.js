'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinPage() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!name || !code) {
      alert('Please enter your name and the game code.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/game/${code.toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name }),
      });
      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem('playerId', data.playerId);
        sessionStorage.setItem('playerName', name);
        router.push(`/${code.toUpperCase()}`);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert('Failed to join game. Check the code and try again.');
    }
    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold uppercase">Join Game</h1>
      <form onSubmit={handleJoin} className="mt-8 flex w-full max-w-xs flex-col space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="rounded-lg border border-gray-600 bg-gray-800 p-4 text-center text-lg text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Game Code"
          className="rounded-lg border border-gray-600 bg-gray-800 p-4 text-center text-lg uppercase text-white"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength="6"
        />
         <button
            type="submit"
            className="mt-6 w-full max-w-xs rounded-lg bg-[--teal] py-4 text-xl font-bold uppercase transition hover:scale-105 disabled:opacity-50"
            disabled={isLoading}
        >
            {isLoading ? 'Joining...' : 'Enter'}
        </button>
      </form>
    </main>
  );
}