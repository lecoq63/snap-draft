let draftableCards = [];
let player1Hand = [];
let player2Hand = [];
let draftFinished = false;
let keywords = ['On Reveal:', 'On Reveal', 'Ongoing:', 'Ongoing'];

window.onload = function() {
    fetch('/deck')
    .then(response => response.json())
    .then(data => {
        draftableCards = data;
        showDraftableCards();
    });
};

function showDraftableCards() {
    let draftableCardsDiv = document.getElementById('draftableCards');
    draftableCards.forEach(card => {
        let cardContainer = document.createElement('div');
        let img = document.createElement('img');
        img.src = `/images/${card.CardDefId}.webp`;

        let tooltipText = highlightKeywords(card.Ability, keywords);
        let tooltipDiv = document.createElement('div');

        tooltipDiv.innerHTML = tooltipText;
        tooltipDiv.className = 'tooltip';

        cardContainer.appendChild(img);
        cardContainer.appendChild(tooltipDiv);
        cardContainer.setAttribute('data-cardId', card.CardDefId);
        cardContainer.setAttribute('data-clickable', 'false');

        draftableCardsDiv.appendChild(cardContainer);
    });
}


function startDraft() {
  
    document.getElementById('player1Name').style.display = 'none';
    document.getElementById('player2Name').style.display = 'none';
    document.getElementById('numCards').style.display = 'none';
    document.getElementById('numCardsLabel').style.display = 'none';
    document.getElementById('startDraft').style.display = 'none';

    player1Name = document.getElementById('player1Name').value;
    player2Name = document.getElementById('player2Name').value;

    document.getElementById('player1Label').innerText = `${player1Name}'s Hand`;
    document.getElementById('player2Label').innerText = `${player2Name}'s Hand`;

    numCards = document.getElementById('numCards').value;
    numCards = parseInt(numCards, 10);

    if (numCards < 1) {
        alert("Number of cards must be at least 1");
        resetDraft();
        return;
    } else if (numCards > 12) {
        alert("Number of cards cannot exceed 12");
        resetDraft();
        return;
    }

  currentPlayer = Math.random() < 0.5 ? 1:2;
  updatePlayer();


    let draftableCardsDiv = document.getElementById('draftableCards');
    Array.from(draftableCardsDiv.children).forEach(cardContainer => {
        cardContainer.setAttribute('data-clickable','true');

        cardContainer.onclick = function() {
              if(cardContainer.getAttribute('data-clickable') === 'false') {
                    return;
              }

              let cardId = cardContainer.getAttribute('data-cardId');
              let card = draftableCards.find(card => card.CardDefId === cardId);

              cardContainer.classList.add('selected');
              cardContainer.setAttribute('data-clickable', 'false');

              let clonedCardContainer = cardContainer.cloneNode(true);
              clonedCardContainer.classList.remove('selected');

              if (currentPlayer === 1) {
                    player1Hand.push(card);
                    document.getElementById('player1Hand').appendChild(clonedCardContainer);
              } else {
                    player2Hand.push(card);
                    document.getElementById('player2Hand').appendChild(clonedCardContainer);
              }

              if(currentPlayer === 1 && player1Hand.length > player2Hand.length){
                    currentPlayer = 2;
                    updatePlayer();
              } else if (currentPlayer === 2 && player2Hand.length > player1Hand.length){
                    currentPlayer = 1;
                    updatePlayer();
              }

              if(player1Hand.length == numCards && player2Hand.length == numCards){
                    draftFinished = true;
                    updatePlayer();
                    endDraft();
              }

        };
    });
}


function updatePlayer() {
  
    let display = document.getElementById('currentPlayerDisplay')
    let displayText = '';
    let displayColor = '';

    if(draftFinished){
        displayText = 'Draft Finished';
        displayColor = 'limegreen';
    } else {
        displayText = currentPlayer === 1 ? `${player1Name}'s turn` : `${player2Name}'s turn`;
        displayColor = currentPlayer === 1 ? 'cyan' : 'darkorange';
    }

    display.innerText = displayText;
    display.style.color = displayColor;

}

function resetDraft() {
  document.getElementById('player1Name').style.display = 'inline';
  document.getElementById('player2Name').style.display = 'inline';
  document.getElementById('numCards').style.display = 'inline';
  document.getElementById('numCardsLabel').style.display = 'inline';
  document.getElementById('startDraft').style.display = 'inline';
  document.getElementById('player1Label').innerText = '';
  document.getElementById('player2Label').innerText = '';

}

function endDraft() {
  
    let draftableCardsDiv = document.getElementById('draftableCards');
    Array.from(draftableCardsDiv.children).forEach(cardContainer => {
        cardContainer.setAttribute('data-clickable','false');
    });

    let player1DeckCode = deckCode(player1Hand);
    let player2DeckCode = deckCode(player2Hand);

    let player1CopyButton = document.createElement('button');
    player1CopyButton.innerText = 'Copy to Clipboard';

    let player2CopyButton = document.createElement('button');
    player2CopyButton.innerText = 'Copy to Clipboard';

    player1CopyButton.onclick = function() {copyToClipboard(player1DeckCode, this)};
    player2CopyButton.onclick = function() {copyToClipboard(player2DeckCode, this)};


    let player1CopyText = document.createElement('input');
    player1CopyText.type = 'text';
    player1CopyText.readOnly = 'true';
    player1CopyText.id = 'player1DeckCode';
    player1CopyText.value = player1DeckCode;

    let player2CopyText = document.createElement('input');
    player2CopyText.type = 'text';
    player2CopyText.readOnly = 'true';
    player2CopyText.id = 'player2DeckCode';
    player2CopyText.value = player2DeckCode;

    document.getElementById('player1Copy').appendChild(player1CopyButton);
    document.getElementById('player1Copy').appendChild(player1CopyText);

    document.getElementById('player2Copy').appendChild(player2CopyButton);
document.getElementById('player2Copy').appendChild(player2CopyText);


}



function deckCode(deck){
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

