/* sections.js – Shell és Section kezelés */

(function() {
  const { $, el, myioNS } = window.myioUtils;

  function ensureShell() {
    if ($("#myio-root")) return;
    const wrap = el("div", { class: "myio-wrap" });
    const root = el("div", { id: "myio-root" });
    const toastEl = el("div", { id: "myio-toast", class: "myio-toast" });
    wrap.append(root);
    document.body.append(wrap, toastEl);
  }

  function makeSection(title, meta, keyOverride, defaultOpen = false) {
    const key = keyOverride || (
      myioNS + ".section." +
      String(title || "section").toLowerCase().trim().replace(/\s+/g, "_").replace(/[^\w\-]/g, "")
    );

    const saved = localStorage.getItem(key);
    const collapsed = (saved === null) ? !defaultOpen : (saved !== "open");

    const section = el("section", { class: "myio-section" + (collapsed ? " is-collapsed" : "") });
    section.dataset.key = key;

    const head = el("div", { class: "myio-sectionHead", role: "button", tabindex: "0" }, [
      el("h2", { class: "myio-sectionTitle", text: title }),
      el("div", { class: "myio-sectionMeta", text: meta || "" }),
      el("div", { class: "myio-dragHandle", title: (typeof str_Reorder !== "undefined" ? str_Reorder : "Rendezés"), text: "☰" })
    ]);

    section.draggable = false;

    const handle = head.querySelector(".myio-dragHandle");
    handle.addEventListener("pointerdown", (e) => {
      section.dataset.dragok = "1";
      section.draggable = true;
      e.stopPropagation();
    });
    handle.addEventListener("pointerup", (e) => {
      section.dataset.dragok = "0";
      section.draggable = false;
      e.stopPropagation();
    });
    handle.addEventListener("click", (e) => e.stopPropagation());

    const body = el("div", { class: "myio-sectionBody" }, [el("div", { class: "myio-grid" })]);

    const saveState = () => {
      localStorage.setItem(key, section.classList.contains("is-collapsed") ? "closed" : "open");
    };

    const toggle = () => { section.classList.toggle("is-collapsed"); saveState(); };

    head.addEventListener("click", toggle);
    head.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });

    section.append(head, body);
    if (saved === null) saveState();

    return { section, grid: body.firstChild, head };
  }

  function ensureHeaderMask() {
    if (document.querySelector(".myio-headerMask")) return;

    const m = document.createElement("div");
    m.className = "myio-headerMask";
    document.body.appendChild(m);

    const update = () => {
      const h = document.querySelector(".header");
      if (!h) return;
      const px = Math.max(60, Math.ceil(h.getBoundingClientRect().height));
      document.documentElement.style.setProperty("--myio-header-h", px + "px");
    };

    update();
    [0, 50, 150, 350, 800].forEach(t => setTimeout(update, t));
    window.addEventListener("load", update);
    window.addEventListener("resize", update);
  }

  // Export
  window.myioSections = { ensureShell, makeSection, ensureHeaderMask };
  window.myioMakeSection = makeSection; // Backward compatibility
})();
