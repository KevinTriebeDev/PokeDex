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
