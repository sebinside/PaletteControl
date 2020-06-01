import {CredentialsProviderImpl} from "./server/secret/CredentialsProviderImpl";
import * as express from "express"
import {SpotifyControlService} from "./server/SpotifyControlService";
import * as easymidi from "easymidi";
import * as WindowsTrayIcon from "windows-trayicon"
import * as path from "path"

const credentialsProvider: CredentialsProvider = new CredentialsProviderImpl();
const port = 42711;
const spotifyService = new SpotifyControlService(credentialsProvider, port);

const paletteGearInputName = 'Palette Multi-function Device 0';
const paletteGearInput = new easymidi.Input(paletteGearInputName, false);

const myTrayApp = new WindowsTrayIcon({
    title: "Palette Spotify Control",
    icon: path.resolve(__dirname, "icon.ico"),
    menu: [
        {
            id: "exit",
            caption: "Exit app"
        }
    ]
});

myTrayApp.item((id) => {
    switch (id) {
        case "exit": {
            console.log("Closing now.");
            myTrayApp.exit();
            process.exit(0);
            break;
        }
    }
});

function setupServer() {
    const app = express();
    const router = express.Router();

    router.get(`/${SpotifyControlService.callbackURL}`, (req, res) => {
        spotifyService.login(req.query.code.toString());
        res.send("<p>OK. This window may now be closed.</p>")
    });

    app.use('/', router);
    app.use(express.static("client"));
    app.listen(port);
    console.log(`Started server on port ${port}.`)
}

function setupServices() {
    console.log("Started service setup...");

    spotifyService.connect();

    console.log("Finished service setup!");
}

function startReaction() {

    console.log("Starting reaction now.");

    paletteGearInput.on('cc', function (msg) {
        if (msg.channel === 0) {
            const newVolume = Math.ceil(msg.value / 128 * 100);
            spotifyService.setVolume(newVolume);
        }
    });
}

setupServer();
setupServices();
startReaction();