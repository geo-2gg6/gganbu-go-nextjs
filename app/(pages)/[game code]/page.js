'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Pusher from 'pusher-js';

export default function WaitingRoom() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.gameCode;
  
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    // Check if the current user is the host
    const hostCode = sessionStorage.getItem('hostCode');
    if (hostCode === gameCode) {
      setIsHost(true);
    }
    
    // Fetch initial players
    const fetchGame = async () => {
      // You could create a GET API route to fetch game state, or just rely on Pusher
    };
    fetchGame();

    // --- Pusher Real-time Setup ---
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
    
    const channel = pusher.subscribe(`game-${gameCode}`);
    
    channel.bind('player-joined', (data) => {
      setPlayers(data.players);
    });

    channel.bind('game-started', () => {
      router.push(`/${gameCode}/play`);
    });

    return () => {
      pusher.unsubscribe(`game-${gameCode}`);
      pusher.disconnect();
    };
  }, [gameCode, router]);

  const handleStartGame = async () => {
    await fetch(`/api/game/${gameCode}/start`, { method: 'POST' });
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h2 className="text-2xl text-gray-400">Game Code</h2>
      <h1 className="text-6xl font-bold tracking-widest text-white">{gameCode}</h1>
      
      <div className="mt-8 w-full max-w-md">
        <h3 className="text-xl text-center font-bold">Players Joined ({players.length})</h3>
        <ul className="mt-4 space-y-2">
          {players.map((player) => (
            <li key={player.id} className="w-full rounded-lg bg-gray-700 p-3 text-center text-lg">
              {player.name}
            </li>
          ))}
        </ul>
      </div>

      {isHost && (
        <button
          onClick={handleStartGame}
          disabled={players.length < 2}
          className="mt-8 w-full max-w-md rounded-lg bg-[--pink] py-4 text-xl font-bold uppercase transition hover:scale-105 disabled:opacity-50"
        >
          {players.length < 2 ? 'Need at least 2 players' : 'Start Game'}
        </button>
      )}
    </main>
  );
}