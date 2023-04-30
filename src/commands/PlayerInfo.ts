import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType, Message } from "discord.js";
import { Command } from "../Command";
import { getPlayerInfo, getPlayerIcon } from "../lolAPI/FetchPlayer";
import { PlatformId } from "@fightmegg/riot-api";


export const PlayerInfo: Command = {
    name: "playerinfo",
    description: "Fetches info about a player",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "player",
            description: "The player to fetch info for",
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "region",
            description: "The region the player is in",
            required: true,
            choices:
                Object.keys(PlatformId).map((key) => {
                    return {
                        name: key,
                        value: key
                    };
                })
        }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        const name = interaction.options.get("player", true).value as string;
        const region = interaction.options.get("region", true).value as string;
        const summoner = await getPlayerInfo(region, name);
        const iconURL = await getPlayerIcon(summoner.profileIconId);

        const message = {
            embeds: [
                {
                    title: summoner.name,
                    description: `Summoner Level: ${summoner.summonerLevel}\nSummoner ID: ${summoner.id}\nAccount ID: ${summoner.accountId}\nPUUID: ${summoner.puuid}`,
                    color: 0x00ff00,
                    footer: {
                        text: "Powered by Fightmegg's Riot API Wrapper",
                    },
                    thumbnail: { url: iconURL },
                }
            ]
        }


        await interaction.followUp(message);
    }
};