let cards = [];
let imageMeta = [];
let originalMeta = [];

window.addEventListener("DOMContentLoaded", () => {
  const filtersIcon = document.querySelector(".filters-icon");
  const popup = document.getElementById("settings-popup");

  if (filtersIcon && popup) {
    filtersIcon.addEventListener("click", () => {
      popup.classList.toggle("hidden");
    });
  }

  document.getElementById('settings-upload').addEventListener('change', function (e) {
    const files = Array.from(e.target.files);
    imageMeta = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      nume: '',
      varsta: '',
      ocupatie: ''
    }));

    generateMetaForm(imageMeta);
    document.getElementById('details-form').classList.remove('hidden');
  });

  document.getElementById('submit-details').addEventListener('click', () => {
    if (imageMeta.some(m => !m.nume || !m.varsta || !m.ocupatie)) {
      alert('Completează toate câmpurile!');
      return;
    }
    originalMeta = [...imageMeta];
    loadCards(imageMeta);
    document.getElementById("settings-popup").classList.add("hidden");
  });

  document.querySelector('.reset-icon')?.addEventListener('click', () => {
    if (originalMeta.length === 0) return;
    imageMeta = [...originalMeta];
    loadCards(imageMeta);
  });
});

function generateMetaForm(data) {
  const container = document.getElementById('form-fields');
  container.innerHTML = '';
  data.forEach((item, index) => {
    const block = document.createElement('div');
    block.innerHTML = `
      <img src="${item.url}" width="100" style="border-radius:10px;margin-bottom:4px;"><br>
      <input type="text" placeholder="Nume" data-index="${index}" data-field="nume" required />
      <input type="number" placeholder="Vârstă" data-index="${index}" data-field="varsta" min="18" max="99" required />
      <input type="text" placeholder="Ocupație" data-index="${index}" data-field="ocupatie" required />
    `;
    container.appendChild(block);
  });

  container.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', e => {
      const index = +e.target.dataset.index;
      const field = e.target.dataset.field;
      imageMeta[index][field] = e.target.value;
    });
  });
}

function loadCards(data) {
  const container = document.getElementById('card-container');
  container.innerHTML = '';
  cards = [];

  [...data].reverse().forEach(info => {
    const frame = document.createElement('div');
    frame.className = 'card-frame';

    const card = document.createElement('div');
    card.className = 'card';
    card.style.backgroundImage = `url(${info.url})`;

    const star = document.createElement('div');
    star.className = 'star';
    star.textContent = '⭐';
    card.appendChild(star);

    const dist = Math.floor(Math.random() * 30) + 1;
    const cardInfo = document.createElement('div');
    cardInfo.className = 'card-info';
    cardInfo.innerHTML = `<strong>${info.nume}</strong>, ${info.varsta}<br>
                          <span>${info.ocupatie}</span><br>
                          <small>${dist} km distanță</small>`;
    card.appendChild(cardInfo);

    addSwipeEvents(card);
    frame.appendChild(card);
    container.appendChild(frame);
    cards.unshift(card); // păstrăm topCard în față
  });
}

function swipe(direction, cardEl = null) {
  const card = cardEl || cards[0];
  if (!card) return;

  const animClass = {
    left: 'swipe-left',
    right: 'swipe-right',
    star: 'swipe-up'
  }[direction];

  card.classList.add(animClass);

  setTimeout(() => {
    card.parentElement.remove();
    cards.shift();
  }, 600);
}

function swipeButton(direction) {
  const topCard = cards[0];
  if (topCard) {
    swipe(direction, topCard);
  }
}

function addSwipeEvents(card) {
  let startX = 0, startY = 0;
  let currentX = 0, currentY = 0;
  let dragging = false;

  function updateTransform(x, y) {
    const rotate = x / 10;
    card.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    card.classList.toggle("approve", x > 80);
    card.classList.toggle("reject", x < -80);
    card.classList.toggle("favorite", y < -80);
  }

  function finishSwipe() {
    card.style.transition = 'transform 0.4s ease';
    if (Math.abs(currentX) > 100) {
      swipe(currentX > 0 ? 'right' : 'left', card);
    } else if (currentY < -100) {
      swipe('star', card);
    } else {
      card.style.transform = 'translate(0, 0) rotate(0)';
      card.classList.remove("approve", "reject", "favorite");
    }
  }

  card.addEventListener('mousedown', e => {
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    card.style.transition = 'none';
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;
    updateTransform(currentX, currentY);
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    finishSwipe();
  });

  card.addEventListener('touchstart', e => {
    dragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    card.style.transition = 'none';
  });

  card.addEventListener('touchmove', e => {
    if (!dragging) return;
    currentX = e.touches[0].clientX - startX;
    currentY = e.touches[0].clientY - startY;
    updateTransform(currentX, currentY);
  });

  card.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    finishSwipe();
  });
}
