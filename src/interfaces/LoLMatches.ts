export interface LastsMatchesResuls {
    matches: WrappedMatch[];
    winrate: string;
    averageKDA: string;
}

export interface WrappedMatch {
    matchId: string;
    duration: string;
    gameMode: string;
    win: boolean;
    kda: string;
    champion: string;
    date: string;
    focusedParticipantPUUID: string;
    focusedParticipantName: string;
}