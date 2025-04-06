//================================================================================
import * as config from "../Units/npaoconfig.js";
import { NPAOSettings } from "../Units/settings.js";
import HypeTrack from "../Units/hype-track.js";
import * as Playback from "../Units/hypePlayback.js";
import * as Misc from "../Units/misc.js";

Hooks.once("init", async function () {
  game.npao = {};
  NPAOSettings.InitSettings();
});

//-------------------------------------------------
Hooks.once("ready", async function () {
  game.npao.hypeTrack = new HypeTrack();
});

//-------------------------------------------------
Hooks.on("preUpdatePlaylistSound", (sound, update, options, userId) => {
  Misc._onPreUpdatePlaylistSound(sound, update, options, userId);
});

//-------------------------------------------------
Hooks.on("updateCombat", (combat, update, options, userId) => {
  HypeTrack._onUpdateCombat(combat, update, options, userId);
});

//-------------------------------------------------
Hooks.on("deleteCombat", (combat, options, userId) => {
  HypeTrack._onDeleteCombat(combat, options, userId);
});

//-------------------------------------------------
Hooks.on("renderActorSheet", (app, html, data) => {
  HypeTrack._onRenderActorSheet(app, html, data);
});

//-------------------------------------------------
Hooks.on("renderPlaylistDirectory", (app, html, data) => {
  Misc._onRenderPlaylistDirectory(app, html, data);
});
