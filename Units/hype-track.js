import * as config from "./npaoconfig.js";
import { isFirstGM } from "./misc.js";
import * as Playback from "./hypePlayback.js";

export default class HypeTrack {
  constructor() {
    this.playlist = game.playlists.find((s) => s.name === "Hype Tracks");
    this.pausedSounds = [];
  }

  /* -------------------------------------------- */
  /*                 Hook Handlers                */
  /* -------------------------------------------- */

  static _onUpdateCombat(combat, update, options, userId) {
    if (game.npao.hypeTrack) {
      game.npao.hypeTrack._processHype(combat, update);
    }
  }

  static _onDeleteCombat(combat, options, userId) {
    if (game.npao.hypeTrack) {
      game.npao.hypeTrack._stopHypeTrack();
    }
  }

  // static _onRenderActorSheet(app, html, data) {
  //   if (game.npao.hypeTrack) {
  //     game.npao.hypeTrack._addHypeButton(app, html, data);
  //   }
  // }
  /**
   * Checks for the existence of the Hype Track actor flag, then plays the track
   * @param {Object} combat - the combat instance
   * @param {*} update - the update data
   */
  async _processHype(combat, update) {
    // Stop any active hype tracks
    if (this.playlist?.playing) await this.playlist.stopAll();
    if (
      combat?.current?.round == 0 ||
      !Number.isNumeric(update.turn) ||
      !combat.combatants?.contents?.length ||
      !this.playlist ||
      !isFirstGM()
    ) {
      return;
    }

    // Find the hype track
    const playlist = this.playlist?.id;
    let combatantNm = [];
    const isPC = combat?.combatant?.hasPlayerOwner;
    if (isPC == false) {
      combatantNm = "NPC";
    } else {
      combatantNm = combat?.combatant?.name;
    }

    const track = this.playlist.sounds.find((s) => s.name === combatantNm).id;
    if (!track || track == "") {
      if (this?.pausedSounds?.length) {
        // Resume any previously paused sounds
        this._resumeOthers();
      }
      return;
    }

    // pause active playlists
    const paused = await Playback.pauseAll();
    this.pausedSounds = paused
      ? this.pausedSounds.concat(paused)
      : this.pausedSounds;
    await Playback.playTrack(track, playlist);

    const hypePlaylist = game.playlists.get(playlist);
    const hypeTrackSound = hypePlaylist?.sounds?.get(track);

    hypeTrackSound?.sound?.on(
      "end",
      () => {
        this._resumeOthers();
      },
      { once: true }
    );
  }
  /**
   * Resumes previously paused sounds
   */
  _resumeOthers() {
    Playback.resumeSounds(this.pausedSounds);
    this.pausedSounds = [];
  }

  /**
   * Plays a hype track for the provided actor
   * @param {*} actor
   */
  async playHype(actor, { warn = true, pauseOthers = false } = {}) {
    if (typeof actor === "string") {
      actor = game.actors.getName(actor) || null;
    } else if (!(actor instanceof Actor) && actor instanceof Object) {
      actor = game.actors.getName(actor.name) || null;
    }

    if (!actor) {
      if (warn) ui.notifications.warn(game.i18n.localize("No actor!"));
      return;
    }

    const hypeTrack = this._getActorHypeTrack(actor);

    if (!hypeTrack) {
      if (warn) ui.notifications.warn(game.i18n.localize("No track!"));
      return;
    }

    const playlist =
      this.playlist ||
      game.playlists.contents.find(
        (p) =>
          p.name === config.HYPETRACK_CONFIG.HypeTrack.playlistName ||
          p.sounds.find((s) => s.id === hypeTrack)
      ) ||
      null;

    if (!playlist) {
      if (warn) ui.notifications.warn(game.i18n.localize("No playlist!"));
    }

    const playedTrack = await Playback.playTrack(hypeTrack, playlist.id);

    return playedTrack;
  }
}
/**
 * Get the Hype Track flag if it exists on an actor
 * @param {*} actor
 *
 */
//   _getActorHypeTrack(actor) {
//     return getProperty(
//       actor,
//       `flags.${config.moduleName}.${config.HYPETRACK_CONFIG.HypeTrack.flagNames.track}`
//     );
//   }

//   /**
//    * Sets the Hype Track
//    * @param {Number} trackId - Id of the track in the playlist
//    */
//   async _setActorHypeTrack(actor, trackId) {
//     return await actor.update({
//       [`flags.${config.moduleName}.${config.HYPETRACK_CONFIG.HypeTrack.flagNames.track}`]:
//         trackId,
//     });
//   }

//   /**
//    * Gets the Hype Flags
//    * @param {Actor} actor
//    * @returns {Object} the Hype flags object
//    */
//   _getActorHypeFlags(actor) {
//     return actor?.flags[config.moduleName];
//   }

//   /**
//    * Sets the Hype Flags
//    * @param {String} trackId - Id of the track in the playlist
//    */
//   async _setActorHypeFlags(actor, playlistId, trackId) {
//     return await actor.update({
//       [`flags.${config.moduleName}.${config.HYPETRACK_CONFIG.HypeTrack.flagNames.playlist}`]:
//         playlistId,
//       [`flags.${config.moduleName}.${config.HYPETRACK_CONFIG.HypeTrack.flagNames.track}`]:
//         trackId,
//     });
//   }

