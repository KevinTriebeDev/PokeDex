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

function wait(milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, milliseconds);
  });
}

function getElement(id) {
  return document.getElementById(id);
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
  pokemonGridElement = getElement("pokemon-grid");
  loadingScreenElement = getElement("loading-screen");
  displayContentElement = getElement("display-content");
  showMoreButtonElement = getElement("show-more-btn");
  dialogElement = getElement("pokemon-dialog");
  startInitialLoad();
}

function handleGridClick(event) {
  const clickedCard = findPokemonCardElement(event.target);
  if (!clickedCard) {
    return;
  }
  const pokemonId = clickedCard.getAttribute("data-pokemon-id");
  if (!pokemonId) {
    return;
  }
  openPokemonDialog(pokemonId);
}

function findPokemonCardElement(startElement) {
  let currentElement = startElement;
  while (currentElement && currentElement !== document.body) {
    if (
      currentElement.classList &&
      currentElement.classList.contains("pokemon-card")
    ) {
      return currentElement;
    }
    currentElement = currentElement.parentElement;
  }
  return null;
}

function addShowMoreEvent() {
  if (showMoreButtonElement) {
    showMoreButtonElement.addEventListener("click", loadMorePokemon);
  }
}

function addGridClickEvent() {
  if (pokemonGridElement) {
    pokemonGridElement.addEventListener("click", handleGridClick);
  }
}

function addDialogOverlayClickEvent() {
  if (!dialogElement) {
    return;
  }
  dialogElement.addEventListener("click", function (event) {
    if (event.target === dialogElement) {
      closePokemonDialog();
    }
  });
}

function addCloseButtonEvent() {
  const closeButton = getElement("dialog-close-btn");
  if (closeButton) {
    closeButton.addEventListener("click", closePokemonDialog);
  }
}

function addPrevButtonEvent() {
  const prevButton = getElement("dialog-prev-btn");
  if (prevButton) {
    prevButton.addEventListener("click", function () {
      navigateDialogPokemon(-1);
    });
  }
}

function addNextButtonEvent() {
  const nextButton = getElement("dialog-next-btn");
  if (nextButton) {
    nextButton.addEventListener("click", function () {
      navigateDialogPokemon(1);
    });
  }
}

function addTabButtonEvents() {
  const tabButtons = document.getElementsByClassName("dialog-tab");
  for (let i = 0; i < tabButtons.length; i++) {
    const button = tabButtons[i];
    button.addEventListener("click", function () {
      setDialogTab(button.getAttribute("data-tab"));
    });
  }
}

function addSearchInputEvent() {
  const searchInput = getElement("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      searchPokemon(searchInput.value);
    });
  }
}

function addSearchButtonEvent() {
  const searchInput = getElement("search-input");
  const searchButton = getElement("search-btn");
  if (searchButton && searchInput) {
    searchButton.addEventListener("click", function () {
      searchPokemon(searchInput.value);
    });
  }
}

function addGridKeyboardEvent() {
  if (pokemonGridElement) {
    pokemonGridElement.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        handleGridClick(event);
      }
    });
  }
}

function bindEvents() {
  addShowMoreEvent();
  addGridClickEvent();
  addGridKeyboardEvent();
  addDialogKeyboardEvent();
  addDialogOverlayClickEvent();
  addCloseButtonEvent();
  addPrevButtonEvent();
  addNextButtonEvent();
  addTabButtonEvents();
  addSearchInputEvent();
  addSearchButtonEvent();
}

function getRenderedPokemonIds() {
  const renderedIds = [];
  const pokemonCards = document.getElementsByClassName("pokemon-card");
  for (let i = 0; i < pokemonCards.length; i++) {
    const pokemonCard = pokemonCards[i];
    const cardIdText = pokemonCard.getAttribute("data-pokemon-id");
    const cardIdNumber = parseInt(cardIdText, 10);
    if (!Number.isNaN(cardIdNumber)) {
      renderedIds.push(cardIdNumber);
    }
  }
  return renderedIds;
}

function hideAllDialogArrows() {
  const prevButton = getElement("dialog-prev-btn");
  const nextButton = getElement("dialog-next-btn");
  if (prevButton) {
    prevButton.classList.add("hidden");
  }
  if (nextButton) {
    nextButton.classList.add("hidden");
  }
}

