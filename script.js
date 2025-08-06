let balance = 0;
let assets = [];

const balanceEl = document.getElementById('balance');
const clickBtn = document.getElementById('click-btn');
const assetsContainer = document.getElementById('assets-container');

// Revenus par seconde
setInterval(() => {
  assets.forEach(asset => {
    balance += asset.count * asset.income;
  });
  updateBalance();
}, 1000);

clickBtn.addEventListener('click', () => {
  balance += 1;
  updateBalance();
});

function updateBalance() {
  balanceEl.textContent = `Solde : $${balance.toFixed(2)}`;
}

// Charger les actifs depuis le fichier JSON
fetch('data/assets.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(asset => {
      asset.count = 0; // combien l'utilisateur en possède
      assets.push(asset);
      createAssetElement(asset);
    });
  });

function createAssetElement(asset) {
  const div = document.createElement('div');
  div.className = 'asset';
  div.innerHTML = `
    <h3>${asset.name}</h3>
    <p>Prix : $${asset.price}</p>
    <p>Revenu /s : $${asset.income}</p>
    <p>Possédé : <span id="${asset.id}-count">0</span></p>
    <button onclick="buyAsset('${asset.id}')">Acheter</button>
  `;
  assetsContainer.appendChild(div);
}

function buyAsset(id) {
  const asset = assets.find(a => a.id === id);
  if (balance >= asset.price) {
    balance -= asset.price;
    asset.count += 1;
    asset.price = Math.ceil(asset.price * 1.15); // inflation
    document.getElementById(`${asset.id}-count`).textContent = asset.count;
    updateBalance();
    updateAssetsDisplay();
  } else {
    alert("Pas assez d'argent !");
  }
}

function updateAssetsDisplay() {
  assetsContainer.innerHTML = '';
  assets.forEach(createAssetElement);
}
