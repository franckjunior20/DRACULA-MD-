const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../config');

const getContextInfo = (m) => {
    return {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '',
            newsletterName: 'JawadTechX',
            serverMessageId: 143,
        },
    };
};

const ppUrls = [
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    '',
    '',
];

const GroupEvents = async (conn, update) => {
    try {
        const isGroup = isJidGroup(update.id);
        if (!isGroup) return;

        const metadata = await conn.groupMetadata(update.id);
        const participants = update.participants;
        const desc = metadata.desc || "Pas de description";
        const groupMembersCount = metadata.participants.length;

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(update.id, 'image');
        } catch {
            ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)];
        }

        for (const num of participants) {
            const userName = num.split("@")[0];
            const timestamp = new Date().toLocaleString();

            if (update.action === "add" && config.WELCOME === "true") {
                const WelcomeText = `Salut @${userName} 👋\n` +
                    `Bienvenue dans *${metadata.subject}*.\n` +
                    `Tu es le membre numéro ${groupMembersCount} de ce groupe. 🙏\n` +
                    `Heure d'arrivée : *${timestamp}*\n` +
                    `Merci de lire la description du groupe pour éviter d'être expulsé :\n` +
                    `${desc}\n` +
                    `*Propulsé par ${config.BOT_NAME}*.`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: WelcomeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "remove" && config.WELCOME === "true") {
                const GoodbyeText = `Au revoir @${userName}. 😔\n` +
                    `Un autre membre a quitté le groupe.\n` +
                    `Heure de départ : *${timestamp}*\n` +
                    `Le groupe compte maintenant ${groupMembersCount} membres. 😭`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: GoodbyeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "demote" && config.ADMIN_EVENTS === "true") {
                const demoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `*Événement Admin*\n\n` +
                          `@${demoter} a rétrogradé @${userName} de son rôle d'admin. 👀\n` +
                          `Heure : ${timestamp}\n` +
                          `*Groupe :* ${metadata.subject}`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });

            } else if (update.action === "promote" && config.ADMIN_EVENTS === "true") {
                const promoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `*Événement Admin*\n\n` +
                          `@${promoter} a promu @${userName} en tant qu'admin. 🎉\n` +
                          `Heure : ${timestamp}\n` +
                          `*Groupe :* ${metadata.subject}`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });
            }
        }
    } catch (err) {
        console.error('Erreur d\'événement de groupe :', err);
    }
};

module.exports = GroupEvents;
