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

async function fillDialogData(pokemonId) {
  const pokemonDetail = await fetchPokemonById(pokemonId);
  renderDialogMainInfo(pokemonDetail);
  renderDialogStats(pokemonDetail);
  await renderDialogEvolution(pokemonDetail.species.url);
}
