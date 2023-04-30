require("dotenv").config();
import { RiotAPI, RiotAPITypes, PlatformId } from "@fightmegg/riot-api";

const API_LOL = process.env.API_LOL!;
const rAPI = new RiotAPI(API_LOL);

interface LastsMatchesResuls {
    matches: WrappedMatch[];
    winrate: string;
    averageKDA: string;
}

interface WrappedMatch {
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

export const getLastMatchesEU = async (puuid: string, type: string | undefined, count: number = 10) => {
    const cluster = PlatformId.EUROPE;
    const matches = await getLastMatches(puuid, cluster, count, type);
    return matches;
}

const getLastMatches = async (puuid: string, cluster: RiotAPITypes.Cluster, count: number, type: string | undefined) => {
    const matchesList: WrappedMatch[] = [];
    const [matchType, matchQueue] = type?.split(" ") ?? [undefined, undefined];
    const matches = (await rAPI.matchV5.getIdsbyPuuid({ 
        cluster, puuid, params: {
            count, type: RiotAPITypes.MatchV5.MatchType[matchType as keyof typeof RiotAPITypes.MatchV5.MatchType], queue: Number(matchQueue)
        }
    })).slice(0, count);
    for await (const match of matches) {
        const matchData = await rAPI.matchV5.getMatchById({cluster, matchId: match});
        const focusedParticipant = matchData.info.participants.find((participant) => participant.puuid === puuid)!;
        const matchType = matchData.info.gameMode === "CLASSIC" ? matchData.info.queueId === 420 ? "Solo/Duo" : "Flex" : matchData.info.gameMode;
        const wrappedMatch: WrappedMatch = {
            matchId: match,
            duration: `${Math.floor(matchData.info.gameDuration / 60)}:${(matchData.info.gameDuration % 60).toFixed(0).padStart(2, "0")}`,
            gameMode: matchType,
            win: focusedParticipant.win,
            kda: `${focusedParticipant.kills}/${focusedParticipant.deaths}/${focusedParticipant.assists}`,
            champion: focusedParticipant.championName,
            date: new Date(matchData.info.gameStartTimestamp).toLocaleDateString(),
            focusedParticipantPUUID: focusedParticipant.puuid,
            focusedParticipantName: focusedParticipant.summonerName
        }
        matchesList.push(wrappedMatch);
    }
    const lastsMatchesResuls: LastsMatchesResuls = {
        matches: matchesList,
        winrate: `${Math.floor(matchesList.filter((match) => match.win).length / matchesList.length * 100)}%`,
        averageKDA: `${Math.floor(matchesList.reduce((acc, match) => acc + parseInt(match.kda.split("/")[0]), 0) / matchesList.length)}/${Math.floor(matchesList.reduce((acc, match) => acc + parseInt(match.kda.split("/")[1]), 0) / matchesList.length)}/${Math.floor(matchesList.reduce((acc, match) => acc + parseInt(match.kda.split("/")[2]), 0) / matchesList.length)}`
    }
    return lastsMatchesResuls;
}