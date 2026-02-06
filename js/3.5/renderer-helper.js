/* renderer-helpers.js – Közös segédfüggvények a renderer modulokhoz */

(function () {
    const { el } = window.myioUtils;
  
    // ============================================================
    // === Globális változó és lokalizáció segédek
    // ============================================================
  
    /** Globális változó biztonságos lekérdezése */
    function g(name, fallback) {
      return typeof window[name] !== "undefined" ? window[name] : fallback;
    }
  
    /** Lokalizált string lekérdezése (str_XYZ globálisokból) */
    function str(name, fallback) {
      return g('str_' + name, fallback);
    }
  
    /** Percentage konverzió 0–255 → 0–100 */
    function to100(val) {
      return Math.round(val / 2.55);
    }
  
    /** Hex színkód → rgba string */
    function hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  
    /** CSS custom property lekérdezése fallback-kel */
    function getCSSVar(name, fallback) {
      return getComputedStyle(document.documentElement).getPropertyValue(name) || fallback;
    }
  
    // ============================================================
    // === SVG ikonok (Sunrise / Sunset)
    // ============================================================
  
    const SVG_NS = "http://www.w3.org/2000/svg";
  
    function createSVGElement(tag, attrs = {}) {
      const elem = document.createElementNS(SVG_NS, tag);
      for (const [k, v] of Object.entries(attrs)) {
        elem.setAttribute(k, String(v));
      }
      return elem;
    }
  
    function svgIcon(builder, viewBox = "0 0 24 24") {
      const svg = createSVGElement("svg", {
        viewBox, width: 22, height: 22, fill: "none",
        stroke: "currentColor", "stroke-width": 2,
        "stroke-linecap": "round", "stroke-linejoin": "round"
      });
      builder(svg);
      return svg;
    }
  
    function sunIconSVG(basePath) {
      return svgIcon((svg) => {
        svg.appendChild(createSVGElement("path", {
          d: "M6 14a6 6 0 0 1 12 0Z", fill: "currentColor", stroke: "none"
        }));
        [[2, 14, 5, 14], [19, 14, 22, 14]].forEach(([x1, y1, x2, y2]) => {
          svg.appendChild(createSVGElement("line", { x1, y1, x2, y2 }));
        });
        [[12, 2.5, 12, 5.5], [6.6, 5.8, 8.2, 7.4], [17.4, 5.8, 15.8, 7.4],
         [3.0, 10.0, 5.4, 10.0], [21.0, 10.0, 18.6, 10.0]].forEach(([x1, y1, x2, y2]) => {
          svg.appendChild(createSVGElement("line", { x1, y1, x2, y2 }));
        });
        svg.appendChild(createSVGElement("path", { d: basePath, fill: "none" }));
      });
    }
  
    const sunriseSVG = () => sunIconSVG("M2 20H7L12 14L17 20H22");
    const sunsetSVG  = () => sunIconSVG("M2 18H7L12 23L17 18H22");
  
    function buildSunIcons(onVal, offVal) {
      if (!onVal && !offVal) return null;
      const container = el("div", { class: "myio-sunrise-sunset-icons" });
  
      const addIcon = (val, cssClass, onTitle, offTitle) => {
        if (val !== 1 && val !== 2) return;
        const wrapper = el("span", { class: `myio-sun-icon ${cssClass}` });
        wrapper.title = val === 1 ? onTitle : offTitle;
        wrapper.appendChild(val === 1 ? sunriseSVG() : sunsetSVG());
        container.append(wrapper);
      };
  
      addIcon(onVal, "myio-sun-on", "ON @ Sunrise", "ON @ Sunset");
      addIcon(offVal, "myio-sun-off", "OFF @ Sunrise", "OFF @ Sunset");
      return container.children.length > 0 ? container : null;
    }
  
    // ============================================================
    // === PWM slider sor (PCA/FET közös)
    // ============================================================
  
    function createPWMSliderRow(val255, minRaw, maxRaw, inputName) {
      const pct = to100(val255);
      const minPct = to100(minRaw);
      const maxPct = to100(maxRaw);
  
      const row = el("div", { class: "myio-pcaRow" });
      const range = el("input", { type: "range", min: String(minPct), max: String(maxPct), value: String(pct), name: inputName });
      const num = el("input", { type: "number", min: String(minPct), max: String(maxPct), value: String(pct), name: inputName });
  
      range.oninput = () => { num.value = range.value; };
      num.oninput = () => { range.value = num.value; };
  
      row.append(range, el("div", { class: "myio-pcaValue" }, [num]));
      return { row, range, num };
    }
  
    // ============================================================
    // === Export
    // ============================================================
  
    window.myioRendererHelper = {
      g, str, to100, hexToRgba, getCSSVar,
      buildSunIcons,
      createPWMSliderRow
    };
  })();