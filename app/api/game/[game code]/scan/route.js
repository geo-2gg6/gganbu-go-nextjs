import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import { pusher } from "@/lib/pusher";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { gameCode } = params;
    const { scannerId, scannedAnswer } = await request.json();

    const game = await Game.findOne({ gameCode: gameCode.toUpperCase() });
    if (!game) {
      return NextResponse.json({ message: "Game not found." }, { status: 404 });
    }

    const questionPlayer = game.players.find(p => p.id === scannerId);
    const answerPlayer = game.players.find(p => p.currentAnswer === scannedAnswer);
    
    if (!questionPlayer || !answerPlayer) {
      return NextResponse.json({ success: false, message: "Invalid scan." }, { status: 200 });
    }
    
    const questionObject = game.questions.find(q => q.question === questionPlayer.currentQuestion);

    // --- Core Scan Logic: Check for a Match ---
    if (questionObject && questionObject.answer === scannedAnswer) {
      // It's a match! Update scores.
      questionPlayer.score += 1;
      answerPlayer.score += 1;
      
      // Clear current Q&A
      questionPlayer.currentQuestion = null;
      answerPlayer.currentAnswer = null;

      // Assign new Q&A if available
      const usedQuestions = game.players.map(p => p.currentQuestion).filter(Boolean);
      const availablePair = game.questions.find(q => !usedQuestions.includes(q.question));
      
      if (availablePair) {
        questionPlayer.currentQuestion = availablePair.question;
        answerPlayer.currentAnswer = availablePair.answer;
      }
      
      // Check for winners
      [questionPlayer, answerPlayer].forEach(p => {
        if (p.score >= 5 && !game.winners.find(w => w.name === p.name)) {
          game.winners.push({ name: p.name, rank: game.winners.length + 1 });
        }
      });
      
      await game.save();

      // Trigger Pusher event for score update
      await pusher.trigger(`game-${gameCode}`, 'score-update', { game });

      if (game.winners.length >= 3) {
         await pusher.trigger(`game-${gameCode}`, 'game-over', { winners: game.winners });
      }

      return NextResponse.json({ success: true, message: "Match found!", game }, { status: 200 });
    } else {
      // Not a match
      return NextResponse.json({ success: false, message: "Not a match. Keep searching!" }, { status: 200 });
    }
  } catch (error) {
    console.error("Error scanning code:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}