export type GameStatus = "active" | "completed";

export type Participant = {
  userId: string;
  username: string;
  color: string | null;
  score: number | null;
};

export type Roll = {
  id: string;
  round: number;
  red: number;
  yellow: number;
  total: number;
};

export type Game = {
  id: string;
  lobbyId: string;
  status: GameStatus;
  winnerId: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type GameDetail = Game & { participants: Participant[]; rolls: Roll[] };

export type ActiveGameSummary = { game: Game; participants: Participant[]; rollCount: number };