//   /**
//    * Adds a button to the Actor sheet to open the Hype Track form
//    * @param {Object} app
//    * @param {Object} html
//    * @param {Object} data
//    */
//   async _addHypeButton(app, html, data) {
//     if (!game.user.isGM && !app?.document?.isOwner) {
//       return;
//     }

//     const enabled = game.settings.get(
//       config.moduleName,
//       config.SETTINGS_KEYS.HypeTrack.enable
//     );

//     if (!enabled) {
//       return;
//     }

//     /**
//      * Hype Button html literal
//      * @todo replace with a template instead
//      */
//     const hypeButton = $(
//       `<a class="${config.HYPETRACK_CONFIG.HypeTrack.name}" title="${config.HYPETRACK_CONFIG.HypeTrack.aTitle}">
//                 <i class="${config.HYPETRACK_CONFIG.HypeTrack.buttonIcon}"></i>
//                 <span> ${config.HYPETRACK_CONFIG.HypeTrack.buttonText}</span>
//             </a>`
//     );

//     if (html.find(`.${config.HYPETRACK_CONFIG.HypeTrack.name}`).length > 0) {
//       return;
//     }

//     /**
//      * Finds the header and the close button
//      */
//     const windowHeader = html.find(".window-header");
//     const windowCloseBtn = windowHeader.find(".close");

//     /**
//      * Create an instance of the hypeButton before the close button
//      */
//     windowCloseBtn.before(hypeButton);

//     /**
//      * Register a click listener that opens the Hype Track form
//      */
//     hypeButton.on("click", (event) => {
//       const flags = this._getActorHypeFlags(app.document);
//       this._openTrackForm(app.document, flags, { closeOnSubmit: true });
//     });
//   }

//   /**
//    * Opens the Hype Track form
//    * @param {Object} actor  the actor object
//    * @param {Object} track  any existing track for this actor
//    * @param {Object} options  form options
//    */
//   _openTrackForm(actor, flags, options) {
//     const data = {
//       track: flags?.track ?? "",
//       playlist: flags?.playlist ?? this.playlist?.id,
//     };
//     new HypeTrackActorForm(actor, data, options).render(true);
//   }

//   async _stopHypeTrack() {
//     if (!this.playlist || !isFirstGM()) return;

//     // Stop the playlist if it is playing
//     if (this.playlist.playing) {
//       await this.playlist.stopAll();
//       ui.playlists.render();
//     }

//     // Stop any sounds playing individually
//     const playingSounds = this.playlist.sounds.filter(
//       (s) => s.playing || s.pausedTime
//     );
//     const updates = playingSounds.map((s) => {
//       return {
//         _id: s.id,
//         playing: false,
//         pausedTime: null,
//       };
//     });

//     await this.playlist.updateEmbeddedDocuments("PlaylistSound", updates);
//     ui.playlists.render();
//   }
// }

// /**
//  * A FormApplication for setting the Actor's Hype Track
//  */
// class HypeTrackActorForm extends FormApplication {
//   constructor(actor, data, options) {
//     super(data, options);
//     this.actor = actor;
//     this.data = data;
//   }

//   /**
//    * Default Options for this FormApplication
//    */
//   static get defaultOptions() {
//     return foundry.utils.mergeObject(super.defaultOptions, {
//       id: "hype-track-form",
//       title: config.HYPETRACK_CONFIG.HypeTrack.aTitle,
//       template: config.HYPETRACK_CONFIG.HypeTrack.templatePath,
//       classes: ["sheet"],
//       width: 500,
//     });
//   }

//   /**
//    * Provide data to the handlebars template
//    */
//   async getData() {
//     return {
//       playlistSounds: Playback.getPlaylistSounds(this.data.playlist),
//       track: this.data.track,
//       playlist: this.data.playlist,
//       playlists: game.playlists,
//     };
//   }

//   /**
//    * Executes on form submission.
//    * Set the Hype Track flag on the specified Actor
//    * @param {Object} event - the form submission event
//    * @param {Object} formData - the form data
//    */
//   async _updateObject(event, formData) {
//     await game.npao.hypeTrack._setActorHypeFlags(
//       this.actor,
//       formData.playlist,
//       formData.track
//     );
//   }

//   /**
//    * Activates listeners on the form html
//    * @param {*} html
//    */
//   activateListeners(html) {
//     super.activateListeners(html);

//     const playlistSelect = html.find(".playlist-select");
//     playlistSelect.on("change", (event) => this._onPlaylistChange(event));
//   }

//   /**
//    * Playlist select change handler
//    * @param {*} event
//    */
//   _onPlaylistChange(event) {
//     event.preventDefault();
//     this.data.playlist = event.target.value;
//     this.render();
//   }

//   _getPlaylistSounds(playlistId) {
//     if (!playlistId || typeof playlistId != "string") return;

//     const playlist = game.playlists.get(playlistId);

//     if (!playlist) return;

//     return playlist.sounds;
//   }
// }
