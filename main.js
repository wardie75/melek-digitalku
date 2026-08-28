// ===== Util =====
const rupiah = (n) => "Rp" + n.toLocaleString("id-ID");
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// ===== Mobile nav =====
function initNavToggle() {
  const btn = $(".nav-toggle");
  const links = $(".nav-links");
  if (!btn || !links) return;
  btn.addEventListener("click", () => {
    const open = links.classList.toggle("mobile-open");
    if (open) {
      links.style.cssText =
        "display:flex;position:absolute;top:76px;left:0;right:0;flex-direction:column;background:var(--night);padding:20px 28px;gap:20px;border-bottom:1px solid var(--line);";
    } else {
      links.style.cssText = "";
    }
  });
}

// ===== Scroll reveal =====
function initReveal() {
  const items = $$(".reveal");
  if (!items.length || !("IntersectionObserver" in window)) {
    items.forEach((i) => i.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((i) => io.observe(i));
}

// ===== FAQ accordion =====
function initFaq() {
  $$(".faq-item").forEach((item) => {
    const q = $(".faq-q", item);
    if (!q) return;
    q.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      $$(".faq-item").forEach((i) => i.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });
}

// ===== Module / curriculum accordion (detail page) =====
function initModules() {
  $$(".module-item").forEach((item) => {
    const head = $(".module-head", item);
    if (!head) return;
    head.addEventListener("click", () => item.classList.toggle("open"));
  });
}

// ===== Tabs (detail page) =====
function initTabs() {
  const tabs = $$(".detail-tab");
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.dataset.target;
      $$(".tab-panel").forEach((p) => (p.style.display = "none"));
      const panel = document.getElementById(target);
      if (panel) panel.style.display = "block";
    });
  });
}

// ===== Render a class card =====
function classCardHTML(c) {
  const stars = "★".repeat(Math.round(c.rating)) + "☆".repeat(5 - Math.round(c.rating));
  return `
    <a class="class-card reveal" href="detail-kelas.html?id=${c.id}">
      <div class="class-thumb"><span class="level-tag">${c.level}</span></div>
      <div class="class-body">
        <span class="class-cat">${c.category}</span>
        <h3 class="class-title">${c.title}</h3>
        <div class="class-meta">
          <span class="stars">${stars}</span>
          <span>${c.rating} (${c.reviews})</span>
        </div>
        <div class="class-meta"><span>${c.duration}</span><span>·</span><span>${c.modules} modul</span></div>
        <div class="class-foot">
          <div class="class-price">${rupiah(c.price)}<small style="text-decoration:line-through">${rupiah(c.oldPrice)}</small></div>
          <span class="btn btn-ghost-light btn-sm">Lihat</span>
        </div>
      </div>
    </a>`;
}

// ===== Landing: kelas unggulan =====
function renderFeatured() {
  const el = $("#featured-classes");
  if (!el || typeof CLASSES === "undefined") return;
  const featured = CLASSES.filter((c) => c.popular).slice(0, 3);
  el.innerHTML = featured.map(classCardHTML).join("");
  initReveal();
}

// ===== Katalog page: filter/search/sort =====
function initCatalog() {
  const grid = $("#catalog-grid");
  if (!grid || typeof CLASSES === "undefined") return;

  const state = { search: "", category: "Semua", level: "Semua", sort: "populer" };

  function render() {
    let list = CLASSES.filter((c) => {
      const matchSearch = c.title.toLowerCase().includes(state.search.toLowerCase());
      const matchCat = state.category === "Semua" || c.category === state.category;
      const matchLevel = state.level === "Semua" || c.level === state.level;
      return matchSearch && matchCat && matchLevel;
    });

    if (state.sort === "termurah") list.sort((a, b) => a.price - b.price);
    if (state.sort === "termahal") list.sort((a, b) => b.price - a.price);
    if (state.sort === "terbaru") list = [...list].reverse();
    if (state.sort === "populer") list.sort((a, b) => b.students - a.students);

    $("#results-count").textContent = `${list.length} kelas ditemukan`;

    if (!list.length) {
      grid.innerHTML = "";
      $("#empty-state").style.display = "block";
      return;
    }
    $("#empty-state").style.display = "none";
    grid.innerHTML = list.map(classCardHTML).join("");
    initReveal();
  }

  $("#search-input")?.addEventListener("input", (e) => {
    state.search = e.target.value;
    render();
  });

  $$(".pill[data-cat]").forEach((pill) => {
    pill.addEventListener("click", () => {
      $$(".pill[data-cat]").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      state.category = pill.dataset.cat;
      render();
    });
  });

  $$(".pill[data-level]").forEach((pill) => {
    pill.addEventListener("click", () => {
      $$(".pill[data-level]").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      state.level = pill.dataset.level;
      render();
    });
  });

  $("#sort-select")?.addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });

  render();
}

