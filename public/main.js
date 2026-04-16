//          / __ \____ _(_)   _____  ____/ /
//         / / / / __ `/ / | / / _ \/ __  /
//        / /_/ / /_/ / /| |/ /  __/ /_/ /
//       /_____/\__,_/_/ |___/\___/\__,_/

const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const https = require('https');

const isDev = !app.isPackaged;

require('@electron/remote/main').initialize();

var mainWindow, axiosClient, accessToken, entitlementsToken, playerUUid, riotClientVersion, shard, configEndpoint, coreGameUrl, playerUrl;

app.on('window-all-closed', () => { app.quit(); });

app.whenReady().then(() => {
    axios.get('https://valorant-api.com/v1/version').then(res => {
        riotClientVersion = res.data.data.riotClientVersion;
    })
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        resizable: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: !isDev
        }
    });
    require('@electron/remote/main').enable(mainWindow.webContents);
    mainWindow.setMenu(null);
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
    }
});

ipcMain.on('localfolder', () => {
    mainWindow.webContents.send('localfolder', process.env.LOCALAPPDATA);
})

ipcMain.on('rankUpdate', (event, arg1, arg2) => {
    if (!axiosClient) return mainWindow.webContents.send('unauthorized');
    const Tier = arg1;
    const LeaderboardPos = arg2;

    axiosClient.get('/chat/v4/presences').then(res => {
        const myPresence = res.data.presences.find(p => p.puuid === playerUUid);
        if (!myPresence) return console.log('Presence not found, puuid:', playerUUid);

        const privateData = JSON.parse(Buffer.from(myPresence.private, 'base64').toString('utf8'));

        privateData.playerPresenceData.competitiveTier = Tier;
        if (LeaderboardPos !== undefined) privateData.playerPresenceData.leaderboardPosition = LeaderboardPos;

        axiosClient.put('/chat/v2/me', {
            state: myPresence.state,
            private: Buffer.from(JSON.stringify(privateData)).toString('base64'),
            shared: {
                actor: "",
                details: "",
                location: "",
                product: "valorant",
                time: new Date().valueOf() + 35000
            }
        }).then(() => {
            console.log('Rank update success!');
        }).catch(err => {
            console.log('Rank update error:', err.message);
            console.log('Error response:', err.response?.data);
        });
    }).catch(err => console.log('Presence fetch error:', err.message));
});

ipcMain.on('profileUpdate', async (event, data) => {
    if (!axiosClient) return mainWindow.webContents.send('unauthorized');

    try {
        const presenceRes = await axiosClient.get('/chat/v4/presences');
        const myPresence = presenceRes.data.presences.find(p => p.puuid === playerUUid);
        if (myPresence) {
            const privateData = JSON.parse(Buffer.from(myPresence.private, 'base64').toString('utf8'));

            if (data.accountLevel !== undefined) privateData.playerPresenceData.accountLevel = data.accountLevel;
            if (data.leaderboardPosition !== undefined) privateData.playerPresenceData.leaderboardPosition = data.leaderboardPosition;
            if (data.isIdle !== undefined) privateData.isIdle = data.isIdle;
            if (data.playerCardId) privateData.playerPresenceData.playerCardId = data.playerCardId;
            if (data.playerTitleId !== undefined) privateData.playerPresenceData.playerTitleId = data.playerTitleId;

            await axiosClient.put('/chat/v2/me', {
                state: myPresence.state,
                private: Buffer.from(JSON.stringify(privateData)).toString('base64'),
                shared: {
                    actor: "",
                    details: "",
                    location: "",
                    product: "valorant",
                    time: new Date().valueOf() + 35000
                }
            });
            console.log('Presence updated');
        }
    } catch (err) { console.log('Presence update error:', err.message); }

    console.log('profileUpdate data received:', JSON.stringify(data));
    if (playerUrl) {
        const pdHeaders = {
            'Authorization': 'Bearer ' + accessToken,
            'X-Riot-Entitlements-JWT': entitlementsToken,
            'X-Riot-ClientVersion': riotClientVersion,
            'X-Riot-ClientPlatform': 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuNzY4LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9',
            'Content-Type': 'application/json'
        };
        let loadout = null, loadoutVer = null;
        for (const ver of ['v3', 'v2']) {
            try {
                const r = await axios.get(`${playerUrl}/personalization/${ver}/players/${playerUUid}/playerloadout`, { headers: pdHeaders });
                loadout = r.data; loadoutVer = ver;
                console.log(`Loadout fetched via ${ver}, Identity:`, JSON.stringify(loadout.Identity));
                break;
            } catch (e) { console.log(`Loadout GET ${ver}:`, e.response?.status, e.message); }
        }
        if (loadout?.Identity) {
            if (data.playerCardId) loadout.Identity.PlayerCardID = data.playerCardId;
            if (data.playerTitleId !== undefined) loadout.Identity.PlayerTitleID = data.playerTitleId;
            if (data.preferredLevelBorderId) loadout.Identity.PreferredLevelBorderID = data.preferredLevelBorderId;
            if (data.accountLevel !== undefined) loadout.Identity.AccountLevel = data.accountLevel;
            console.log('Identity after update:', JSON.stringify(loadout.Identity));
            try {
                await axios.put(`${playerUrl}/personalization/${loadoutVer}/players/${playerUUid}/playerloadout`, loadout, { headers: pdHeaders });
                console.log('Loadout PUT success');
            } catch (err) {
                console.log('Loadout PUT error:', err.response?.status, err.message);
                console.log('Error response:', JSON.stringify(err.response?.data));
            }
        } else {
            console.log('No Identity in loadout or loadout fetch failed');
        }
    } else {
        console.log('playerUrl not set — cannot update loadout');
    }
});