function toggleDialogArrow(buttonId, shouldHide) {
  const button = getElement(buttonId);
  if (!button) {
    return;
  }
  if (shouldHide) {
    button.classList.add("hidden");
    return;
  }
  button.classList.remove("hidden");
}

function updateDialogNavigation() {
  const renderedIds = getRenderedPokemonIds();
  const currentIndex = renderedIds.indexOf(currentDialogPokemonId);
  if (currentIndex === -1) {
    hideAllDialogArrows();
    return;
  }
  toggleDialogArrow("dialog-prev-btn", currentIndex <= 0);
  toggleDialogArrow("dialog-next-btn", currentIndex >= renderedIds.length - 1);
}

function navigateDialogPokemon(direction) {
  const renderedIds = getRenderedPokemonIds();
  const currentIndex = renderedIds.indexOf(currentDialogPokemonId);
  if (currentIndex === -1) {
    return;
  }
  const nextIndex = currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= renderedIds.length) {
    return;
  }
  openPokemonDialog(renderedIds[nextIndex]);
}

function unlockDisplayScroll() {
  if (displayContentElement) {
    displayContentElement.classList.remove("dialog-open");
  }
}

function lockDisplayScroll() {
  if (displayContentElement) {
    displayContentElement.classList.add("dialog-open");
  }
}

function closePokemonDialog() {
  if (!dialogElement) {
    return;
  }
  dialogElement.classList.add("hidden");
  unlockDisplayScroll();
  if (lastFocusedCard) {
    lastFocusedCard.focus();
  }
}

function getSelectedDialogTab(tabName) {
  if (hasValueInArray(dialogTabNames, tabName)) {
    return tabName;
  }
  return "main";
}

function hasValueInArray(list, value) {
  for (let i = 0; i < list.length; i++) {
    if (list[i] === value) {
      return true;
    }
  }
  return false;
}

function updateTabButtons(selectedTab) {
  const tabButtons = document.getElementsByClassName("dialog-tab");
  for (let i = 0; i < tabButtons.length; i++) {
    const button = tabButtons[i];
    const buttonTabName = button.getAttribute("data-tab");
    if (buttonTabName === selectedTab) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  }
}

function updateTabPanels(selectedTab) {
  for (let i = 0; i < dialogTabNames.length; i++) {
    const tabName = dialogTabNames[i];
    const panel = getElement("dialog-panel-" + tabName);
    if (panel) {
      if (tabName === selectedTab) {
        panel.classList.add("active");
      } else {
        panel.classList.remove("active");
      }
    }
  }
}

function setDialogTab(tabName) {
  const selectedTab = getSelectedDialogTab(tabName);
  updateTabButtons(selectedTab);
  updateTabPanels(selectedTab);
}

function setDialogLoadingState(isLoading) {
  const dialogCard = getElement("pokemon-dialog-card");
  if (!dialogCard) {
    return;
  }
  if (isLoading) {
    dialogCard.classList.add("is-loading");
  } else {
    dialogCard.classList.remove("is-loading");
  }
}

function getArtworkUrlById(id) {
  return (
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" +
    id +
    ".png"
  );
}

function extractIdFromUrl(url) {
  if (!url) {
    return null;
  }
  const cleanUrl = url.replace(/\/$/, "");
  const urlParts = cleanUrl.split("/");
  const lastPart = urlParts[urlParts.length - 1];
  const idNumber = parseInt(lastPart, 10);
  if (Number.isNaN(idNumber)) {
    return null;
  }
  return idNumber;
}

async function fetchJson(url) {
  const response = await fetch(url);
  return response.json();
}

async function fetchPokemonById(id) {
  return fetchJson(pokemonApiUrl + "/" + id);
}

async function fetchSimplePokemonData(apiUrl) {
  const pokemonDetail = await fetchJson(apiUrl);
  return createSimplePokemonData(pokemonDetail);
}

function setDialogHeadType(typeNames) {
  const dialogHead = getElement("dialog-head");
  const primaryType = typeNames.length > 0 ? typeNames[0] : "normal";
  if (dialogHead) {
    dialogHead.className = "dialog-head " + primaryType;
  }
}

function setDialogMainTexts(pokemonDetail) {
  const idText = getElement("dialog-pokemon-id");
  const nameText = getElement("dialog-pokemon-name");
  if (idText) {
    idText.textContent = "#" + pokemonDetail.id;
  }
  if (nameText) {
    nameText.textContent = formatPokemonName(pokemonDetail.name);
  }
}

