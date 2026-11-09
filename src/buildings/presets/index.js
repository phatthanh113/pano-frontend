import exterior from "./exterior.js";
import medicalDeck from "./medical-deck.js";
import cafe from "./cafe.js";
import new1 from "./new1.js";

export const buildingPresets = {
  exterior,
  "medical-deck": medicalDeck,
  cafe,
  new1,
};

export const buildingPresetList = Object.values(buildingPresets);

export default buildingPresets;