ipcMain.on('auth', async (event, port, password) => {
    axiosClient = axios.create({
        baseURL: `https://127.0.0.1:${port}/`,
        timeout: 5000,
        headers: {
            common: {
                'User-Agent': 'ShooterGame/8 Windows/10.0.19042.1.768.64bit',
                'X-Riot-ClientPlatform': 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuNzY4LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9',
                'X-Riot-ClientVersion': riotClientVersion,
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`riot:${password}`).toString('base64')
            }
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
        })
    });

    axiosClient.get('product-session/v1/external-sessions').then(res => {
        const valorantSession = Object.values(res.data).find(s => s.productId === 'valorant');
        if (valorantSession) {
            const args = valorantSession.launchConfiguration?.arguments || [];
            args.forEach(arg => {
                if (arg.includes('-ares-deployment')) shard = arg.split("=")[1];
                else if (arg.includes("-config-endpoint")) configEndpoint = arg.split("=")[1];
            });
        }

        if (shard) {
            setUrls(shard);
        } else {
            getShardFallback();
        }
    }).catch(err => {
        console.log('External sessions error:', err.message);
        getShardFallback();
    });

    function setUrls(s) {
        coreGameUrl = `https://glz-${s}-1.${s}.a.pvp.net`;
        playerUrl = `https://pd.${s}.a.pvp.net`;
        console.log('coreGameUrl:', coreGameUrl);
        console.log('playerUrl:', playerUrl);
    }

    async function getShardFallback() {
        try {
            const r = await axiosClient.get('chat/v1/session');
            const region = r.data?.region;
            if (region) {
                shard = region.replace(/\d/g, '');
                setUrls(shard);
                return;
            }
        } catch (e) { console.log('chat/v1/session fallback failed:', e.message); }
        console.log('Could not determine shard/region');
    }

    try {
        const entitlementsRes = await axiosClient.get('entitlements/v1/token');
        accessToken = entitlementsRes.data.accessToken;
        entitlementsToken = entitlementsRes.data.token;

        const userRes = await axios.get('https://auth.riotgames.com/userinfo', {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });
        playerUUid = userRes.data.sub;

        setTimeout(() => {
            mainWindow.webContents.send('userAuth', userRes.data);
        }, 500);

    } catch (err) {
        console.log('Auth Error:', err.message || err);
        mainWindow.webContents.send('unauthorized');
    }
})

ipcMain.on('equip', async (event, skinUid) => {
    if (!axiosClient) return mainWindow.webContents.send('unauthorized');
    if (!playerUrl) {
        console.log('playerUrl not set yet, playerUrl:', playerUrl, 'shard:', shard);
        return mainWindow.webContents.send('unauthorized');
    }

    const pdHeaders = {
        'Authorization': 'Bearer ' + accessToken,
        'X-Riot-Entitlements-JWT': entitlementsToken,
        'X-Riot-ClientVersion': riotClientVersion,
        'X-Riot-ClientPlatform': 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuNzY4LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9',
        'Content-Type': 'application/json'
    };

    let loadout = null;
    let loadoutVersion = null;
    for (const ver of ['v3', 'v2']) {
        try {
            const res = await axios.get(`${playerUrl}/personalization/${ver}/players/${playerUUid}/playerloadout`, { headers: pdHeaders });
            loadout = res.data;
            loadoutVersion = ver;
            console.log(`Loadout fetched via ${ver}`);
            break;
        } catch (err) {
            console.log(`Loadout GET ${ver} error:`, err.response?.status, err.message);
        }
    }

    if (!loadout) return console.log('Could not fetch loadout');

    const weaponsRes = await axios.get('https://valorant-api.com/v1/weapons').catch(e => null);
    if (!weaponsRes) return console.log('Could not fetch weapons from valorant-api');

    const gun = weaponsRes.data.data.find(weapon =>
        weapon.skins.some(skin => skin.uuid.toLowerCase() === skinUid.toLowerCase())
    );
    if (!gun) return console.log('Gun not found for skin:', skinUid);

    const skinData = gun.skins.find(skin => skin.uuid.toLowerCase() === skinUid.toLowerCase());
    const guns = loadout.Guns || loadout.guns;
    if (!guns) return console.log('No Guns array in loadout response');

    const gunInLoadout = guns.find(g => (g.ID || g.id)?.toLowerCase() === gun.uuid.toLowerCase());
    if (!gunInLoadout) return console.log('Gun not found in loadout:', gun.uuid);

    gunInLoadout.SkinID = skinData.uuid;
    gunInLoadout.SkinLevelID = skinData.levels?.[0]?.uuid || gunInLoadout.SkinLevelID;
    gunInLoadout.ChromaID = skinData.chromas?.[0]?.uuid || gunInLoadout.ChromaID;

    axios.put(`${playerUrl}/personalization/${loadoutVersion}/players/${playerUUid}/playerloadout`, loadout, {
        headers: pdHeaders
    }).then(() => console.log('Skin equipped successfully!'))
        .catch(err => console.log('Equip PUT error:', err.response?.status, err.message));
})

process.on("unhandledRejection", async (reason, p, origin) => {
    console.log(reason.stack);
});

process.on("uncaughtExceptionMonitor", async (err, origin) => {
    console.log(err.stack);
});