function setDialogMainImage(pokemonDetail) {
  const image = getElement("dialog-pokemon-image");
  if (!image) {
    return;
  }
  image.src = getPokemonImageUrl(pokemonDetail);
  image.alt = formatPokemonName(pokemonDetail.name);
}

function setDialogMainTypes(typeNames) {
  const typeContainer = getElement("dialog-pokemon-types");
  if (typeContainer) {
    typeContainer.innerHTML = createTypeBadgesHtml(typeNames);
  }
}

function setDialogMainNumbers(pokemonDetail) {
  const heightText = getElement("dialog-height");
  const weightText = getElement("dialog-weight");
  const baseExpText = getElement("dialog-base-exp");
  if (heightText) {
    heightText.textContent = ": " + pokemonDetail.height / 10 + " m";
  }
  if (weightText) {
    weightText.textContent = ": " + pokemonDetail.weight / 10 + " kg";
  }
  if (baseExpText) {
    baseExpText.textContent = ": " + pokemonDetail.base_experience;
  }
}

function getAbilityNames(pokemonDetail) {
  const abilityNames = [];
  for (let i = 0; i < pokemonDetail.abilities.length; i++) {
    const abilityEntry = pokemonDetail.abilities[i];
    abilityNames.push(abilityEntry.ability.name);
  }
  return abilityNames;
}

function setDialogAbilities(pokemonDetail) {
  const abilitiesText = getElement("dialog-abilities");
  if (!abilitiesText) {
    return;
  }
  const abilityNames = getAbilityNames(pokemonDetail);
  abilitiesText.textContent = ": " + abilityNames.join(", ");
}

function renderDialogMainInfo(pokemonDetail) {
  const typeNames = getPokemonTypes(pokemonDetail);
  setDialogHeadType(typeNames);
  setDialogMainTexts(pokemonDetail);
  setDialogMainImage(pokemonDetail);
  setDialogMainTypes(typeNames);
  setDialogMainNumbers(pokemonDetail);
  setDialogAbilities(pokemonDetail);
}

function createStatLineHtml(statEntry) {
  const statName = statEntry.stat.name;
  const statValue = statEntry.base_stat;
  const progressWidth = Math.min(100, Math.round((statValue / 200) * 100));
  return (
    '<div class="stat-line"><span class="stat-name">' +
    statName +
    '</span><div class="stat-track"><div class="stat-fill" style="width:' +
    progressWidth +
    '%"></div></div></div>'
  );
}

function buildStatsHtml(stats) {
  let statsHtml = "";
  for (let i = 0; i < stats.length; i++) {
    const statEntry = stats[i];
    statsHtml += createStatLineHtml(statEntry);
  }
  return statsHtml;
}

function renderDialogStats(pokemonDetail) {
  const statsList = getElement("dialog-stats-list");
  if (!statsList) {
    return;
  }
  statsList.innerHTML = buildStatsHtml(pokemonDetail.stats);
}

function parseEvolutionChain(node, chainList) {
  if (!node) {
    return;
  }
  chainList.push({
    id: extractIdFromUrl(node.species.url),
    name: node.species.name,
  });
  for (let i = 0; i < node.evolves_to.length; i++) {
    const nextEvolution = node.evolves_to[i];
    parseEvolutionChain(nextEvolution, chainList);
  }
}

function removeDuplicateEvolutionEntries(chainList) {
  const uniqueChain = [];
  const usedKeys = [];
  for (let i = 0; i < chainList.length; i++) {
    const chainEntry = chainList[i];
    const key = String(chainEntry.id || chainEntry.name);
    if (!hasValueInArray(usedKeys, key)) {
      usedKeys.push(key);
      uniqueChain.push(chainEntry);
    }
  }
  return uniqueChain;
}

function createEvolutionItemHtml(evolutionEntry) {
  let imageUrl = "";
  if (evolutionEntry.id) {
    imageUrl = getArtworkUrlById(evolutionEntry.id);
  }
  const formattedName = formatPokemonName(evolutionEntry.name);
  return buildEvolutionItemMarkup(imageUrl, formattedName);
}

function buildEvolutionItemMarkup(imageUrl, formattedName) {
  const parts = [
    '<div class="evo-item"><img src="',
    imageUrl,
    '" alt="',
    formattedName,
    '"><span>',
    formattedName,
    "</span></div>",
  ];
  return parts.join("");
}

