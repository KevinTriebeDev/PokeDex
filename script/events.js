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

function addSearchButtonEvent() {
  const searchInput = getElement("search-input");
  const searchButton = getElement("search-btn");
  if (searchButton && searchInput) {
    searchButton.addEventListener("click", function () {
      searchPokemon(searchInput.value);
    });
  }
}

function hideAFeatureHintDialog() {
  const hintDialog = getElement("a-hint-dialog");
  if (!hintDialog) {
    return;
  }
  hintDialog.classList.add("hidden");
}

function showAFeatureHintDialog() {
  const hintDialog = getElement("a-hint-dialog");
  if (!hintDialog) {
    return;
  }
  if (aHintDialogTimeoutId !== null) {
    clearTimeout(aHintDialogTimeoutId);
  }
  hintDialog.classList.remove("hidden");
  aHintDialogTimeoutId = setTimeout(function () {
    hideAFeatureHintDialog();
    aHintDialogTimeoutId = null;
  }, 3000);
}

function addAButtonEvent() {
  const aButton = getElement("a-btn");
  if (!aButton) {
    return;
  }
  aButton.addEventListener("click", showAFeatureHintDialog);
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
  addSearchButtonEvent();
  addAButtonEvent();
}
