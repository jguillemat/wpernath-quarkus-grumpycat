import {
    audio,
    loader,
    state,
    device,
    video,
    utils,
    game,
    plugin,
    Vector2d,    
    TextureAtlas,
    pool,
} from 'melonjs/dist/melonjs.module.js';

import 'index.css';

import TitleScreen from 'js/stage/title.js';
import PlayScreen from 'js/stage/play.js';
import GetReadyScreen from './js/stage/get-ready';
import GameOverScreen from './js/stage/game-over';
import HighscoreScreen from './js/stage/highscores';
import ReplayGameScreen from './js/stage/replay';
import DataManifest from 'manifest.js';

import CONFIG from 'config.js';
import GlobalGameState from './js/util/global-game-state';
import { LevelManager } from './js/util/level';
import NetworkManager from './js/util/network';
import { my_state } from './js/util/constants';
import ReplayChooserScreen from './js/stage/replay-chooser';
import {WayPoint, WayPath} from './js/util/walk-path';
import { GameStateAction, EnemyAction } from "./js/util/game-updates";
import {ChooseLevelScreen} from "./js/stage/choose-level";
import MultiplayerMenuScreen from './js/stage/multiplayer/mp-menu';
import SingleplayerMenuScreen from './js/stage/sp-menu';
import HostGameScreen from './js/stage/multiplayer/mp-host-game';
import JoinGameScreen from './js/stage/multiplayer/mp-join-game';
import MultiplayerLobbyScreen from './js/stage/multiplayer/mp-lobby';
import MultiplayerPlayScreen from './js/stage/multiplayer/mp-play';
import MultiplayerGameOverScreen from './js/stage/multiplayer/mp-game-over';
import { MultiplayerMessage } from './js/util/multiplayer';

import HowToPlayScreen from './js/stage/how-to-play'
import screenfull from "screenfull";
import {bindKeys, unbindKeys} from "./js/util/constants";


device.onReady(() => {

    // initialize the display canvas once the device/browser is ready
    //video.
    if (!video.init(1024, 768, { 
        parent: "screen", 
        scaleMethod: "flex-width", 
        renderer: video.AUTO, 
        subPixel: false, 
        antiAlias: true,
        doubleBuffering: true 
    })) {
		alert("Your browser does not support HTML5 canvas.");
		return;
	}


    // initialize the debug plugin in development mode.
    if (process.env.NODE_ENV === 'development') {        
        import('js/plugin/debug/debugPanel.js').then((debugPlugin) => {
            // automatically register the debug panel
            utils.function.defer(plugin.register, this, debugPlugin.DebugPanelPlugin, "debugPanel");
        });
    }

    // Initialize the audio.
    audio.init("mp3,ogg,wav");

    if( device.isMobile ) {
        if( screenfull.isEnabled ) {
            console.log("INFO: Requesting full screen...");
            screenfull.request();
        }
    }

    // allow cross-origin for image/texture loading
    let environment = "prod";
    if( process.env.NODE_ENV === 'development') {
        environment = "local";        
    }
    
    let baseURL;

    if (environment === "local") baseURL = CONFIG.local.baseURL;
    else if (environment === "prod") baseURL = CONFIG.prod.baseURL;
    
    loader.setBaseURL("tmx", baseURL);
    CONFIG.baseURL = baseURL;

    //loader.crossOrigin = "anonymous";
    // Since MelonJS 17.x
    loader.setOptions( {crossOrigin: "anonymous"})


    // initialize NetworkManager
    NetworkManager.getInstance();

    // Initialize LevelManager and read all levels
    LevelManager.getInstance().initialize(function() {        

        // set and load all resources.
        loader.preload(DataManifest, function() {
            pool.register("WayPoint", WayPoint, true);
            pool.register("WayPath", WayPath, true);
            pool.register("GameStateAction", GameStateAction, true);
            pool.register("EnemyAction", EnemyAction, true);
            //pool.register("MultiplayerMessage", MultiplayerMessage, )

            GlobalGameState.screenControlsTexture = new TextureAtlas(loader.getJSON("screen-controls"), loader.getImage("screen-controls"));

            // set the user defined game stages
            state.set(state.MENU, new TitleScreen());
            state.set(state.PLAY, new PlayScreen());
            state.set(my_state.REPLAY_GAME_CHOOSER, new ReplayChooserScreen());
            state.set(my_state.REPLAY_GAME, new ReplayGameScreen());
            state.set(my_state.CHOOSE_LEVEL, new ChooseLevelScreen());
            state.set(state.READY, new GetReadyScreen());
            state.set(state.GAMEOVER, new GameOverScreen(true));
            state.set(state.GAME_END, new GameOverScreen(false));
            state.set(state.SCORE, new HighscoreScreen());
            state.set(my_state.SINGLE_PLAYER_MENU, new SingleplayerMenuScreen());
            state.set(my_state.HOW_TO_PLAY, new HowToPlayScreen());
            
            // multiplayer states
            state.set(my_state.MULTIPLAYER_MENU, new MultiplayerMenuScreen());
            state.set(my_state.MULTIPLAYER_START_GAME, new HostGameScreen());
            state.set(my_state.MULTIPLAYER_JOIN_GAME, new JoinGameScreen());
            state.set(my_state.MULTIPLAYER_LOBBY, new MultiplayerLobbyScreen());
            state.set(my_state.MULTIPLAYER_PLAY, new MultiplayerPlayScreen());
            state.set(my_state.MULTIPLAYER_GAME_OVER, new MultiplayerGameOverScreen());

            // set the fade transition effect
            state.transition("fade", "#000000", 500);

            // bind keys
            bindKeys();
            NetworkManager.getInstance().createGameOnServer()
                .then(function() {
                    // we don't use gravity here
                    game.world.gravity = new Vector2d(0, 0);

                    // we want to use an offscreen canvas first (double buffering)
                    game.world.preRender = true;                    
                    state.change(state.MENU);
                })
                .catch(function(err) {
                    console.log(err);
                })
        });
    });
});
