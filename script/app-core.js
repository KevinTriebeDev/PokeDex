let renderedPokemonCount = 0;
let isLoadingPokemon = false;
let hasMorePokemon = true;
let currentDialogPokemonId = 0;
let loadedPokemonList = [];
let searchResults = [];
let isSearchMode = false;
let cachedPokemonNameList = [];
let currentSearchText = "";
let pokemonGridElement;
let loadingScreenElement;
let displayContentElement;
let showMoreButtonElement;
let dialogElement;
let lastFocusedCard;
let aHintDialogTimeoutId = null;

function wait(milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, milliseconds);
  });
}

function getElement(id) {
  return document.getElementById(id);
}

function hasValueInArray(list, value) {
  for (let i = 0; i < list.length; i++) {
    if (list[i] === value) {
      return true;
    }
  }
  return false;
}

function getPokemonTypeIcon(typeName) {
  for (let i = 0; i < pokemonTypeIcons.length; i++) {
    const typeData = pokemonTypeIcons[i];
    if (typeData.name === typeName) {
      return typeData.icon;
    }
  }
  return "●";
}

function formatPokemonName(name) {
  if (!name) {
    return "Unknown";
  }
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");
}

function getPokemonTheme(types) {
  if (!types || types.length === 0) {
    return "normal";
  }
  return types[0];
}

function createTypeBadgeHtml(typeName) {
  const icon = getPokemonTypeIcon(typeName);
  return (
    '<span class="type-badge ' +
    typeName +
    '" title="' +
    typeName +
    '">' +
    icon +
    "</span>"
  );
}

function createTypeBadgesHtml(types) {
  let badgesHtml = "";
  for (let i = 0; i < types.length; i++) {
    const typeName = types[i];
    badgesHtml += createTypeBadgeHtml(typeName);
  }
  return badgesHtml;
}

function createPokemonImageHtml(pokemon) {
  const formattedName = formatPokemonName(pokemon.name);
  if (!pokemon.image) {
    return '<div class="pokemon-sprite">?</div>';
  }
  return (
    '<img class="pokemon-image" src="' +
    pokemon.image +
    '" alt="' +
    formattedName +
    '">'
  );
}

function createCardTopHtml(pokemon) {
  const formattedName = formatPokemonName(pokemon.name);
  return (
    '<div class="pokemon-card-top"><span class="pokemon-number">#' +
    pokemon.number +
    '</span><span class="pokemon-name">' +
    formattedName +
    "</span></div>"
  );
}

function createCardVisualHtml(pokemon) {
  const imageHtml = createPokemonImageHtml(pokemon);
  return '<div class="pokemon-visual">' + imageHtml + "</div>";
}

function createCardBottomHtml(pokemon) {
  const typeBadgesHtml = createTypeBadgesHtml(pokemon.types);
  return '<div class="pokemon-card-bottom">' + typeBadgesHtml + "</div>";
}

function createPokemonCardHtml(pokemon) {
  const topHtml = createCardTopHtml(pokemon);
  const visualHtml = createCardVisualHtml(pokemon);
  const bottomHtml = createCardBottomHtml(pokemon);
  const pokemonTheme = getPokemonTheme(pokemon.types);
  return buildPokemonCardMarkup(
    pokemonTheme,
    pokemon.number,
    topHtml,
    visualHtml,
    bottomHtml,
  );
}

function getOfficialArtworkUrl(pokemonDetail) {
  if (!pokemonDetail.sprites.other) {
    return "";
  }
  if (!pokemonDetail.sprites.other["official-artwork"]) {
    return "";
  }
  return pokemonDetail.sprites.other["official-artwork"].front_default || "";
}

function getPokemonImageUrl(pokemonDetail) {
  const officialArtworkUrl = getOfficialArtworkUrl(pokemonDetail);
  if (officialArtworkUrl) {
    return officialArtworkUrl;
  }
  if (pokemonDetail.sprites.front_default) {
    return pokemonDetail.sprites.front_default;
  }
  return (
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" +
    pokemonDetail.id +
    ".png"
  );
}

