import {CredentialsProviderImpl} from "./server/secret/CredentialsProviderImpl";
import * as express from "express"
import {SpotifyControlService} from "./server/SpotifyControlService";


const credentialsProvider: CredentialsProvider = new CredentialsProviderImpl();
const port = 42711;

const spotifyService = new SpotifyControlService(credentialsProvider, port);

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

setupServer();
setupServices();