// ===== Detail page =====
function initDetail() {
  const root = $("#d-title");
  if (!root || typeof CLASSES === "undefined") return;
  const params = new URLSearchParams(location.search);
  const id = params.get("id") || CLASSES[0].id;
  const c = CLASSES.find((k) => k.id === id) || CLASSES[0];

  $("#d-title").textContent = c.title;
  $("#d-desc").textContent = c.desc;
  $("#d-category").textContent = c.category;
  $("#d-level").textContent = c.level;
  $("#d-rating").textContent = `${c.rating} (${c.reviews} ulasan)`;
  $("#d-students").textContent = `${c.students.toLocaleString("id-ID")} murid`;
  $("#d-duration").textContent = c.duration;
  $("#d-price").textContent = rupiah(c.price);
  $("#d-oldprice").textContent = rupiah(c.oldPrice);
  document.title = c.title + " — Melek Digital";

  const buyBtn = $("#buy-btn");
  if (buyBtn) buyBtn.href = `checkout.html?id=${c.id}`;

  // related
  const relatedEl = $("#related-classes");
  if (relatedEl) {
    const related = CLASSES.filter((k) => k.id !== c.id && k.category === c.category).slice(0, 3);
    const fallback = related.length ? related : CLASSES.filter((k) => k.id !== c.id).slice(0, 3);
    relatedEl.innerHTML = fallback.map(classCardHTML).join("");
  }
  initReveal();
}

// ===== Checkout page =====
function initCheckout() {
  const el = $("#checkout-summary");
  if (!el || typeof CLASSES === "undefined") return;
  const params = new URLSearchParams(location.search);
  const id = params.get("id") || CLASSES[0].id;
  const c = CLASSES.find((k) => k.id === id) || CLASSES[0];

  $("#co-title").textContent = c.title;
  $("#co-level").textContent = c.level;
  $("#co-price").textContent = rupiah(c.price);
  $("#co-subtotal").textContent = rupiah(c.price);
  $("#co-total").textContent = rupiah(c.price);

  let discount = 0;
  $("#voucher-btn")?.addEventListener("click", () => {
    const code = $("#voucher-input").value.trim().toUpperCase();
    const msg = $("#voucher-msg");
    if (code === "MELEK10") {
      discount = Math.round(c.price * 0.1);
      msg.textContent = "Voucher diterapkan: diskon 10%";
      msg.style.color = "var(--success)";
    } else if (code) {
      discount = 0;
      msg.textContent = "Kode voucher tidak ditemukan";
      msg.style.color = "var(--coral)";
    } else {
      discount = 0;
      msg.textContent = "";
    }
    $("#co-discount-row").style.display = discount ? "flex" : "none";
    $("#co-discount").textContent = "-" + rupiah(discount);
    $("#co-total").textContent = rupiah(c.price - discount);
  });

  $$(".pay-method").forEach((m) => {
    m.addEventListener("click", () => {
      $$(".pay-method").forEach((x) => x.classList.remove("selected"));
      m.classList.add("selected");
      $("input", m).checked = true;
    });
  });

  $("#checkout-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = $("#pay-btn");
    btn.textContent = "Memproses...";
    btn.disabled = true;
    setTimeout(() => {
      $("#checkout-form-wrap").style.display = "none";
      $("#checkout-success").style.display = "block";
    }, 900);
  });
}

// ===== Dashboard progress bar animation =====
function initDashboard() {
  $$(".progress-fill").forEach((bar) => {
    const target = bar.dataset.progress || "0";
    requestAnimationFrame(() => {
      bar.style.width = target + "%";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initReveal();
  initFaq();
  initModules();
  initTabs();
  renderFeatured();
  initCatalog();
  initDetail();
  initCheckout();
  initDashboard();
});
