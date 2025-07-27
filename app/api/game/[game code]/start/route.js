import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import { pusher } from "@/lib/pusher";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { gameCode } = params;

    const game = await Game.findOne({ gameCode: gameCode.toUpperCase() });
    if (!game) {
      return NextResponse.json({ message: "Game not found." }, { status: 404 });
    }

    // --- Core Game Logic: Shuffle and Assign Teams ---
    const shuffledPlayers = [...game.players].sort(() => 0.5 - Math.random());
    const midpoint = Math.ceil(shuffledPlayers.length / 2);
    
    const teamRed = shuffledPlayers.slice(0, midpoint);
    const teamBlue = shuffledPlayers.slice(midpoint);
    const shuffledQuestions = [...game.questions].sort(() => 0.5 - Math.random());

    game.players.forEach(player => {
      const isRed = teamRed.some(redPlayer => redPlayer.id === player.id);
      if (isRed) {
        const index = teamRed.findIndex(redPlayer => redPlayer.id === player.id);
        player.team = 'red';
        player.role = 'question';
        if (shuffledQuestions[index]) {
          player.currentQuestion = shuffledQuestions[index].question;
        }
      } else {
        const index = teamBlue.findIndex(bluePlayer => bluePlayer.id === player.id);
        player.team = 'blue';
        player.role = 'answer';
        if (shuffledQuestions[index]) {
          player.currentAnswer = shuffledQuestions[index].answer;
        }
      }
    });

    game.gameStarted = true;
    await game.save();

    // Trigger Pusher event to start the game for all players
    await pusher.trigger(`game-${gameCode}`, 'game-started', { game });
    
    return NextResponse.json({ message: "Game started successfully!", game }, { status: 200 });
  } catch (error) {
    console.error("Error starting game:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}