function buildEvolutionHtml(uniqueChain) {
  let evolutionHtml = "";
  for (let index = 0; index < uniqueChain.length; index += 1) {
    evolutionHtml += createEvolutionItemHtml(uniqueChain[index]);
    if (index < uniqueChain.length - 1) {
      evolutionHtml += '<span class="evo-arrow">&raquo;</span>';
    }
  }
  return evolutionHtml;
}

async function renderDialogEvolution(speciesUrl) {
  const evolutionChainElement = getElement("dialog-evo-chain");
  if (!evolutionChainElement) {
    return;
  }
  try {
    evolutionChainElement.innerHTML = await getEvolutionHtml(speciesUrl);
  } catch (error) {
    console.warn(error);
    evolutionChainElement.innerHTML =
      '<span class="evo-error">No evolution data available</span>';
  }
}

async function getEvolutionHtml(speciesUrl) {
  const speciesData = await fetchJson(speciesUrl);
  const evolutionData = await fetchJson(speciesData.evolution_chain.url);
  const chainList = [];
  parseEvolutionChain(evolutionData.chain, chainList);
  const uniqueChain = removeDuplicateEvolutionEntries(chainList);
  return buildEvolutionHtml(uniqueChain);
}

function openDialogElement() {
  if (dialogElement) {
    dialogElement.classList.remove("hidden");
  }
}

function focusFirstDialogElement() {
  const closeButton = getElement("dialog-close-btn");
  if (closeButton) {
    closeButton.focus();
  }
}

function getDialogFocusableButtons() {
  const dialogCard = getElement("pokemon-dialog-card");
  if (!dialogCard) {
    return [];
  }
  const allButtons = dialogCard.getElementsByTagName("button");
  const visibleButtons = [];
  for (let i = 0; i < allButtons.length; i++) {
    if (!allButtons[i].classList.contains("hidden")) {
      visibleButtons.push(allButtons[i]);
    }
  }
  return visibleButtons;
}

function handleDialogTabKey(event, focusable) {
  const firstElement = focusable[0];
  const lastElement = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  }
  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function handleDialogFocusTrap(event) {
  if (event.key === "Escape") {
    closePokemonDialog();
    return;
  }
  if (event.key !== "Tab") {
    return;
  }
  const focusable = getDialogFocusableButtons();
  if (focusable.length === 0) {
    return;
  }
  handleDialogTabKey(event, focusable);
}

function addDialogKeyboardEvent() {
  if (dialogElement) {
    dialogElement.addEventListener("keydown", handleDialogFocusTrap);
  }
}

function prepareDialog(pokemonId) {
  lastFocusedCard = document.activeElement;
  currentDialogPokemonId = parseInt(pokemonId, 10);
  openDialogElement();
  lockDisplayScroll();
  setDialogTab("main");
  setDialogLoadingState(true);
  updateDialogNavigation();
}

async function openPokemonDialog(pokemonId) {
  if (!dialogElement) {
    return;
  }
  prepareDialog(pokemonId);
  try {
    await fillDialogData(pokemonId);
  } catch (error) {
    console.warn(error);
  }
  setDialogLoadingState(false);
  updateDialogNavigation();
  focusFirstDialogElement();
}

async function fillDialogData(pokemonId) {
  const pokemonDetail = await fetchPokemonById(pokemonId);
  renderDialogMainInfo(pokemonDetail);
  renderDialogStats(pokemonDetail);
  await renderDialogEvolution(pokemonDetail.species.url);
}

function getPokemonListUrl() {
  return (
    pokemonApiUrl + "?limit=" + renderStep + "&offset=" + renderedPokemonCount
  );
}

function saveLoadedPokemon(nextPokemon) {
  for (let i = 0; i < nextPokemon.length; i++) {
    const pokemon = nextPokemon[i];
    loadedPokemonList.push(pokemon);
  }
  renderedPokemonCount += nextPokemon.length;
  if (nextPokemon.length === 0) {
    hasMorePokemon = false;
  }
}

async function loadPokemonBatch() {
  try {
    const listData = await fetchJson(getPokemonListUrl());
    return await createBatchFromListData(listData);
  } catch (error) {
    console.warn(error);
    return [];
  }
}

async function createBatchFromListData(listData) {
  const pokemonDetails = [];
  hasMorePokemon = listData.next !== null;
  for (let i = 0; i < listData.results.length; i++) {
    const pokemonEntry = listData.results[i];
    pokemonDetails.push(await fetchSimplePokemonData(pokemonEntry.url));
  }
  return pokemonDetails;
}

