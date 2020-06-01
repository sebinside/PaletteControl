import * as SpotifyWebApi from "spotify-web-api-node"
import * as open from "open"

export class SpotifyControlService {

    static readonly scopes = ["user-modify-playback-state"];
    static readonly callbackURL = "spotifycallback";
    static readonly defaultState = "palettecontrol-login";

    private spotifyApi: SpotifyWebApi = null;

    constructor(private readonly credentialsProvider: CredentialsProvider, private readonly port: Number) {
    }

    connect() {
        console.log("Spotify service connecting...");
        this.spotifyApi = new SpotifyWebApi({
            clientId: this.credentialsProvider.spotifyClientId,
            clientSecret: this.credentialsProvider.spotifySecret,
            redirectUri: `http://localhost:${this.port}/${SpotifyControlService.callbackURL}`
        });

        const authorizeURL = this.spotifyApi.createAuthorizeURL(SpotifyControlService.scopes, SpotifyControlService.defaultState);
        open(authorizeURL).then();
    }

    login(authCode: String) {
        this.spotifyApi.authorizationCodeGrant(authCode).then(
            data => {
                console.log("Spotify login successful!");
                this.spotifyApi.setAccessToken(data.body['access_token']);
                this.spotifyApi.setRefreshToken(data.body['refresh_token']);

                this.startRefreshing();
            },
            err => console.log('Spotify login error.', err)
        );
    }

    setVolume(volume: number) {
        if (this.spotifyApi == null) {
            return null;
        }
        this.spotifyApi.setVolume(volume)
            .then(() => {
               console.log(`Changed volume to ${volume}%.`);
            }, error => {
                console.log("Error while changing volume.", error);
            });
    }

    private startRefreshing() {
        setInterval(() => {
            this.spotifyApi.refreshAccessToken().then(
                data => {
                    console.log('The spotify access token has been refreshed!');

                    // Save the access token so that it's used in future calls
                    this.spotifyApi.setAccessToken(data.body['access_token']);
                },
                error => {
                    console.log('Could not spotify refresh access token', error);
                }
            )
        }, 1800000)
    }
}