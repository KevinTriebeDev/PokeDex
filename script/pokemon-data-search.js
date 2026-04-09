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

async function loadMorePokemon(shouldKeepBottomScroll) {
  if (isLoadingPokemon || !hasMorePokemon) {
    return;
  }
  startPokemonLoading();
  const result = await Promise.all([loadPokemonBatch(), wait(2000)]);
  const nextPokemon = result[0];
  appendPokemonToGrid(nextPokemon);
  saveLoadedPokemon(nextPokemon);
  finishPokemonLoading();
  if (shouldKeepBottomScroll) {
    scrollDisplayContentToBottom();
  }
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

function updateSearchBackButton() {
  const backButtonWrapper = document.querySelector(".ab-buttons");
  const backButton = getElement("b-btn");
  const hasActiveSearch = isSearchMode || currentSearchText !== "";
  if (!backButton || !backButtonWrapper) {
    return;
  }
  if (!hasActiveSearch) {
    backButtonWrapper.style.display = "none";
    backButton.disabled = true;
    backButton.setAttribute("aria-disabled", "true");
    return;
  }
  backButtonWrapper.style.display = "";
  backButton.disabled = !hasActiveSearch;
  backButton.setAttribute("aria-disabled", String(!hasActiveSearch));
}

function resetSearch() {
  const searchInput = getElement("search-input");
  isSearchMode = false;
  searchResults = [];
  currentSearchText = "";
  if (searchInput) {
    searchInput.value = "";
  }
  renderPokemonGrid(loadedPokemonList);
  restoreBrowseScrollPosition();
  updateShowMoreButton();
  updateSearchBackButton();
}

function searchPokemon(query) {
  const normalizedQuery = query.toLowerCase().trim();
  if (!isSearchMode) {
    storeBrowseScrollPosition();
  }
  currentSearchText = normalizedQuery;
  if (normalizedQuery === "") {
    resetSearch();
    return;
  }
  if (normalizedQuery.length < minSearchLength) {
    isSearchMode = true;
    searchResults = [];
    updateShowMoreButton();
    updateSearchBackButton();
    showGridMessage(textMinSearchLength);
    return;
  }
  isSearchMode = true;
  updateShowMoreButton();
  updateSearchBackButton();
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
    if (pokemon.name.toLowerCase().includes(query)) {
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
  updateSearchBackButton();
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
