import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import { pusher } from "@/lib/pusher";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { gameCode } = params;
    const { playerName } = await request.json();

    const game = await Game.findOne({ gameCode: gameCode.toUpperCase() });

    if (!game) {
      return NextResponse.json({ message: "Game not found." }, { status: 404 });
    }
    if (game.gameStarted) {
      return NextResponse.json({ message: "Game has already started." }, { status: 403 });
    }

    const newPlayer = {
      id: nanoid(),
      name: playerName,
    };
    
    game.players.push(newPlayer);
    await game.save();

    // Trigger Pusher event to notify waiting room
    await pusher.trigger(`game-${gameCode}`, 'player-joined', { players: game.players });
    
    return NextResponse.json({ playerId: newPlayer.id, players: game.players }, { status: 200 });
  } catch (error) {
    console.error("Error joining game:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}