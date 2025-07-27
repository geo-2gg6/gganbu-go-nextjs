'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HostPage() {
  const [questions, setQuestions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateGame = async () => {
    setIsLoading(true);
    const parsedQuestions = questions.split('\n').filter(line => line.includes(';')).map(line => {
      const [question, answer] = line.split(';');
      return { question: question.trim(), answer: answer.trim() };
    });

    if (parsedQuestions.length < 5) {
      alert('Please provide at least 5 questions in the format "Question;Answer" on separate lines.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: parsedQuestions }),
      });
      const data = await response.json();
      if (response.ok) {
        router.push(`/${data.gameCode}`); // Redirect to the waiting room
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to create game. Is the server running?');
    }
    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold uppercase">Host a Game</h1>
      <p className="mt-4 text-center text-gray-300">Enter questions and answers, one per line.<br />Format: <strong>Question;Answer</strong></p>
      <textarea
        rows="10"
        className="mt-4 w-full max-w-md rounded-lg border border-gray-600 bg-gray-800 p-3 text-white"
        placeholder="What is the capital of France?;Paris&#10;What is 5x5?;25"
        value={questions}
        onChange={(e) => setQuestions(e.target.value)}
      />
      <button
        className="mt-6 w-full max-w-md rounded-lg bg-[--pink] py-4 text-xl font-bold uppercase transition hover:scale-105 disabled:opacity-50"
        onClick={handleCreateGame}
        disabled={isLoading}
      >
        {isLoading ? 'Creating...' : 'Create Game'}
      </button>
    </main>
  );
}