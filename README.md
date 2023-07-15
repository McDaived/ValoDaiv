# ValoDaiv
**Valorant API App , Edit Rank - Equip Any Skin - Instant Locker Agint , Developed and improve by me**

# ![](https://svgshare.com/i/vJ6.svg) Information :
To know what is that Visit [Valorant API](https://valapidocs.techchrism.me/)

# ![](https://img.icons8.com/?size=60&id=A1J30r5KcCb7&format=svg) Features :
* Agent Instant Locker
* Skin Changer
* Rank Editor

# ![](https://img.icons8.com/?size=60&id=DWiebo2M1Bbt&format=svg) Usage :
- [x] **Authorize Account : when game is open press Authorize Account to be able use all Features.**

- [x] **skin changer : After equipping a skin you have to restart your game to see it in the collection + for now im working for improve that is mean api skin shutdown just for a few days.**

- [x] **rank editor : It will show on your profile when you open ur friends panel and wait 10 sec, the modified rank is visible to your friends.**

- [x] **insta locker : Well it should work, just first pick the agent then turn it on before joining a match and itll automatically turn off when you join a match, meaning it locked the agent for you.**

You can build the source , and download the compiled release [ValoDaiv](https://github.com/McDaived/ValoDaiv/releases)!

### ![](https://img.icons8.com/?size=60&id=N5H8YRvduAGy&format=svg) Using the source :
Install the requirements using the following command:
```
npm i
```

Run the client side of the application using:
```
npm run dev
```

Run the application (server side) using the following command:
```
electron .
```
If electron is not installed on your device you can install it by using `npm i electron -g`

### ![](https://img.icons8.com/?size=60&id=695f80k5O5d9&format=svg) build the source :

Install `electron-builder` by using `npm i electron-builder -g`

* Run `npm run build` to build the client side [Creates directory called "dist"].

* Rename the directory `dist` to `build`.

* Inside the `build` directory, open the `index.html` file and change the following (Append "." to file locations):
* * `"/assets/icon-6261825a.ico"` --> `"./assets/icon-6261825a.ico"`
* * `"/assets/index-5d0004af.js"` --> `"./assets/index-5d0004af.js"`
* * `"/assets/index-40c62457.css"` --> `"./assets/index-40c62457.css"`

* Run `npm run electron:build` in the directory to compile the electron app finally.

# ![](https://img.icons8.com/?size=60&id=y5gZPP6Eb5gS&format=svg) Note :
This tool usings the API of Valorant to set your collection , not bannable as it just uses the local client api
