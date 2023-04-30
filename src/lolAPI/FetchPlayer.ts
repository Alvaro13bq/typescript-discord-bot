require("dotenv").config();
import { RiotAPI, RiotAPITypes, PlatformId, DDragon } from "@fightmegg/riot-api";

const API_LOL = process.env.API_LOL!;
const rAPI = new RiotAPI(API_LOL);

const GetProfileIconURL = (ddragonVersion: string, iconId: string) => `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/profileicon/${iconId}`;


export const GetPlayerInfo = async (region: string, playername: string): Promise<RiotAPITypes.Summoner.SummonerDTO | null> => {
    try {
        const regionId = PlatformId[region as keyof typeof PlatformId] as RiotAPITypes.LoLRegion;
        const summoner = await rAPI.summoner.getBySummonerName({
            region: regionId,
            summonerName: playername
        });
        return summoner;
    } catch (error) {
        return null;
    }
    
}

export const GetPlayerIcon = async (iconId: number) => {
    const ddragon = new DDragon();
    const version = await ddragon.versions.latest();
    const icons = await ddragon.profileIcons()
    const icon = icons.data[iconId];
    return GetProfileIconURL(version, icon.image.full);
}