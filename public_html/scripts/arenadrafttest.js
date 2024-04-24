let draftableCards = [];
let playerHand = [];
let currentCards = [];
let numCards;
let draftFinished = false;
let keywords = ["On Reveal", "Ongoing"];


fetch('./cards')
.then(response => response.json())
.then(data => {
	data.forEach(card => {
		draftableCards = data;
	});
});


function createPlayerCard(card) {
	let cardContainer = document.createElement('div');
	let img = document.createElement('img');
	img.src = `/images/${card.CardDefId}.webp`;

	let tooltipText = highlightKeywords(card.Ability, keywords);
	let tooltipDiv = document.createElement('div');

	tooltipDiv.innerHTML = tooltipText;
	tooltipDiv.className = 'tooltip';

	cardContainer.appendChild(img);
	cardContainer.appendChild(tooltipDiv);

	return cardContainer;
}

function createDeckCard(card, index, cardSpot) {
	let cardContainer = document.createElement('div');
	let img = document.createElement('img');
	img.src = `/images/${card.CardDefId}.webp`;
	img.onclick = function() {
		playerHand.push(card);
		updatePlayerHand();
		if (playerHand.length === numCards) {
			endDraft();
		} else {
			currentCards.splice(index, 1);
			draftableCards.push(...currentCards);
			showDeck();
		}
	}

	let tooltipText = highlightKeywords(card.Ability, keywords);
	let tooltipDiv = document.createElement('div');

	tooltipDiv.innerHTML = tooltipText;
	tooltipDiv.className = 'tooltip';


	let deleteButton = document.createElement('button');
	deleteButton.textContent = "Don't have card";
	deleteButton.classList.add('delButton');
	deleteButton.onclick = function() {
		let newCard = draftableCards.pop();
		let newCardContainer = createDeckCard(newCard, index, cardSpot);
		cardSpot.innerHTML = '';
		cardSpot.appendChild(newCardContainer);
	}

	cardContainer.appendChild(img);
	cardContainer.appendChild(tooltipDiv);
	cardContainer.appendChild(deleteButton);

	return cardContainer;
}


function showDeck() {


	shuffle(draftableCards);

	currentCards = [];

	for(let i=0; i<3; i++) {
		let cardSpot = document.getElementById(`card${i}`);
		let card = draftableCards.pop();
		currentCards.push(card);
		let cardContainer = createDeckCard(card, i, cardSpot);

		cardSpot.innerHTML = '';
		cardSpot.appendChild(cardContainer);
	}

}


function updatePlayerHand() {
	let handDiv = document.getElementById('hand');
	handDiv.innerHTML = '';

	playerHand.sort((a, b) => a.Cost - b.Cost);

	playerHand.forEach(card=> {
		let cardContainer = createPlayerCard(card);
		handDiv.appendChild(cardContainer);
	});
}


function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


function startDraft() {
	document.getElementById('numCards').style.display = 'none';
	document.getElementById('numCardsLabel').style.display = 'none';
	document.getElementById('startDraft').style.display = 'none';

	
	numCards = parseInt(document.getElementById('numCards').value, 10);

	if (numCards < 1) {
		alert("Number of cards must be at least 1");
		resetDraft();
		return;
	} else if (numCards > 12) {
		alert("Number of cards must not exceed 12");
		resetDraft();
		return;
	}

	showDeck();
}


function resetDraft() {
	document.getElementById('numCards').style.display = 'inline';
	document.getElementById('numCardsLabel').style.display = 'inline';
	document.getElementById('startDraft').style.display = 'inline';
}


function endDraft() {
	draftFinished = true;

	let deckDiv = document.getElementById('deck');
	deckDiv.style.display = 'none';

	let deckCodeDiv = document.getElementById('deckCode');
	deckCodeDiv.style.display = 'block';

	let deckCode = getDeckCode(playerHand);

	let copyButton = document.getElementById('copyButton');
	copyButton.onclick = function() {copyToClipboard(deckCode, this)};

	let deckCodeText = document.getElementById('deckCodeText');
	deckCodeText.value = deckCode;

}


function getDeckCode(deck){
	deckId = deck.map(card => ({CardDefId: card.CardDefId}));
	json_string = JSON.stringify({Cards: deckId});
	base64 = btoa(json_string);

	return base64;
}


function copyToClipboard(base64, buttonElement) {
  navigator.clipboard.writeText(base64)
    .then(() => {
      console.log(`Successfully copied deck to clipboard.`);
      
      let copyNotification = document.createElement('span');
      copyNotification.innerText = 'Deck successfully copied to clipboard!';
      copyNotification.style.position = 'absolute';
      copyNotification.style.backgroundColor = '#555';
      copyNotification.style.color = 'white';
      copyNotification.style.textAlign = 'center';
      copyNotification.style.borderRadius = '6px';
      copyNotification.style.padding = '5px 0';
      copyNotification.style.zIndex = '1';
      copyNotification.style.bottom = '125%';
      copyNotification.style.left = '50%';
      copyNotification.style.marginLeft = '-60px';
      copyNotification.style.width = '120px';
      copyNotification.style.visibility = 'hidden';
      copyNotification.style.opacity = '0';
      copyNotification.style.transition = 'opacity 0.3s';

      buttonElement.style.position = 'relative';
      buttonElement.appendChild(copyNotification);
      
      copyNotification.style.visibility = 'visible';
      copyNotification.style.opacity = '1';

      setTimeout(() => {
        buttonElement.removeChild(copyNotification);
      }, 3000);
    })
    .catch(err => {
      console.error('Could not copy text: ', err);
    });
}


function highlightKeywords(str, keywords) {
  let highlight = str;
  keywords.forEach(keyword => {
    let regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    highlight = highlight.replace(regex, `<strong>${keyword}</strong>`);
  });
  return highlight;
}