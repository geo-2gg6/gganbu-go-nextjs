import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import { NextResponse } from "next/server";

// Function to generate a unique 6-character code
function generateGameCode() {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request) {
  try {
    await dbConnect();
    const { questions } = await request.json();

    if (!questions || questions.length < 5) {
      return NextResponse.json({ message: "Minimum 5 questions required." }, { status: 400 });
    }
    
    const gameCode = generateGameCode();

    await Game.create({
      gameCode,
      questions,
    });

    return NextResponse.json({ gameCode }, { status: 201 });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}