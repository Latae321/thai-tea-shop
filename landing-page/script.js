// ==========================================
// ⚠️ นำ URL ที่ได้จากขั้นตอน Apps Script มาวางตรงนี้
// ==========================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyJHxlHHw1bhtRJKWHGBhlyHwr3mcJtXVmyY9Z07mD_1zhCKkovf6ifw3OkCLU0aC7F4Q/exec';
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ55JySkM6SawmFLQM7W-GU9gUfgmUQDGiBxUyG6OUtsRfnlZV8uOF2k9SYYEyCiR-p3DhQZmtQH9iQ/pub?output=csv';

const defaultProducts = [
  {
    "id": "1",
    "name": "ชาไทยสกัดสด ดั้งเดิม",
    "size": "แก้ว 16 oz",
    "price": 45,
    "description": "ชาไทยเข้มข้น หอมกลิ่นชาสกัดใหม่ทุกแก้ว หวานมันกลมกล่อม",
    "mood": "fresh",
    "image": "images/fresh.jpg"
  },
  {
    "id": "2",
    "name": "ชาไทยนมอัลมอนด์ / นมโอ๊ต",
    "size": "แก้ว 16 oz",
    "price": 55,
    "description": "ชาไทยสูตรเพื่อสุขภาพ ใช้นมทางเลือก แยกชั้นนมนุ่มนวล สบายท้อง",
    "mood": "relax",
    "image": "images/relax.jpg"
  },
  {
    "id": "3",
    "name": "ชาไทยดำเย็น / ชาไทยมะนาว",
    "size": "แก้ว 16 oz",
    "price": 40,
    "description": "ชาไทยสกัดสดไม่ใส่นม สดชื่น ตื่นเต็มตา ต้านอนุมูลอิสระ",
    "mood": "focus",
    "image": "images/focus.jpg"
  },
  {
    "id": "4",
    "name": "ชาไทยครีมชีส นุ่มฟู",
    "size": "แก้ว 16 oz",
    "price": 60,
    "description": "ชาไทยเข้มข้นท็อปด้วยโฟมครีมชีส หอมนุ่ม เค็มมันลงตัว",
    "mood": "romance",
    "image": "images/romance.jpg"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('product-list')) {
    initProductPage();
  }
  if (document.getElementById('orderForm')) {
    initOrderPage();
  }
  if (document.getElementById('ordersTable')) {
    initAdminPage();
  }
});

function initProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const selectedMood = urlParams.get('mood') || 'all';

  fetch('products.json')
    .then(res => res.json())
    .then(products => {
      renderFilterBar(products, selectedMood);
      renderProducts(products, selectedMood);
    })
    .catch(() => {
      renderFilterBar(defaultProducts, selectedMood);
      renderProducts(defaultProducts, selectedMood);
    });
}

function renderFilterBar(products, activeMood) {
  const filterBar = document.getElementById('filter-bar');
  if (!filterBar) return;

  const moods = [
    { id: 'all', name: 'ทั้งหมด' },
    { id: 'fresh', name: 'เข้มข้นกลมกล่อม' },
    { id: 'relax', name: 'นุ่มนวลสุขภาพดี' },
    { id: 'focus', name: 'สดชื่นตื่นเต็มตา' },
    { id: 'romance', name: 'หวานมันจัดเต็ม' }
  ];

  filterBar.innerHTML = moods.map(m => `
    <button class="filter-btn ${m.id === activeMood ? 'active' : ''}" onclick="filterByMood('${m.id}')">
      ${m.name}
    </button>
  `).join('');
}

function filterByMood(mood) {
  window.location.href = `product.html?mood=${mood}`;
}

function renderProducts(products, mood) {
  const container = document.getElementById('product-list');
  const filtered = mood === 'all' ? products : products.filter(p => p.mood === mood);

  container.innerHTML = filtered.map(p => `
    <div class="product-card">
      <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Thai+Tea'">
      <div class="product-info">
        <div class="product-title">${p.name}</div>
        <div class="product-size">${p.size}</div>
        <div class="product-desc">${p.description}</div>
        <div class="product-bottom">
          <div class="product-price">฿${p.price}</div>
          <a href="order.html?item=${encodeURIComponent(p.name + ' (' + p.size + ')')}&price=${p.price}" class="btn">สั่งซื้อเลย</a>
        </div>
      </div>
    </div>
  `).join('');
}

function initOrderPage() {
  fetch('products.json')
    .then(res => res.json())
    .then(products => setupOrderForm(products))
    .catch(() => setupOrderForm(defaultProducts));
}

function setupOrderForm(products) {
  const selectElement = document.getElementById('items');
  const totalInput = document.getElementById('total');
  const previewImg = document.getElementById('orderProductImage');
  const previewName = document.getElementById('orderProductName');
  const previewPrice = document.getElementById('orderProductPrice');

  if (!selectElement) return;

  selectElement.innerHTML = products.map(p => `
    <option value="${p.name} (${p.size})" data-price="${p.price}" data-image="${p.image}">
      ${p.name} (${p.size}) - ฿${p.price}
    </option>
  `).join('');

  const urlParams = new URLSearchParams(window.location.search);
  const itemParam = urlParams.get('item');

  if (itemParam) {
    for (let opt of selectElement.options) {
      if (opt.value === itemParam) {
        opt.selected = true;
        break;
      }
    }
  }

  function updatePreview() {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    if (!selectedOption) return;

    const price = selectedOption.getAttribute('data-price');
    const img = selectedOption.getAttribute('data-image');
    const name = selectedOption.value;

    if (totalInput) totalInput.value = price;
    if (previewImg) previewImg.src = img;
    if (previewName) previewName.textContent = name;
    if (previewPrice) previewPrice.textContent = `฿${price}`;
  }

  selectElement.addEventListener('change', updatePreview);
  updatePreview();

  const form = document.getElementById('orderForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const payload = {
      customerName: document.getElementById('customerName').value,
      contact: document.getElementById('contact').value,
      items: selectElement.value,
      total: totalInput.value,
      note: document.getElementById('note').value
    };

    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    .then(() => {
      window.location.href = 'thankyou.html';
    })
    .catch(() => {
      alert('บันทึกคำสั่งซื้อเรียบร้อย!');
      window.location.href = 'thankyou.html';
    });
  });
}

function initAdminPage() {
  fetch(CSV_URL)
    .then(res => res.text())
    .then(csvText => {
      const rows = parseCSV(csvText);
      const tbody = document.querySelector('#ordersTable tbody');
      const dataRows = rows.slice(1).reverse();

      tbody.innerHTML = dataRows.map(row => `
        <tr>
          <td>${row[0] || ''}</td>
          <td>${row[1] || ''}</td>
          <td>${row[2] || ''}</td>
          <td>${row[3] || ''}</td>
          <td>${row[4] || ''}</td>
          <td>${row[5] || ''}</td>
        </tr>
      `).join('');
    })
    .catch(err => console.error('Error fetching CSV:', err));
}

function parseCSV(text) {
  const lines = text.split('\n');
  return lines.map(line => {
    const values = [];
    let insideQuote = false;
    let val = '';
    for (let char of line) {
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        values.push(val.trim());
        val = '';
      } else {
        val += char;
      }
    }
    values.push(val.trim());
    return values;
  }).filter(r => r.length > 1);
}