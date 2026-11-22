const NS = "http://www.w3.org/2000/svg";

export function validateData(data) {
  if (!data || !/^\d{4}-(0[1-9]|1[0-2])$/.test(data.asOf) || !Array.isArray(data.domains) || data.domains.length < 3) {
    throw new Error("Research data needs a snapshot month and at least three domains.");
  }
  if (!Array.isArray(data.modalities) || !data.modalities.length) throw new Error("Missing modality legend.");
  const modalityIds = new Set();
  for (const modality of data.modalities) {
    if (!modality.id || modalityIds.has(modality.id) || !modality.label || !/^#[0-9a-f]{6}$/i.test(modality.color)) {
      throw new Error("Invalid modality legend entry.");
    }
    modalityIds.add(modality.id);
  }
  const ids = new Set();
  for (const domain of data.domains) {
    if (!domain.id || ids.has(domain.id) || !domain.label ||
        typeof domain.months !== "number" || !Number.isFinite(domain.months) || domain.months < 0 ||
        !domain.basis || !Array.isArray(domain.modalities) || !domain.modalityBasis ||
        domain.modalities.some(id => !modalityIds.has(id)) || new Set(domain.modalities).size !== domain.modalities.length ||
        !Array.isArray(domain.projects) || !domain.projects.length ||
        domain.projects.some(project => !project.title || (project.href && !safeHref(project.href)) ||
          (project.months !== undefined && (typeof project.months !== "number" || !Number.isFinite(project.months) || project.months < 0)))) {
      throw new Error("Invalid research domain: " + (domain.id || "missing id"));
    }
    ids.add(domain.id);
  }
  if (!Array.isArray(data.axisOrder) || data.axisOrder.length !== ids.size ||
      new Set(data.axisOrder).size !== ids.size || data.axisOrder.some(id => !ids.has(id))) {
    throw new Error("Axis order must include every domain exactly once.");
  }
  return data;
}

function safeHref(value) {
  try {
    return typeof value === "string" && ["http:", "https:"].includes(new URL(value, "https://example.org/").protocol);
  } catch {
    return false;
  }
}

export function scaleMaximum(domains) {
  return Math.max(5, Math.ceil(Math.max(...domains.map(domain => domain.months)) / 5) * 5);
}

export function radarPoint(index, count, months, maximum, cx, cy, radius) {
  const angle = index * Math.PI * 2 / count - Math.PI / 2;
  const distance = radius * months / maximum;
  return { x: cx + Math.cos(angle) * distance, y: cy + Math.sin(angle) * distance };
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function svgElement(tag, attributes = {}, text) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  if (text !== undefined) node.textContent = text;
  return node;
}

function modalityDot(modality) {
  const dot = element("span", "radar-modality-dot");
  dot.style.setProperty("--modality-color", modality.color);
  dot.title = modality.label;
  dot.setAttribute("aria-hidden", "true");
  return dot;
}

function buildLegend(modalities) {
  const legend = element("aside", "radar-legend");
  legend.setAttribute("aria-labelledby", "radar-modalities-title");
  const heading = element("h4", "", "Data Modalities");
  heading.id = "radar-modalities-title";
  const list = element("ul");
  for (const modality of modalities) {
    const item = element("li");
    item.append(modalityDot(modality), element("span", "radar-legend-label", modality.label));
    list.append(item);
  }
  legend.append(heading, list);
  return legend;
}

function buildTable(domains, modalityLookup, container) {
  const details = element("div", "radar-text-alternative");
  details.append(element("p", "radar-method", "Calendar months with research activity, not full-time effort or proficiency. Overlapping projects count once within each domain."));
  const wrap = element("div", "radar-table-wrap");
  const table = element("table", "radar-table");
  table.append(element("caption", "", "Research periods, projects, and sources"));
  const head = element("thead");
  const headings = element("tr");
  for (const title of ["Domain", "Months", "Projects and basis"]) {
    const cell = element("th", "", title);
    cell.scope = "col";
    headings.append(cell);
  }
  head.append(headings);
  const body = element("tbody");
  for (const domain of domains) {
    const row = element("tr");
    const title = element("th", "", domain.label);
    title.scope = "row";
    row.append(title, element("td", "", "About " + domain.months));
    const description = element("td");
    const list = element("ul");
    for (const project of domain.projects) {
      const item = element("li");
      const name = element("span", "", project.title);
      item.append(name);
      list.append(item);
    }
    description.append(list, element("p", "radar-basis", domain.basis),
      element("p", "radar-basis", `Modalities: ${domain.modalities.map(id => modalityLookup.get(id).label).join(", ")}. ${domain.modalityBasis}`));
    row.append(description);
    body.append(row);
  }
  table.append(head, body);
  wrap.append(table);
  details.append(wrap);
  container.append(details);
}

