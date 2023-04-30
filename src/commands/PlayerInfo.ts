import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType, Message } from "discord.js";
import { Command } from "../Command";
import { getPlayerInfo, getPlayerIcon } from "../lolAPI/FetchPlayer";
import { getLastMatchesEU } from "../lolAPI/FetchMatches";
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
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "gamemode",
            description: "The mode to fetch matches for",
            required: false,
            choices: 
                [
                    {
                        name: "Ranked Solo/Duo",
                        value: "ranked 420"
                    },
                    {
                        name: "Ranked Flex",
                        value: "ranked 440"
                    },
                    {
                        name: "Normal/ARAM",
                        value: "normal"
                    },
                ]
        }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        const name = interaction.options.get("player", true).value as string;
        const region = interaction.options.get("region", true).value as string;
        const gamemode = interaction.options.get("gamemode", false)?.value as string | undefined;
        const summoner = await getPlayerInfo(region, name);
        if (!summoner) {
            await interaction.followUp(`Player "**${name}**" not found`);
            return;
        }
        
        const iconURL = await getPlayerIcon(summoner.profileIconId);

        const matches = await getLastMatchesEU(summoner.puuid, gamemode);

        const message = {
            embeds: [
                {
                    title: summoner.name,
                    //description: `Summoner ID: ${summoner.id}\nAccount ID: ${summoner.accountId}\nPUUID: ${summoner.puuid}`,
                    color: 0x00ff00,
                    footer: {
                        text: `Last played game: ${matches.matches[0].date}`,
                    },
                    thumbnail: { url: iconURL },
                    fields: [
                        {
                            name: "Region",
                            value: region,
                            inline: true
                        },
                        {
                            name: "Level",
                            value: `${summoner.summonerLevel}`,
                            inline: true
                        },
                        {
                            name: `Last 10 ${gamemode?.concat(" ").toLocaleLowerCase()}matches`,
                            value: `Win rate: ${matches.winrate}, Average kda: ${matches.averageKDA} \n\n${matches.matches.map((match, idx) => {
                                // duration, gamemode, win/loss, kda, champion
                                    return `**Game ${idx+1}**: ${match.champion}, ${match.gameMode}, ${match.duration}, ${match.win ? "Win" : "Loss"}, kda: ${match.kda}`;
                            }).join("\n")}`
                        }
                    ]
                }
            ]
        }


        await interaction.followUp(message);
    }
};