function startPokemonLoading() {
  isLoadingPokemon = true;
  setDisplayLoadingState(true);
  updateShowMoreButton();
}

function finishPokemonLoading() {
  isLoadingPokemon = false;
  setDisplayLoadingState(false);
  updateShowMoreButton();
}

async function loadMorePokemon() {
  if (isLoadingPokemon || !hasMorePokemon) {
    return;
  }
  startPokemonLoading();
  const result = await Promise.all([loadPokemonBatch(), wait(2000)]);
  const nextPokemon = result[0];
  appendPokemonToGrid(nextPokemon);
  saveLoadedPokemon(nextPokemon);
  finishPokemonLoading();
}

function hideShowMoreButton() {
  if (showMoreButtonElement) {
    showMoreButtonElement.style.display = "none";
  }
}

function showShowMoreButton() {
  if (showMoreButtonElement) {
    showMoreButtonElement.style.display = "block";
  }
}

function updateShowMoreButton() {
  if (!showMoreButtonElement) {
    return;
  }
  if (isSearchMode) {
    hideShowMoreButton();
    return;
  }
  showShowMoreButton();
  updateShowMoreButtonState(showMoreButtonElement);
}

function updateShowMoreButtonState(showMoreButton) {
  if (isLoadingPokemon) {
    showMoreButton.disabled = true;
    showMoreButton.textContent = textLoading;
    return;
  }
  if (!hasMorePokemon) {
    showMoreButton.disabled = true;
    showMoreButton.textContent = textAllLoaded;
    return;
  }
  showMoreButton.disabled = false;
  showMoreButton.innerHTML = textLoadMoreHtml;
}

function resetSearch() {
  isSearchMode = false;
  searchResults = [];
  currentSearchText = "";
  renderPokemonGrid(loadedPokemonList);
  updateShowMoreButton();
}

function searchPokemon(query) {
  const normalizedQuery = query.toLowerCase().trim();
  currentSearchText = normalizedQuery;
  if (normalizedQuery === "") {
    resetSearch();
    return;
  }
  isSearchMode = true;
  updateShowMoreButton();
  setDisplayLoadingState(true);
  searchPokemonInApi(normalizedQuery);
}

async function loadPokemonNameList() {
  if (cachedPokemonNameList.length > 0) {
    return cachedPokemonNameList;
  }
  const listUrl = pokemonApiUrl + "?limit=" + searchPokemonLimit + "&offset=0";
  const data = await fetchJson(listUrl);
  cachedPokemonNameList = data.results;
  return cachedPokemonNameList;
}

function findMatchingPokemon(query, pokemonList) {
  const matches = [];
  for (let i = 0; i < pokemonList.length; i++) {
    const pokemon = pokemonList[i];
    if (pokemon.name.toLowerCase().indexOf(query) !== -1) {
      matches.push(pokemon);
    }
  }
  return matches;
}

async function loadSearchResultDetails(matchList) {
  const detailedPokemonList = [];
  for (let i = 0; i < matchList.length; i++) {
    const pokemonEntry = matchList[i];
    detailedPokemonList.push(await fetchSimplePokemonData(pokemonEntry.url));
  }
  return detailedPokemonList;
}

function applySearchResults(detailedPokemonList) {
  searchResults = detailedPokemonList;
  renderPokemonGrid(searchResults);
}

function finishSearch(query) {
  if (currentSearchText === query) {
    setDisplayLoadingState(false);
  }
}

function shouldStopSearch(query) {
  return currentSearchText !== query;
}

function hasNoSearchResults(matchingPokemon) {
  if (matchingPokemon.length === 0) {
    showGridMessage(textNoPokemonFound);
    return true;
  }
  return false;
}

async function loadAndApplySearchResults(query) {
  const fullPokemonList = await loadPokemonNameList();
  const matchingPokemon = findMatchingPokemon(query, fullPokemonList);
  if (shouldStopSearch(query) || hasNoSearchResults(matchingPokemon)) {
    return;
  }
  const detailedPokemonList = await loadSearchResultDetails(matchingPokemon);
  applySearchResults(detailedPokemonList);
}

async function searchPokemonInApi(query) {
  try {
    await loadAndApplySearchResults(query);
  } catch (error) {
    console.warn("Search error:", error);
    showGridMessage(textSearchError);
  }
  finishSearch(query);
}
