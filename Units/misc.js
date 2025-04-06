import * as config from "./npaoconfig.js";
import * as Playback from "./hypePlayback.js";
import { NPAOSettings } from "../Units/settings.js";

//====================================================================
//  Hype track functions
//====================================================================

export function _onRenderPlaylistDirectory(app, html, data) {
  _addPlaylistLoopToggle(html);
}

/**
 * Adds a new toggle for loop to the playlist controls
 * @param {*} html
 */
function _addPlaylistLoopToggle(html) {
  if (!game.user.isGM) return;

  const playlistModeButtons = html.find('[data-action="playlist-mode"]');
  const loopToggleHtml = `<a class="sound-control" data-action="playlist-loop" title="ButtonTooltipLoop">
            <i class="fas fa-sync"></i>
        </a>`;

  playlistModeButtons.after(loopToggleHtml);

  const loopToggleButtons = html.find('[data-action="playlist-loop"]');

  if (loopToggleButtons.length === 0) {
    return;
  }

  // Widen the parent div
  const controlsDiv = loopToggleButtons.closest(".playlist-controls");
  controlsDiv.css("flex-basis", "110px");

  for (const button of loopToggleButtons) {
    const buttonClass = button.getAttribute("class");
    const buttonTitle = button.getAttribute("title");

    const playlistDiv = button.closest(".document");
    const playlistId = playlistDiv.getAttribute("data-document-id");
    const playlist = game.playlists.get(playlistId);

    const loop = playlist.getFlag(
      config.moduleName,
      config.HYPETRACK_CONFIG.PlaylistLoop.flagNames.loop
    );
    const mode = playlist.mode;
    if ([-1, 2].includes(mode)) {
      button.setAttribute("class", buttonClass.concat(" disabled"));
      button.setAttribute("title", game.i18n.localize("ButtonTooltipDisabled"));
    } else if (loop === false) {
      button.setAttribute("class", buttonClass.concat(" inactive"));
      button.setAttribute("title", game.i18n.localize("ButtonTooltipNoLoop"));
    }
  }

  loopToggleButtons.on("click", (event) => {
    const button = event.currentTarget;
    const buttonClass = button.getAttribute("class");

    if (!buttonClass) {
      return;
    }

    const playlistDiv = button.closest(".document");
    const playlistId = playlistDiv.getAttribute("data-document-id");

    if (!playlistId) {
      return;
    }

    if (buttonClass.includes("inactive")) {
      game.playlists
        .get(playlistId)
        .unsetFlag(
          config.moduleName,
          config.HYPETRACK_CONFIG.PlaylistLoop.flagNames.loop
        );
      button.setAttribute("class", buttonClass.replace(" inactive", ""));
      button.setAttribute("title", game.i18n.localize("ButtonTooltipLoop"));
    } else {
      game.playlists
        .get(playlistId)
        .setFlag(
          config.moduleName,
          config.HYPETRACK_CONFIG.PlaylistLoop.flagNames.loop,
          false
        );
      button.setAttribute("class", buttonClass.concat(" inactive"));
      button.setAttribute("title", game.i18n.localize("ButtonTooltipNoLoop"));
    }
  });
}

/**
 * PreUpdate Playlist Sound handler
 * @param {*} playlist
 * @param {*} update
 * @todo maybe return early if no flag set?
 */
export function _onPreUpdatePlaylistSound(sound, update, options, userId) {
  // skip this method if the playlist sound has already been processed
  if (sound?._maestroSkip) return true;

  sound._maestroSkip = true;
  const playlist = sound.parent;
  // Return if there's no id or the playlist is not in sequential or shuffle mode
  if (!playlist?.playing || !update?.id || ![0, 1].includes(playlist?.mode)) {
    return true;
  }

  // If the update is a sound playback ending, save it as the previous track and return
  if (update?.playing === false) {
    playlist.setFlag(
      config.moduleName,
      config.HYPETRACK_CONFIG.PlaylistLoop.flagNames.previousSound,
      update.id
    );
    return true;
  }

  // Otherwise it must be a sound playback starting:
  const previousSound = playlist.getFlag(
    config.moduleName,
    config.HYPETRACK_CONFIG.PlaylistLoop.flagNames.previousSound
  );

  if (!previousSound) return true;

  let order;

  // If shuffle order exists, use that, else map the sounds to an order
  if (playlist?.mode === 1) {
    order = playlist.playbackOrder;
  } else {
    order = playlist?.sounds.map((s) => s.id);
  }

  const previousIdx = order.indexOf(previousSound);
  const playlistloop = playlist.getFlag(
    config.moduleName,
    config.HYPETRACK_CONFIG.PlaylistLoop.flagNames.loop
  );

  // If the previous sound was the last in the order, and playlist loop is set to false, don't play the incoming sound
  if (previousIdx === playlist?.sounds?.length - 1 && playlistloop === false) {
    update.playing = false;
    playlist.playing = false;
  }
}

/**
 * Gets the first (sorted by userId) active GM user
 * @returns {User | undefined} the GM user document or undefined if none found
 */
export function getFirstActiveGM() {
  return game.users
    .filter((u) => u.isGM && u.active)
    .sort((a, b) => a.id?.localeCompare(b.id))
    .shift();
}

/**
 * Checks if the current user is the first active GM user
 * @returns {Boolean} Boolean indicating whether the user is the first active GM or not
 */
export function isFirstGM() {
  return game.userId === getFirstActiveGM()?.id;
}

export function exclusiveAudio(playerNames, playlistName, audioFile) {
  const playlist = game.playlists.getName(playlistName);
  if (!playlist) {
    console.log("Playlist ${playlistName} not found!");
    return;
  }
  const sound = playlist.sounds.find((a) => a.name === audioFile);
  if (!sound) {
    console.log(
      "Audio file ${audioFile} not found in playlist ${playlistName}!"
    );
    return;
  }
  const soundData = {
    src: sound.path,
    volume: sound.volume,
    autoplay: true,
    loop: sound.loop,
  };
  playerNames.forEach((u) => {
    let player = game.users.find((user) => user.name === u);
    if (!player) {
      console.log("Player ${u} not found!");
    } else {
      console.log(
        `Sending src: ${sound.path} exclusively to ${u} - user ${player.id} - at volume ${soundData.volume}`
      );
      game.socket.emit("module.npao-core", {
        action: "playSound",
        data: soundData,
        userId: player.id,
      });
    }
  });
}
