export const moduleName = "npao-hypetrax";
export const HYPETRACK_CONFIG = {
  get HypeTrack() {
    return {
      name: "hype-track",
      playlistName: "Hype Tracks",
      buttonIcon: "fas fa-music",
      buttonText: " Hype",
      aTitle: "Change Actor Hype Track",
      flagNames: {
        playlist: "playlist",
        track: "track",
      },
      templatePath: "./modules/npao-core/templates/hypetrackform.html",
    };
  },

  get PlaylistLoop() {
    return {
      flagNames: {
        loop: "playlist-loop",
        previousSound: "previous-sound",
      },
    };
  },
};
export const FLAGS = {
  get CombatTrack() {
    return {
      combatStarted: "combatStarted",
    };
  },
};
export const SETTINGS_KEYS = {
  get HypeTrack() {
    return {
      enable: "enableHypeTrack",
      pauseOthers: "pauseOtherSounds",
    };
  },
};
export const rootStyle = document.querySelector(":root").style;
export const debouncedReload = foundry.utils.debounce(
  () => window.location.reload(),
  100
);
