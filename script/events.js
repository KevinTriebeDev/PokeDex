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
    showMoreButtonElement.addEventListener("click", function () {
      loadMorePokemon(true);
    });
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
    searchInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        searchPokemon(searchInput.value);
      }
    });
  }
}

function addBButtonEvent() {
  const backButton = getElement("b-btn");
  if (!backButton) {
    return;
  }
  backButton.addEventListener("click", resetSearch);
}

function addDisplayScrollEvent() {
  if (!displayContentElement) {
    return;
  }
  displayContentElement.addEventListener("scroll", storeBrowseScrollPosition);
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
  addDisplayScrollEvent();
  addDialogKeyboardEvent();
  addDialogOverlayClickEvent();
  addCloseButtonEvent();
  addPrevButtonEvent();
  addNextButtonEvent();
  addTabButtonEvents();
  addSearchButtonEvent();
  addBButtonEvent();
}
