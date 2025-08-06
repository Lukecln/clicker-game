let balance = 0;
let assets = [];
let buyMultiplier = 1;

const balanceEl = document.getElementById('balance');
const clickBtn = document.getElementById('click-btn');
const assetsContainer = document.getElementById('assets-container');
const buyOptions = document.getElementById('buy-options');

// 💾 Charger sauvegarde
window.addEventListener('load', () => {
  const saved = JSON.parse(localStorage.getItem('clickerSave'));
  if (saved) {
    balance = saved.balance;
    assets = saved.assets;
    updateBalance();
    renderAssets();
  }
});

// 💾 Sauvegarder automatiquement toutes les 5 sec
setInterval(() => {
  localStorage.setItem('clickerSave', JSON.stringify({ balance, assets }));
}, 5000);

// ⏱️ Gains passifs
setInterval(() => {
  let passiveIncome = assets.reduce((total, a) => total + (a.count * a.income), 0);
  balance += passiveIncome;
  updateBalance();
}, 1000);

clickBtn.addEventListener('click', () => {
  balance += 1;
  updateBalance();
});

// 💰 Mise à jour solde
function updateBalance() {
  balanceEl.textContent = `Solde : $${formatNumber(balance)}`;
}

// ➕ Créer éléments actifs
function renderAssets() {
  assetsContainer.innerHTML = '';
  assets.forEach(asset => {
    const div = document.createElement('div');
    div.className = 'asset';
    div.innerHTML = `
      <h3>${asset.name}</h3>
      <p>Prix actuel : $${formatNumber(asset.price)}</p>
      <p>Revenu/s : $${formatNumber(asset.income)}</p>
      <p>Possédé : <span id="${asset.id}-count">${asset.count}</span></p>
      <p>Revenu total : $${formatNumber(asset.income * asset.count)}</p>
      <button onclick="buyAsset('${asset.id}')">Acheter x${buyMultiplier}</button>
    `;
    assetsContainer.appendChild(div);
  });
}

// 🛒 Acheter un actif
function buyAsset(id) {
  const asset = assets.find(a => a.id === id);
  let totalPrice = 0;
  let canBuy = 0;

  for (let i = 0; i < buyMultiplier; i++) {
    let price = Math.ceil(asset.price * Math.pow(1.15, i));
    if (balance >= totalPrice + price) {
      totalPrice += price;
      canBuy++;
    } else {
      break;
    }
  }

  if (canBuy === 0) return alert("Pas assez d'argent !");
  balance -= totalPrice;
  asset.count += canBuy;
  asset.price = Math.ceil(asset.price * Math.pow(1.15, canBuy));
  updateBalance();
  renderAssets();
}

// 🎛️ Boutons d’achat x1/x10/x100
buyOptions.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    buyMultiplier = parseInt(e.target.dataset.multiplier);
    renderAssets();
  }
});

// 🔢 Format nombre
function formatNumber(num) {
  return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 📦 Charger JSON d'actifs au premier chargement
fetch('data/assets.json')
  .then(response => response.json())
  .then(data => {
    if (!assets.length) {
      data.forEach(a => a.count = 0);
      assets = data;
    }
    renderAssets();
    updateBalance();
  });