export function renderRadar(root, data) {
  validateData(data);
  const domainLookup = new Map(data.domains.map(domain => [domain.id, domain]));
  const domains = data.axisOrder.map(id => domainLookup.get(id));
  const modalityLookup = new Map(data.modalities.map(modality => [modality.id, modality]));
  const maximum = scaleMaximum(domains);
  const content = root.querySelector(".radar-content");
  const stage = element("div", "radar-stage");
  const svg = svgElement("svg", { role: "img", "aria-labelledby": "radar-svg-title radar-svg-desc" });
  svg.append(svgElement("title", { id: "radar-svg-title" }, "Research experience in months"));
  svg.append(svgElement("desc", { id: "radar-svg-desc" },
    domains.map(domain => `${domain.label}: approximately ${domain.months} months`).join(". ") + ". Colored dots identify modalities; each domain control and the text table also name them."));
  const drawing = svgElement("g", { "aria-hidden": "true" });
  svg.append(drawing);
  stage.append(svg);
  const tooltip = element("div", "radar-tooltip");
  tooltip.id = "research-radar-tooltip";
  tooltip.role = "tooltip";
  tooltip.hidden = true;
  let active = -1;
  let pinned = false;
  let dismissTimer;
  const buttons = [];
  let markers = [];

  function hide() {
    clearTimeout(dismissTimer);
    tooltip.hidden = true;
    pinned = false;
    active = -1;
    buttons.forEach(button => { button.removeAttribute("aria-describedby"); button.classList.remove("is-active"); });
    markers.forEach(marker => marker.classList.remove("is-active"));
  }

  function show(index) {
    clearTimeout(dismissTimer);
    if (pinned && active !== index) return;
    active = index;
    const domain = domains[index];
    tooltip.replaceChildren(element("strong", "", domain.label), element("span", "radar-tooltip-duration", `About ${domain.months} months`));
    const list = element("ul");
    domain.projects.forEach(project => list.append(element("li", "", project.title)));
    tooltip.append(list, element("p", "radar-tooltip-modalities", `Modalities: ${domain.modalities.map(id => modalityLookup.get(id).label).join(", ")}.`));
    tooltip.hidden = false;
    buttons.forEach((button, i) => {
      button.classList.toggle("is-active", i === index);
      if (i === index) button.setAttribute("aria-describedby", tooltip.id);
      else button.removeAttribute("aria-describedby");
    });
    markers.forEach((marker, i) => marker.classList.toggle("is-active", i === index));
    const anchor = buttons[index];
    const left = Math.max(8, Math.min(stage.clientWidth - tooltip.offsetWidth - 8,
      anchor.offsetLeft + anchor.offsetWidth / 2 - tooltip.offsetWidth / 2));
    const below = anchor.offsetTop + anchor.offsetHeight + 8;
    const top = below + tooltip.offsetHeight < stage.clientHeight - 8 ? below : anchor.offsetTop - tooltip.offsetHeight - 8;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${Math.max(8, Math.min(stage.clientHeight - tooltip.offsetHeight - 8, top))}px`;
  }

  function scheduleHide() {
    clearTimeout(dismissTimer);
    dismissTimer = setTimeout(() => {
      if (!pinned && !buttons.includes(document.activeElement) && !tooltip.matches(":hover") &&
          !buttons.some(button => button.matches(":hover")) && !markers.some(marker => marker.matches(":hover"))) hide();
    }, 180);
  }

  domains.forEach((domain, index) => {
    const button = element("button", "radar-axis");
    button.type = "button";
    button.setAttribute("aria-label", `${domain.label}, approximately ${domain.months} months. Modalities: ${domain.modalities.map(id => modalityLookup.get(id).label).join(", ")}.`);
    button.append(element("span", "radar-axis-name", domain.label));
    const dots = element("span", "radar-modality-dots");
    dots.setAttribute("aria-hidden", "true");
    domain.modalities.forEach(id => dots.append(modalityDot(modalityLookup.get(id))));
    button.append(dots);
    button.addEventListener("pointerenter", event => { if (event.pointerType !== "touch") show(index); });
    button.addEventListener("pointerleave", scheduleHide);
    button.addEventListener("focus", () => { pinned = false; show(index); });
    button.addEventListener("blur", hide);
    button.addEventListener("click", () => {
      if (pinned && active === index) hide();
      else { pinned = false; show(index); pinned = true; }
    });
    buttons.push(button);
    stage.append(button);
  });
  stage.append(tooltip);
  tooltip.addEventListener("pointerenter", () => clearTimeout(dismissTimer));
  tooltip.addEventListener("pointerleave", scheduleHide);
  document.addEventListener("keydown", event => { if (event.key === "Escape") hide(); });
  document.addEventListener("pointerdown", event => {
    if (!tooltip.contains(event.target) && !buttons.some(button => button.contains(event.target)) && !markers.includes(event.target)) hide();
  });

  function draw() {
    const width = stage.clientWidth;
    if (!width) return;
    const mobile = width < 460;
    const compact = width < 320;
    const radius = Math.min(width * 0.24, 125);
    const height = Math.ceil(Math.max(compact ? 320 : mobile ? 300 : 360, radius * 2 + 148));
    const cx = width / 2;
    const cy = height / 2;
    stage.style.height = `${height}px`;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    drawing.replaceChildren();
    const point = (i, value, r = radius) => radarPoint(i, domains.length, value, maximum, cx, cy, r);
    const points = value => domains.map((_, i) => { const p = point(i, value); return `${p.x},${p.y}`; }).join(" ");
    for (let value = 5; value <= maximum; value += 5) {
      drawing.append(svgElement("polygon", { points: points(value), class: "radar-grid" }));
    }
    domains.forEach((_, i) => {
      const p = point(i, maximum);
      drawing.append(svgElement("line", { x1: cx, y1: cy, x2: p.x, y2: p.y, class: "radar-spoke" }));
    });
    drawing.append(svgElement("polygon", { class: "radar-area", points: domains.map((domain, i) => {
      const p = point(i, domain.months); return `${p.x},${p.y}`;
    }).join(" ") }));
    for (let value = 5; value <= maximum; value += 5) {
      drawing.append(svgElement("text", { x: cx + 6, y: cy - radius * value / maximum + 4, class: "radar-tick" }, value));
    }
    markers = domains.map((domain, i) => {
      const p = point(i, domain.months);
      const marker = svgElement("circle", { cx: p.x, cy: p.y, r: 4, class: "radar-point" });
      marker.addEventListener("pointerenter", event => { if (event.pointerType !== "touch") show(i); });
      marker.addEventListener("pointerleave", scheduleHide);
      marker.addEventListener("click", () => { buttons[i].focus(); buttons[i].click(); });
      drawing.append(marker);
      return marker;
    });
    buttons.forEach((button, i) => {
      const p = point(i, maximum, radius + 12);
      const direction = (p.x - cx) / (radius + 20);
      let x = p.x - (direction > 0.2 ? 0 : direction < -0.2 ? button.offsetWidth : button.offsetWidth / 2);
      let y = p.y - button.offsetHeight / 2;
      if (i === 0) y = p.y - button.offsetHeight;
      if (Math.abs(direction) < 0.2 && p.y > cy) y = p.y;
      // Stagger the side labels on narrow phones instead of shrinking the text.
      if (compact && domains.length === 6) {
        if (i === 1 || i === 5) y -= 14;
        if (i === 2 || i === 4) y += 22;
        if (i === 3) y += 24;
      }
      button.style.left = `${Math.max(2, Math.min(width - button.offsetWidth - 2, x))}px`;
      button.style.top = `${Math.max(2, Math.min(height - button.offsetHeight - 2, y))}px`;
    });
    if (active >= 0) show(active);
  }

  const month = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${data.asOf}-01T00:00:00Z`));
  root.querySelector(".radar-subtitle").textContent = `Time spent across research areas (in months), through ${month}`;
  root.querySelector(".radar-chart-column").prepend(stage);
  root.querySelector(".radar-layout").append(buildLegend(data.modalities));
  buildTable(data.domains, modalityLookup, content);
  content.hidden = false;
  root.querySelector(".radar-fallback").hidden = true;
  draw();
  const observer = new ResizeObserver(draw);
  observer.observe(stage);
  root.addEventListener("toggle", () => {
    hide();
    if (root.open) draw();
  });
  document.fonts.ready.then(draw);
}

if (typeof document !== "undefined") {
  const root = document.getElementById("research-radar");
  if (root) {
    fetch(new URL("../data/research-experience.json", import.meta.url))
      .then(response => { if (!response.ok) throw new Error("Research data unavailable"); return response.json(); })
      .then(data => renderRadar(root, data))
      .catch(() => {
        root.querySelector(".radar-content").hidden = true;
        root.querySelector(".radar-fallback").hidden = false;
      });
  }
}
