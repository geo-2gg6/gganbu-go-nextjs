'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Pusher from 'pusher-js';
import QrCodeDisplay from '@/app/components/QrCodeDisplay';
import QrScanner from '@/app/components/QrScanner';

export default function PlayPage() {
  const params = useParams();
  const gameCode = params.gameCode;

  const [game, setGame] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);

  useEffect(() => {
    // --- Pusher Real-time Setup ---
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
    const channel = pusher.subscribe(`game-${gameCode}`);

    const updateGameState = (data) => {
      setGame(data.game);
      const myId = sessionStorage.getItem('playerId');
      const me = data.game.players.find(p => p.id === myId);
      setCurrentPlayer(me);
    };

    channel.bind('game-started', updateGameState);
    channel.bind('score-update', updateGameState);
    
    channel.bind('game-over', (data) => {
      alert(`Game Over! Winners: ${data.winners.map(w => w.name).join(', ')}`);
      // You can redirect or show a proper game over screen here
    });

    return () => {
      pusher.unsubscribe(`game-${gameCode}`);
      pusher.disconnect();
    };
  }, [gameCode]);

  const handleScan = async (scannedData) => {
    const scannerId = sessionStorage.getItem('playerId');
    const response = await fetch(`/api/game/${gameCode}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scannerId, scannedAnswer: scannedData }),
    });
    const result = await response.json();
    if (!result.success) {
      alert(result.message);
    }
  };

  if (!game || !currentPlayer) {
    return <div className="flex min-h-screen items-center justify-center">Loading Game...</div>;
  }

  const isRedTeam = currentPlayer.team === 'red';

  return (
    <main className={`flex min-h-screen flex-col items-center p-4 ${isRedTeam ? 'bg-[--red-team]' : 'bg-[--blue-team]'}`}>
      <div className="flex w-full justify-between text-lg font-bold">
        <span>{currentPlayer.name}</span>
        <span>Score: {currentPlayer.score}</span>
      </div>
      
      <div className="flex flex-grow flex-col items-center justify-center text-center">
        {currentPlayer.role === 'question' ? (
          <div>
            <h2 className="text-2xl font-bold uppercase">Find the Answer!</h2>
            <p className="mt-4 text-3xl">{currentPlayer.currentQuestion || 'You found a match! Waiting for a new question...'}</p>
            <QrScanner onScan={handleScan} />
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold uppercase">You are the Answer!</h2>
            <p className="mt-4 text-3xl">Get ready to be scanned.</p>
            <QrCodeDisplay answer={currentPlayer.currentAnswer} />
          </div>
        )}
      </div>
    </main>
  );
}