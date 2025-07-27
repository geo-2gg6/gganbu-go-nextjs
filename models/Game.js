import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
  id: String, // We will use a unique ID for each player
  name: String,
  score: { type: Number, default: 0 },
  team: String, // 'red' or 'blue'
  role: String, // 'question' or 'answer'
  currentQuestion: String,
  currentAnswer: String,
});

const GameSchema = new mongoose.Schema({
  gameCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  players: [PlayerSchema],
  questions: [{
    question: String,
    answer: String,
  }],
  gameStarted: {
    type: Boolean,
    default: false,
  },
  winners: [{
    name: String,
    rank: Number,
  }],
}, { timestamps: true });

export default mongoose.models.Game || mongoose.model('Game', GameSchema);