function getPokemonTypes(pokemonDetail) {
  const types = [];
  for (let i = 0; i < pokemonDetail.types.length; i++) {
    const typeEntry = pokemonDetail.types[i];
    types.push(typeEntry.type.name);
  }
  return types;
}

function createSimplePokemonData(pokemonDetail) {
  return {
    number: pokemonDetail.id,
    name: pokemonDetail.name,
    image: getPokemonImageUrl(pokemonDetail),
    types: getPokemonTypes(pokemonDetail),
  };
}

function buildPokemonGridHtml(pokemonList) {
  let pokemonCardsHtml = "";
  for (let i = 0; i < pokemonList.length; i++) {
    const pokemon = pokemonList[i];
    pokemonCardsHtml += createPokemonCardHtml(pokemon);
  }
  return pokemonCardsHtml;
}

function renderPokemonGrid(pokemonList) {
  if (!pokemonGridElement) {
    return;
  }
  pokemonGridElement.innerHTML = buildPokemonGridHtml(pokemonList);
}

function appendPokemonToGrid(pokemonList) {
  if (!pokemonGridElement) {
    return;
  }
  pokemonGridElement.innerHTML += buildPokemonGridHtml(pokemonList);
}

function showGridMessage(messageText) {
  if (!pokemonGridElement) {
    return;
  }
  pokemonGridElement.innerHTML =
    '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #aaa;">' +
    messageText +
    "</div>";
}

function addLoadingClasses() {
  if (displayContentElement) {
    displayContentElement.classList.add("is-loading");
  }
  if (pokemonGridElement) {
    pokemonGridElement.classList.add("hidden");
  }
}

function removeLoadingClasses() {
  if (displayContentElement) {
    displayContentElement.classList.remove("is-loading");
  }
  if (pokemonGridElement) {
    pokemonGridElement.classList.remove("hidden");
  }
}

function setDisplayLoadingState(isLoading) {
  if (!loadingScreenElement) {
    return;
  }
  if (isLoading) {
    addLoadingClasses();
    loadingScreenElement.classList.remove("hidden");
    return;
  }
  removeLoadingClasses();
  loadingScreenElement.classList.add("hidden");
}

function resetAppState() {
  renderedPokemonCount = 0;
  isLoadingPokemon = false;
  hasMorePokemon = true;
  currentDialogPokemonId = 0;
  loadedPokemonList = [];
  searchResults = [];
  isSearchMode = false;
  currentSearchText = "";
}

function renderAppTemplate() {
  if (!document.body) {
    return false;
  }
  document.body.innerHTML = appTemplate;
  return true;
}

function startInitialLoad() {
  resetAppState();
  bindEvents();
  setDisplayLoadingState(true);
  updateShowMoreButton();
  loadMorePokemon();
}

function init() {
  if (!renderAppTemplate()) {
    return;
  }
  updateHudLayoutOffsets();
  pokemonGridElement = getElement("pokemon-grid");
  loadingScreenElement = getElement("loading-screen");
  displayContentElement = getElement("display-content");
  showMoreButtonElement = getElement("show-more-btn");
  dialogElement = getElement("pokemon-dialog");
  addResizeEvent();
  startInitialLoad();
}

function updateHudLayoutOffsets() {
  const headerElement = document.querySelector(".hud-header");
  const controlsElement = document.querySelector(".hud-controls");
  if (headerElement) {
    document.documentElement.style.setProperty(
      "--hud-header-height",
      headerElement.offsetHeight + "px",
    );
  }
  if (controlsElement) {
    document.documentElement.style.setProperty(
      "--hud-controls-height",
      controlsElement.offsetHeight + "px",
    );
  }
}

function addResizeEvent() {
  window.addEventListener("resize", updateHudLayoutOffsets);
}
