import * as config from "./npaoconfig.js";
import * as Misc from "../Units/misc.js";

export class NPAOSettings {
  static InitSettings() {
    game.settings.register(config.moduleName, "enableHypeTrack", {
      name: game.i18n.format("Enable hype tracks [GM]"),
      hint: game.i18n.format(
        "Play hype tracks at start of players' combat turns"
      ),
      scope: "world",
      type: Boolean,
      default: false,
      config: true,
    });
  }
}
