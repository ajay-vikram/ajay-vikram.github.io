(() => {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");

  function updateToggle() {
    const dark = root.dataset.theme === "dark";
    const label = `Switch to ${dark ? "light" : "dark"} theme`;
    toggle.setAttribute("aria-label", label);
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.title = label;
  }

  if (toggle) {
    toggle.hidden = false;
    updateToggle();
    toggle.addEventListener("click", () => {
      const theme = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = theme;
      updateToggle();
      try {
        localStorage.setItem("portfolio-v2-theme", theme);
      } catch (error) {
        // The toggle still works when storage is unavailable.
      }
    });
    window.addEventListener("storage", (event) => {
      if (event.key === "portfolio-v2-theme" || event.key === null) {
        root.dataset.theme = event.newValue === "dark" ? "dark" : "light";
        updateToggle();
      }
    });
  }

  const previews = document.querySelectorAll(".pub-thumbnail video[data-playback-rate]");
  const previewObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.play().catch(() => {});
      } else {
        entry.target.pause();
      }
    }
  }) : null;
  for (const video of previews) {
    const rate = Number(video.dataset.playbackRate);
    video.defaultPlaybackRate = rate;
    video.playbackRate = rate;
    previewObserver?.observe(video);
  }

  const news = document.querySelector(".news-scroll");
  if (news) {
    const updateNewsEdges = () => {
      news.classList.toggle("has-above", news.scrollTop > 1);
      news.classList.toggle("has-below", news.scrollTop + news.clientHeight < news.scrollHeight - 1);
    };
    news.addEventListener("scroll", updateNewsEdges, { passive: true });
    window.addEventListener("resize", updateNewsEdges);
    document.fonts.ready.then(updateNewsEdges);
    updateNewsEdges();
  }

  const nav = document.querySelector(".site-nav");
  if (nav) {
    // Navigation wraps on narrow screens; anchors must clear its actual height.
    const updateNavHeight = () => {
      root.style.setProperty("--nav-height", `${Math.ceil(nav.getBoundingClientRect().height)}px`);
    };
    updateNavHeight();
    if ("ResizeObserver" in window) {
      new ResizeObserver(updateNavHeight).observe(nav);
    } else {
      window.addEventListener("resize", updateNavHeight);
    }
  }
})();
