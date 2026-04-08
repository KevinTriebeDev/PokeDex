const pokemonApiUrl = "https://pokeapi.co/api/v2/pokemon";
const renderStep = 20;
const searchPokemonLimit = 1000;
const minSearchLength = 3;

const textLoadMoreHtml = "&#x25BC; MEHR ANZEIGEN";
const textLoading = "LADE ...";
const textAllLoaded = "ALLES GELADEN";
const textNoPokemonFound = "Keine passenden Pokemon gefunden";
const textMinSearchLength = "Bitte mindestens 3 Buchstaben eingeben";
const textSearchError = "Fehler beim Suchen";

const dialogTabNames = ["main", "stats", "evo"];

const pokemonTypeIcons = [
  { name: "fire", icon: "🔥" },
  { name: "water", icon: "💧" },
  { name: "grass", icon: "🌿" },
  { name: "electric", icon: "⚡" },
  { name: "ice", icon: "❄️" },
  { name: "fighting", icon: "👊" },
  { name: "poison", icon: "☠️" },
  { name: "ground", icon: "🪨" },
  { name: "flying", icon: "🦅" },
  { name: "psychic", icon: "🧠" },
  { name: "bug", icon: "🐛" },
  { name: "rock", icon: "🪨" },
  { name: "ghost", icon: "👻" },
  { name: "dragon", icon: "🐉" },
  { name: "dark", icon: "🌑" },
  { name: "steel", icon: "⚙️" },
  { name: "fairy", icon: "✨" },
  { name: "normal", icon: "⭕" },
];
