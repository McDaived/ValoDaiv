//          / __ \____ _(_)   _____  ____/ /
//         / / / / __ `/ / | / / _ \/ __  / 
//        / /_/ / /_/ / /| |/ /  __/ /_/ /  
//       /_____/\__,_/_/ |___/\___/\__,_/   

const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const isDev = require('electron-is-dev');
const path = require('path');
const axios = require('axios');
const https = require('https');

require('@electron/remote/main').initialize();

var mainWindow, axiosClient, accessToken, entitlementsToken, playerUUid, riotClientVersion, myInterval, shard, configEndpoint, coreGameUrl, playerUrl, rankInterval;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    require('@electron/remote/main').enable(mainWindow.webContents);
    mainWindow.setMenu(null);
    mainWindow.loadURL(isDev
        ? 'http://localhost:5173'
        : `file://${path.join(__dirname, '../build/index.html')}`);
});

ipcMain.on('localfolder' , () => {
    mainWindow.webContents.send('localfolder', process.env.LOCALAPPDATA);
})

ipcMain.on('rankUpdate', (event, arg1) => {
    if (!axiosClient) return mainWindow.webContents.send('unauthorized');
    if(rankInterval) clearInterval(rankInterval);
    let Tier = arg1;
    let status = "chat";
    let config = {
        isValid:true,
        sessionLoopState:'MENUS',
        partyOwnerSessionLoopState:'INGAME',
        customGameName:'',
        customGameTeam:'',
        partyOwnerMatchMap:'',
        partyOwnerMatchCurrentTeam:'',
        partyOwnerMatchScoreAllyTeam:0,
        partyOwnerMatchScoreEnemyTeam:0,
        partyOwnerProvisioningFlow:'Invalid',
        provisioningFlow:'Invalid',
        matchMap:'',
        partyId:'727',
        isPartyOwner:true,
        partyState:'DEFAULT',
        maxPartySize:5,
        queueId: '',
        partyLFM:false,
        partySize:1,
        tournamentId:'',
        rosterId:'',
        partyVersion:1650719279092,
        queueEntryTime:'0001.01.01-00.00.00',
        playerCardId:'',
        playerTitleId:'',
        preferredLevelBorderId:'',
        accountLevel:69,
        competitiveTier: Tier,
        leaderboardPosition:0,
        isIdle:true
    }
    config.partyClientVersion = riotClientVersion;
    config = {
        state: status,
        private: Buffer.from(JSON.stringify(config)).toString('base64'),
        shared: {
            actor: "",
            details: "",
            location: "",
            product: "valorant",
            time: new Date().valueOf() + 35000
        }
    }
    rankInterval = setInterval(() => {
        axiosClient.put('/chat/v2/me', config);
    }, 10000)
});

ipcMain.on('instaLock', (event, arg1, arg2) => {
    if (!axiosClient) return mainWindow.webContents.send('unauthorized');
    if (arg1 == true) {
        myInterval = setInterval(() => {
            try {
                axiosClient.get(`${coreGameUrl}/pregame/v1/players/${playerUUid}`, {
                    headers: {
                        common: {
                            'Authorization': 'Bearer ' + accessToken,
                            'X-Riot-Entitlements-JWT': entitlementsToken
                        }
                    }
                }).then(res => {
                    if (res.data?.MatchID) {
                        clearInterval(myInterval)
                        mainWindow.webContents.send('locked')
                        setTimeout(() => {
                            axiosClient.post(`${coreGameUrl}/pregame/v1/matches/${res.data.MatchID}/lock/${arg2}`, {}, {
                                headers: {
                                    common: {
                                        'Authorization': 'Bearer ' + accessToken,
                                        'X-Riot-Entitlements-JWT': entitlementsToken
                                    }
                                },
                            }).catch(err => { })
                        }, 1000)
                    }
                }).catch(err => { })
            } catch (err) {

            }
        }, 1000);
    }
    else {
        clearInterval(myInterval)
    }
})

ipcMain.on('auth', (event, port, password) => {
    axiosClient = axios.create({
        baseURL: `https://127.0.0.1:${port}/`,
        timeout: 1000,
        headers: {
            common: {
                'User-Agent': 'ShooterGame/8 Windows/10.0.19042.1.768.64bit',
                'X-Riot-ClientPlatform': 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuNzY4LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9',
                'X-Riot-ClientVersion': riotClientVersion,
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`riot:${password}`).toString('base64')
            },
            put: {
                'Content-Type': 'application/json'
            }
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
        })
    })
    axiosClient.get('product-session/v1/external-sessions').then(res => {
        let something = res.data[Object.keys(res.data)[0]];
        something.launchConfiguration.arguments.forEach(arg => {
            if(arg.includes('-ares-deployment')) {
                shard = arg.split("=")[1];
            }
            else if (arg.includes("-config-endpoint")) {
				configEndpoint = arg.split("=")[1];
			}
        })
        if(shard && configEndpoint) {
            axiosClient.get(configEndpoint + '/v1/config/' + shard).then(res => {
                coreGameUrl = res.data.Collapsed.SERVICEURL_COREGAME;
                playerUrl = res.data.Collapsed.SERVICEURL_NAME;
            });
        }
    });
    axiosClient.get('entitlements/v1/token').then(res => {
        accessToken = res.data.accessToken;
        entitlementsToken = res.data.token;
        axios.get('https://auth.riotgames.com/userinfo', {
            headers: {
                common: {
                    'Authorization': 'Bearer ' + accessToken
                }
            }
        }).then(res => {
            playerUUid = res.data.sub;
            axiosClient.get(coreGameUrl + `/session/v1/sessions/${playerUUid}`).then(resso => {
                riotClientVersion = resso.data.clientVersion;
            })
            setTimeout(() => {
                mainWindow.webContents.send('userAuth', res.data);
            }, 1000)
        }).catch(err => { console.log('AxiosErr', err) })
    }).catch(err => { console.log('AxiosErr', err) })
})

ipcMain.on('equip', (event, skinUid) => {
    if (!axiosClient) return mainWindow.webContents.send('unauthorized');
    axiosClient.get(`${playerUrl}/personalization/v2/players/${playerUUid}/playerloadout`, {
        headers: {
            common: {
                'Authorization': 'Bearer ' + accessToken,
                'X-Riot-Entitlements-JWT': entitlementsToken
            }
        }
    }).then(res => {
        let sampleBody = res.data;
        console.log(sampleBody)
        axios.get('https://valorant-api.com/v1/weapons').then(ress => {
            const gun = ress.data.data.find(weapon => weapon.skins.some(skin => skin.uuid == skinUid));
            sampleBody.Guns.find(sampleGun => sampleGun.ID == gun.uuid).SkinID = skinUid;
            axiosClient.put(`${playerUrl}/personalization/v2/players/${playerUUid}/playerloadout`, sampleBody, {
                headers: {
                    common: {
                        'Authorization': 'Bearer ' + accessToken,
                        'X-Riot-Entitlements-JWT': entitlementsToken
                    }
                }
            })
        })
    });
})

process.on("unhandledRejection", async (reason, p, origin) => {
    console.log(reason.stack);
});

process.on("uncaughtExceptionMonitor", async (err, origin) => {
    console.log(err.stack);
});
