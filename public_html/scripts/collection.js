let selectedCards = [];
let generatedDeck = [];
let keywords = ['On Reveal:', 'On Reveal', 'Ongoing:', 'Ongoing'];

fetch('./cards')
.then(response => response.json())
.then(data => {
  data.forEach(card => {
      let cardContainer = document.createElement('div');
      let img = document.createElement('img');
      img.src = `/images/${card.CardDefId}.webp`;

      let tooltipText = highlightKeywords(card.Ability, keywords);      
      let tooltipDiv = document.createElement('div');

      tooltipDiv.innerHTML = tooltipText;
      tooltipDiv.className = 'tooltip';

      cardContainer.appendChild(img);
      cardContainer.appendChild(tooltipDiv);


      cardContainer.onclick = function() {
        img.classList.toggle('selected');
        if (selectedCards.some(c => c.CardDefId === card.CardDefId)) {
          selectedCards = selectedCards.filter(c => c.CardDefId !== card.CardDefId);
        } else {
          selectedCards.push(card);
        }
      };
      document.getElementById(card.Series).appendChild(cardContainer);
  });
});


function highlightKeywords(str, keywords) {
  let highlight = str;
  keywords.forEach(keyword => {
    let regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    highlight = highlight.replace(regex, `<strong>${keyword}</strong>`);
  });
  return highlight;
}


function toggleSeries(series) {

  if(series=='all'){
    document.getElementById('Starter').querySelectorAll('img').forEach(img => {
      img.parentElement.click();
    });
    document.getElementById('Lvl 1-14').querySelectorAll('img').forEach(img => {
      img.parentElement.click();
    });
    document.getElementById('Pool 1').querySelectorAll('img').forEach(img => {
      img.parentElement.click();
    });
    document.getElementById('Pool 2').querySelectorAll('img').forEach(img => {
      img.parentElement.click();
    });
    document.getElementById('Pool 3').querySelectorAll('img').forEach(img => {
      img.parentElement.click();
    });
    document.getElementById('Pool 4').querySelectorAll('img').forEach(img => {
      img.parentElement.click();
    });
    document.getElementById('Pool 5').querySelectorAll('img').forEach(img => {
      img.parentElement.click();
    });

  } else {
    document.getElementById(series).querySelectorAll('img').forEach(img => {
      img.parentElement.click();
    });
  }
}


function getRandomDeck(deckSize) {
  if(selectedCards.length < deckSize){
    alert('Not enough cards selected to generate a deck of this size.');
    return;
  }

  let deck = [];
  if (selectedCards.length >= deckSize) {
    while (deck.length < deckSize) {
      let randomIndex = Math.floor(Math.random() * selectedCards.length);
      if (!deck.some(c => c.CardDefId === selectedCards[randomIndex].CardDefId)) {
        deck.push(selectedCards[randomIndex]);
      }
    }
  }
  return deck;
}


document.getElementById('generateDeck').onclick = function() {
  let deckSize = document.getElementById('deckSize').value;
  generatedDeck = getRandomDeck(deckSize);
  generatedDeck.sort((a, b) => a.Cost - b.Cost); // Sort cards by cost
  let deckDiv = document.getElementById('deck');
  deckDiv.innerHTML = ''; // clear previous deck
  generatedDeck.forEach(card => { // Note the change here
    let cardContainer = document.createElement('div');
    let img = document.createElement('img');
    img.src = `http://localhost:3000/images/${card.CardDefId}.webp`; // Get CardDefId from the card object
    let tooltipText = highlightKeywords(card.Ability, keywords);      
    let tooltipDiv = document.createElement('div');
    tooltipDiv.innerHTML = tooltipText;
    tooltipDiv.className = 'tooltip';
    cardContainer.appendChild(img);
    cardContainer.appendChild(tooltipDiv);
    deckDiv.appendChild(cardContainer);
  });
};


document.getElementById('deckForm').onsubmit = function(e) {
  e.preventDefault();
  document.getElementById('deckInput').value = JSON.stringify(generatedDeck);
  this.submit();
};