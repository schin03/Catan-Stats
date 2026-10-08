export type Lobby = {
  id: string;
  name: string;
  hostId: string;
  hostUsername: string;
  createdAt: string;
};

export type LobbyListItem = Lobby & { memberCount: number };

export type Label = { id: string; name: string };

export type LobbyMember = {
  userId: string;
  username: string;
  joinedAt: string;
  labelIds: string[];
};

export type InviteCode = { code: string; expiresAt: string };
