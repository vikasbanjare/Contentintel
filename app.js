/* ==========================================================================
   VIKAS BANJARE — portfolio engine
   All content lives in data.js — you should not need to edit this file.
   Lenis + GSAP ScrollTrigger with graceful fallbacks when CDNs are blocked.
   ========================================================================== */

(function () {
  "use strict";

  const DATA = window.PORTFOLIO || {};
  const P = DATA.profile || {};
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined";
  const hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";

  /* ---------------- smooth scroll ---------------- */
  let lenis = null;
  if (typeof window.Lenis !== "undefined" && !reducedMotion) {
    lenis = new Lenis({ lerp: 0.09 });
    (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })();
    if (hasST) lenis.on("scroll", () => window.ScrollTrigger.update());
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const t = $(a.getAttribute("href"));
        if (t) { e.preventDefault(); lenis.scrollTo(t); }
      });
    });
  }
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- render: hero ---------------- */
  const firstName = P.firstName || "VIKAS";
  const lastName = P.lastName || "Banjare";
  const heroFirst = $("#hero-first");
  heroFirst.innerHTML = firstName.split("").map((c) => `<span class="k">${c}</span>`).join("");
  $("#hero-last").textContent = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
  $("#chip-tagline").textContent = (P.tagline || "Visual Designer").toUpperCase();
  $("#chip-location").textContent = (P.location || "Earth").toUpperCase();
  $("#chip-year").textContent = new Date().getFullYear();

  // personalized greeting — share links like  yoursite.com/?for=Nike
  const params = new URLSearchParams(location.search);
  const guest = (params.get("for") || params.get("company") || "").slice(0, 40).replace(/[<>&"]/g, "");
  if (guest) {
    const g = $("#hero-greeting");
    g.hidden = false;
    g.innerHTML = `Hello <mark></mark>, this one's for you —`;
    g.querySelector("mark").textContent = guest;
    $("#footer-greeting").textContent = `DEAR ${guest.toUpperCase()}, GOT A PROJECT IN MIND?`;
  }

  // roles — scramble/decode effect
  function scramble(el, text, dur = 650) {
    const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&@/*";
    const t0 = performance.now();
    (function frame() {
      const p = Math.min(1, (performance.now() - t0) / dur);
      const upto = Math.floor(p * text.length);
      el.textContent =
        text.slice(0, upto) +
        [...text.slice(upto)].map((c) => (c === " " ? " " : glyphs[(Math.random() * glyphs.length) | 0])).join("");
      if (p < 1) requestAnimationFrame(frame);
    })();
  }

  const roles = DATA.roles || [];
  const rolesTrack = $("#hero-roles-track");
  const roleEl = document.createElement("span");
  roleEl.textContent = roles[0] || "";
  rolesTrack.appendChild(roleEl);
  if (roles.length > 1 && !reducedMotion) {
    let ri = 0;
    setInterval(() => {
      ri = (ri + 1) % roles.length;
      scramble(roleEl, roles[ri]);
    }, 2600);
  }

  /* ---------------- render: marquees ---------------- */
  const words = DATA.marquee || [];
  function fillMarquee(el) {
    let html = "";
    for (let r = 0; r < 2; r++) {
      words.forEach((w, j) => { html += `<span class="${j % 2 ? "out" : ""}">${w}&nbsp;✦&nbsp;</span>`; });
    }
    el.innerHTML = html;
  }
  fillMarquee($("#marquee-track"));
  fillMarquee($("#marquee-track-2"));

  /* ---------------- render: work cards ---------------- */
  // covers load with a graceful fallback: cards start as bold gradient
  // placeholders and upgrade to the image only once it actually loads
  const loadedCovers = [];
  // Accepts a full URL/filename, or an extensionless base name — in which
  // case every common extension is tried until one loads.
  function loadImg(src, ok) {
    if (!src) return;
    const candidates = src.includes(".")
      ? [src]
      : [src + ".png", src + ".jpg", src + ".jpeg", src + ".webp", src + ".jpg.png", src + ".PNG", src + ".JPG"];
    (function next(i) {
      if (i >= candidates.length) return;
      const im = new Image();
      im.onload = () => ok(candidates[i]);
      im.onerror = () => next(i + 1);
      im.src = candidates[i];
    })(0);
  }

  const projects = DATA.projects || [];
  $("#work-count").textContent = String(projects.length).padStart(2, "0");
  const htrack = $("#htrack");
  projects.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "hcard";
    card.dataset.index = i;
    card.dataset.cursor = "view";
    card.style.setProperty("--tilt", (i % 2 ? 1.6 : -1.8) + "deg");
    card.innerHTML =
      `<span class="hcard-num">${String(i + 1).padStart(2, "0")}</span>` +
      `<div class="hcard-cover ph-${i % 6}"><span class="ph-word">${p.category || p.title}</span>` +
      (p.cover ? "" : `<span class="ph-note">PASTE BEHANCE IMAGE IN data.js</span>`) +
      `</div>` +
      `<div class="hcard-body"><h3 class="hcard-title">${p.title}</h3><span class="hcard-cat">${p.category || ""}</span></div>`;
    htrack.appendChild(card);
    loadImg(p.cover, (url) => {
      loadedCovers.push(url);
      const c = $(".hcard-cover", card);
      c.style.backgroundImage = `url('${url}')`;
      c.classList.add("has-img");
      // first two loaded covers float behind the hero title
      if (loadedCovers.length <= 2) {
        const peek = document.createElement("div");
        peek.className = "hero-peek p" + loadedCovers.length;
        peek.style.backgroundImage = `url('${url}')`;
        $("#hero").appendChild(peek);
      }
    });
  });
  const endCard = document.createElement("a");
  endCard.className = "hcard-end";
  endCard.href = P.behance || "#";
  endCard.target = "_blank"; endCard.rel = "noopener";
  endCard.dataset.cursor = "hover";
  endCard.innerHTML = `<span>SEE EVERYTHING<br/>ON BEHANCE</span><span class="arr">→</span>`;
  htrack.appendChild(endCard);

  /* ---------------- hero scroll story (character journey) ---------------- */
  const story = DATA.story || [];
  const storyStage = $("#story-stage");
  if (story.length && storyStage) {
    storyStage.innerHTML =
      story.map(() => `<div class="story-scene"></div>`).join("") +
      `<div class="story-caption" id="story-caption"></div>`;
    const scenes = $$(".story-scene", storyStage);
    const caption = $("#story-caption");

    let curScene = -1;
    function setScene(i) {
      if (i === curScene) return;
      curScene = i;
      scenes.forEach((el, j) => el.classList.toggle("on", j === i));
      scramble(caption, (story[i].caption || "").toUpperCase(), 420);
    }

    // the whole stage stays hidden until at least one scene file exists,
    // so the site looks clean before the story media is uploaded
    let armed = false;
    function arm() {
      if (armed) return;
      armed = true;
      storyStage.classList.add("live");
      setScene(0);
      if (hasST && !reducedMotion) {
        ScrollTrigger.create({
          trigger: "#hero",
          start: "top top",
          end: "+=200%",
          pin: true,
          scrub: true,
          onUpdate(self) {
            const n = story.length;
            setScene(Math.min(n - 1, Math.floor(self.progress * n)));
            // last scene: free-fall reacts to scroll speed & direction
            if (curScene === n - 1) {
              const v = gsap.utils.clamp(-1, 1, self.getVelocity() / 1600);
              scenes[n - 1].style.transform =
                `scale(1) rotate(${(v * 10).toFixed(1)}deg) translateY(${(v * 22).toFixed(1)}px)`;
            }
          },
        });
        ScrollTrigger.refresh();
      } else {
        setInterval(() => setScene((curScene + 1) % story.length), 2800);
      }
    }

    // each scene accepts a video (.mp4/.webm) or an image (any extension)
    story.forEach((s, i) => {
      const base = s.media || s.image || "";
      if (!base) return;
      const vids = base.includes(".")
        ? (/\.(mp4|webm)$/i.test(base) ? [base] : [])
        : [base + ".mp4", base + ".webm"];
      (function tryVideo(v) {
        if (v >= vids.length) {
          loadImg(base, (url) => { scenes[i].style.backgroundImage = `url('${url}')`; arm(); });
          return;
        }
        fetch(vids[v], { method: "HEAD" })
          .then((r) => {
            if (r.ok) {
              scenes[i].innerHTML = `<video src="${vids[v]}" autoplay muted loop playsinline></video>`;
              arm();
            } else tryVideo(v + 1);
          })
          .catch(() => tryVideo(v + 1));
      })(0);
    });

    // the stage sways toward the cursor
    if (fine && !reducedMotion) {
      window.addEventListener("mousemove", (e) => {
        const dx = e.clientX / window.innerWidth - 0.5;
        storyStage.style.transform = `rotate(${(dx * 3).toFixed(2)}deg) translateX(${(dx * 16).toFixed(1)}px)`;
      }, { passive: true });
    }
  }

  /* ---------------- showreel (video stage) ---------------- */
  const reelItems = DATA.showreel || [];
  const reelList = $("#reel-list");
  const reelStage = $("#reel-stage");
  if (reelItems.length && reelStage) {
    let current = 0, playing = false;

    function reelEmbed(item) {
      if (item.youtubeId) {
        return `<div class="reel-frame yt"><iframe src="https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0" title="${item.title}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
      }
      return `<div class="reel-frame be"><iframe src="https://www.behance.net/embed/project/${item.behanceProjectId}?ilo0=1" title="${item.title}" allowfullscreen allow="clipboard-write" referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe></div>`;
    }
    function renderPoster() {
      reelStage.innerHTML =
        `<div class="reel-poster" data-cursor="play">` +
        `<span class="reel-play" aria-hidden="true">▶</span>` +
        `<span class="reel-poster-title">${reelItems[current].title}</span>` +
        `<span class="reel-poster-hint">CLICK TO PLAY</span>` +
        `<span class="reel-scanlines" aria-hidden="true"></span></div>`;
    }
    function play() {
      playing = true;
      reelStage.innerHTML = reelEmbed(reelItems[current]);
      reelList.classList.add("playing");
    }
    function select(i) {
      current = i;
      $("#reel-now-title").textContent = reelItems[i].title.toUpperCase();
      $$(".reel-item", reelList).forEach((el, j) => el.classList.toggle("active", j === i));
      if (playing) play();
      else renderPoster();
    }

    reelItems.forEach((item, i) => {
      const b = document.createElement("button");
      b.className = "reel-item";
      b.dataset.cursor = "play";
      b.innerHTML =
        `<span class="ri-num">${String(i + 1).padStart(2, "0")}</span>` +
        `<span class="ri-title">${item.title}</span>` +
        `<span class="ri-label">${item.label || ""}</span>` +
        `<span class="ri-eq" aria-hidden="true"><i></i><i></i><i></i></span>`;
      b.addEventListener("click", () => { select(i); if (!playing) play(); });
      reelList.appendChild(b);
    });
    reelStage.addEventListener("click", (e) => {
      if (e.target.closest(".reel-poster")) play();
    });
    select(0);
  }

  /* ---------------- render: about ---------------- */
  const aboutText = $("#about-text");
  (P.about || "").split(/\s+/).forEach((word) => {
    const acc = /^\*.*\*[.,!?—]?$/.test(word);
    const s = document.createElement("span");
    s.className = "w" + (acc ? " acc" : "");
    s.textContent = word.replace(/\*/g, "") + " ";
    aboutText.appendChild(s);
  });
  const aboutPhoto = $("#about-photo");
  loadImg(P.photo, (url) => {
    aboutPhoto.style.backgroundImage = `url("${url}")`;
    const hint = $("#about-photo-hint");
    if (hint) hint.remove();
  });
  const statsWrap = $("#about-stats");
  (DATA.stats || []).forEach((st) => {
    const d = document.createElement("div");
    d.className = "about-stat";
    d.innerHTML = `<span class="v">${st.value}</span><span class="l">${st.label}</span>`;
    statsWrap.appendChild(d);
  });

  /* ---------------- render: services ---------------- */
  const servicesList = $("#services-list");
  (DATA.services || []).forEach((s, i) => {
    const item = document.createElement("div");
    item.className = "service";
    item.innerHTML =
      `<button class="service-head" data-cursor="hover" aria-expanded="false">` +
      `<span class="s-index">${String(i + 1).padStart(2, "0")}</span>` +
      `<span class="s-title">${s.title}</span>` +
      `<span class="s-plus">+</span></button>` +
      `<div class="service-body"><div class="service-body-inner">` +
      `<p class="service-desc">${s.description}</p>` +
      `<div class="service-tags">${(s.tags || []).map((t) => `<span>${t}</span>`).join("")}</div>` +
      `</div></div>`;
    servicesList.appendChild(item);
  });
  servicesList.addEventListener("click", (e) => {
    const head = e.target.closest(".service-head");
    if (!head) return;
    const item = head.parentElement;
    const body = $(".service-body", item);
    const wasOpen = item.classList.contains("open");
    $$(".service.open", servicesList).forEach((o) => {
      o.classList.remove("open");
      $(".service-body", o).style.maxHeight = "0px";
      $(".service-head", o).setAttribute("aria-expanded", "false");
    });
    if (!wasOpen) {
      item.classList.add("open");
      body.style.maxHeight = body.scrollHeight + "px";
      head.setAttribute("aria-expanded", "true");
    }
  });

  /* ---------------- render: footer ---------------- */
  $("#footer-email").href = "mailto:" + (P.email || "");
  $("#footer-email-text").textContent = P.email || "";
  $("#link-behance").href = P.behance || "#";
  $("#link-linkedin").href = P.linkedin || "#";
  $("#footer-location").textContent = P.location || "";
  $("#footer-year").textContent = new Date().getFullYear();

  function tickTime() {
    const t = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date());
    $("#chip-time").textContent = t;
    $("#footer-time").textContent = t + " IST";
  }
  tickTime();
  setInterval(tickTime, 30000);

  /* ---------------- preloader ---------------- */
  const preloader = $("#preloader");
  const countEl = $("#preloader-count");
  const wordEl = $("#preloader-word");
  const hellos = ["HELLO", "नमस्ते", "HOLA", "BONJOUR", "CIAO", "こんにちは"];
  let wi = 0;
  const wordTimer = setInterval(() => { wi = (wi + 1) % hellos.length; wordEl.textContent = hellos[wi]; }, 240);

  const t0 = performance.now();
  const minDuration = reducedMotion ? 150 : 1600;
  const counter = setInterval(() => {
    const p = Math.min(100, Math.round(((performance.now() - t0) / minDuration) * 100));
    countEl.textContent = p;
    if (p >= 100) {
      clearInterval(counter);
      clearInterval(wordTimer);
      preloader.classList.add("done");
      setTimeout(() => { preloader.remove(); intro(); }, 850);
    }
  }, 30);

  function intro() {
    if (!hasGsap || reducedMotion) return;
    gsap.from(".kinetic .k", { yPercent: 120, opacity: 0, duration: 0.9, ease: "back.out(1.6)", stagger: 0.06 });
    gsap.from(".hero-row-2", { yPercent: 60, opacity: 0, duration: 1, ease: "power4.out", delay: 0.3 });
    gsap.from(".hero-chips .chip", { y: 30, opacity: 0, duration: 0.6, ease: "back.out(2)", stagger: 0.09, delay: 0.25 });
    gsap.from(".hero-bottom > *", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.1, delay: 0.5 });
    gsap.from(".site-header", { y: -40, opacity: 0, duration: 0.7, delay: 0.6 });
  }

  /* ---------------- kinetic hero letters (repel from cursor) ----------- */
  const ks = $$(".kinetic .k");
  if (fine && !reducedMotion && ks.length) {
    let raf = null;
    window.addEventListener("mousemove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        ks.forEach((k) => {
          const r = k.getBoundingClientRect();
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          const dx = cx - e.clientX, dy = cy - e.clientY;
          const dist = Math.hypot(dx, dy);
          const range = 260;
          if (dist < range) {
            const force = (1 - dist / range) * 34;
            const a = Math.atan2(dy, dx);
            k.style.transform = `translate(${Math.cos(a) * force}px, ${Math.sin(a) * force}px) rotate(${(dx > 0 ? 1 : -1) * force * 0.22}deg)`;
          } else {
            k.style.transform = "";
          }
        });
      });
    });
  }

  /* ---------------- image trail in hero ---------------- */
  const trailZone = $("#trail-zone");
  if (fine && !reducedMotion && trailZone) {
    let lastX = -999, lastY = -999, ti = 0;
    const trailWords = words.length ? words : ["DESIGN"];
    $("#hero").addEventListener("mousemove", (e) => {
      if (Math.hypot(e.clientX - lastX, e.clientY - lastY) < 110) return;
      lastX = e.clientX; lastY = e.clientY;
      const zr = trailZone.getBoundingClientRect();
      const el = document.createElement("div");
      el.className = "trail-img";
      if (loadedCovers.length) {
        el.style.backgroundImage = `url('${loadedCovers[ti % loadedCovers.length]}')`;
      } else {
        el.classList.add("ph-" + (ti % 6));
        el.innerHTML = `<span class="t-label">${trailWords[ti % trailWords.length]}</span>`;
      }
      el.style.left = e.clientX - zr.left - 70 + "px";
      el.style.top = e.clientY - zr.top - 90 + "px";
      el.style.setProperty("--rot", (Math.random() * 16 - 8).toFixed(1) + "deg");
      trailZone.appendChild(el);
      requestAnimationFrame(() => el.classList.add("live"));
      setTimeout(() => el.classList.add("die"), 550);
      setTimeout(() => el.remove(), 1100);
      while (trailZone.children.length > 10) trailZone.firstChild.remove();
      ti++;
    });
  }

  /* ---------------- pinned horizontal work gallery ---------------- */
  const wrap = $("#htrack-wrap");
  if (hasST && fine && !reducedMotion && window.innerWidth > 900) {
    const amount = () => Math.max(0, htrack.scrollWidth - window.innerWidth + 80);
    gsap.to(htrack, {
      x: () => -amount(),
      ease: "none",
      scrollTrigger: {
        trigger: "#work",
        start: "top top",
        end: () => "+=" + amount(),
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  } else {
    wrap.classList.add("native");
  }

  /* ---------------- scroll reveals + manifesto highlight ---------------- */
  if (hasST && !reducedMotion) {
    $$(".mega").forEach((el) => {
      gsap.from(el, { y: 70, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    });
    gsap.from(".polaroid", { rotate: -14, y: 60, opacity: 0, duration: 1, ease: "back.out(1.5)", scrollTrigger: { trigger: ".about-grid", start: "top 80%" } });
    gsap.from(".service", { y: 40, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.07, scrollTrigger: { trigger: ".services-list", start: "top 85%" } });
    gsap.from(".footer-row", { yPercent: 70, opacity: 0, duration: 1, ease: "power4.out", stagger: 0.12, scrollTrigger: { trigger: ".footer", start: "top 70%" } });

    const wordEls = $$("#about-text .w");
    if (wordEls.length) {
      aboutText.classList.add("scrub");
      ScrollTrigger.create({
        trigger: "#about-text", start: "top 78%", end: "bottom 45%",
        onUpdate(self) {
          const upto = Math.floor(self.progress * wordEls.length);
          wordEls.forEach((w, i) => w.classList.toggle("lit", i <= upto));
        },
      });
    }
  }

  /* ---------------- cursor blob ---------------- */
  const blob = $("#cursor-blob");
  const blobLabel = $("#cursor-label");
  if (fine && !reducedMotion) {
    let mx = -100, my = -100, bx = -100, by = -100;
    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
    (function loop() {
      bx += (mx - bx) * 0.2;
      by += (my - by) * 0.2;
      blob.style.left = bx + "px";
      blob.style.top = by + "px";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("[data-cursor]");
      blob.classList.remove("hover", "say");
      blobLabel.textContent = "";
      if (!t) return;
      if (t.dataset.cursor === "view") { blob.classList.add("say"); blobLabel.textContent = "VIEW ↗"; }
      else if (t.dataset.cursor === "drag") { blob.classList.add("say"); blobLabel.textContent = "DRAG ME"; }
      else if (t.dataset.cursor === "play") { blob.classList.add("say"); blobLabel.textContent = "PLAY ▶"; }
      else blob.classList.add("hover");
    });
  } else {
    blob.remove();
  }

  /* ---------------- eyes follow the cursor ---------------- */
  const pupils = $$(".pupil");
  if (fine && !reducedMotion && pupils.length) {
    window.addEventListener("mousemove", (e) => {
      pupils.forEach((p) => {
        const r = p.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const a = Math.atan2(e.clientY - cy, e.clientX - cx);
        const max = r.width * 1.1;
        p.style.transform = `translate(${Math.cos(a) * max}px, ${Math.sin(a) * max}px)`;
      });
    });
  }

  /* ---------------- draggable polaroid ---------------- */
  const polaroid = $("#polaroid");
  if (polaroid && !reducedMotion) {
    let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0, x = 0, y = 0;
    polaroid.addEventListener("pointerdown", (e) => {
      dragging = true; sx = e.clientX; sy = e.clientY; ox = x; oy = y;
      polaroid.setPointerCapture(e.pointerId);
    });
    polaroid.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      x = ox + e.clientX - sx;
      y = oy + e.clientY - sy;
      polaroid.style.transform = `translate(${x}px, ${y}px) rotate(${-4 + x * 0.02}deg)`;
    });
    ["pointerup", "pointercancel"].forEach((ev) =>
      polaroid.addEventListener(ev, () => { dragging = false; })
    );
  }

  /* ---------------- aurora follow + doodle parallax ---------------- */
  const auroraBlob = $("#aurora i");
  const depthEls = $$(".doodle[data-depth], .hero-face");
  if (fine && !reducedMotion && (auroraBlob || depthEls.length)) {
    let amx = 0.5, amy = 0.5, ax = 0.5, ay = 0.5;
    window.addEventListener("mousemove", (e) => {
      amx = e.clientX / window.innerWidth;
      amy = e.clientY / window.innerHeight;
    }, { passive: true });
    (function auroraLoop() {
      ax += (amx - ax) * 0.045;
      ay += (amy - ay) * 0.045;
      if (auroraBlob) {
        auroraBlob.style.transform =
          `translate(${((ax - 0.5) * 40).toFixed(2)}vw, ${((ay - 0.5) * 34).toFixed(2)}vh) scale(${(1 + ax * 0.25).toFixed(3)})`;
      }
      depthEls.forEach((el) => {
        const d = Number(el.dataset.depth || 2);
        el.style.translate = `${((ax - 0.5) * d * 10).toFixed(1)}px ${((ay - 0.5) * d * 8).toFixed(1)}px`;
      });
      requestAnimationFrame(auroraLoop);
    })();
  }

  /* ---------------- magnetic CTA ---------------- */
  if (fine && !reducedMotion) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transition = "transform .5s cubic-bezier(.65,0,.15,1)";
        el.style.transform = "translate(0,0)";
        setTimeout(() => (el.style.transition = ""), 500);
      });
    });
  }

  /* ---------------- case view ---------------- */
  const caseEl = $("#case");
  const caseScroll = $("#case-scroll");

  function openCase(index) {
    const p = projects[index];
    if (!p) return;
    $("#case-index").textContent = `PROJECT ${String(index + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
    $("#case-title").textContent = p.title;
    $("#case-meta").textContent = [p.category, p.year].filter(Boolean).join(" · ");
    $("#case-desc").textContent = p.description || "";

    let html = "";
    if (p.behanceProjectId) html += `<div class="embed behance"><iframe src="https://www.behance.net/embed/project/${p.behanceProjectId}?ilo0=1" allowfullscreen loading="lazy" allow="clipboard-write" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
    if (p.videoEmbed) html += `<div class="embed"><iframe src="${p.videoEmbed}" allowfullscreen loading="lazy"></iframe></div>`;
    if (Array.isArray(p.images) && p.images.length) html += p.images.map((src) => `<img src="${src}" alt="${p.title}" loading="lazy"/>`).join("");
    if (!html) html = `<div class="case-empty">No media yet —<br/>paste this project's Behance image URLs, video embed,<br/>or Behance project ID in <b>data.js</b></div>`;
    $("#case-media").innerHTML = html;
    $("#case-link").href = p.link || P.behance || "#";

    caseEl.hidden = false;
    requestAnimationFrame(() => caseEl.classList.add("open"));
    caseScroll.scrollTop = 0;
    if (lenis) lenis.stop();
    document.body.style.overflow = "hidden";
  }

  function closeCase() {
    caseEl.classList.remove("open");
    setTimeout(() => { caseEl.hidden = true; $("#case-media").innerHTML = ""; }, 660);
    if (lenis) lenis.start();
    document.body.style.overflow = "";
  }

  htrack.addEventListener("click", (e) => {
    const card = e.target.closest(".hcard");
    if (card) openCase(Number(card.dataset.index));
  });
  $("#case-close").addEventListener("click", closeCase);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && !caseEl.hidden) closeCase(); });

  /* ---------------- scroll progress bar ---------------- */
  const progress = $("#progress");
  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  }, { passive: true });

  /* ---------------- 3D tilt on work cards ---------------- */
  if (fine && !reducedMotion) {
    htrack.addEventListener("mousemove", (e) => {
      const card = e.target.closest(".hcard");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 10;
      card.style.transition = "transform .08s linear";
      card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-6px)`;
    }, { passive: true });
    htrack.addEventListener("mouseout", (e) => {
      const card = e.target.closest(".hcard");
      if (card && !card.contains(e.relatedTarget)) {
        card.style.transition = "";
        card.style.transform = "";
      }
    });
  }

  /* ---------------- stats count up ---------------- */
  const statEls = $$(".about-stat .v");
  if (statEls.length && "IntersectionObserver" in window && !reducedMotion) {
    const io = new IntersectionObserver((entries, obs) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      obs.disconnect();
      statEls.forEach((el) => {
        const m = el.textContent.trim().match(/^([\d.]+)(M|K)?(\+)?$/);
        if (!m) return;
        const target = parseFloat(m[1]) * (m[2] === "M" ? 1e6 : m[2] === "K" ? 1e3 : 1);
        const plus = m[3] || "";
        const t0 = performance.now();
        (function tick() {
          const p = Math.min(1, (performance.now() - t0) / 1300);
          const eased = 1 - Math.pow(1 - p, 3);
          const cur = target * eased;
          el.textContent =
            (cur >= 1e6 ? (Math.round(cur / 1e5) / 10).toFixed(cur < target ? 1 : 0) + "M"
             : cur >= 1e3 && target >= 1e3 && m[2] ? Math.round(cur / 1e3) + "K"
             : Math.round(cur)) + (p === 1 ? plus : "");
          if (p < 1) requestAnimationFrame(tick);
        })();
      });
    }, { threshold: 0.5 });
    io.observe($(".about-stats"));
  }

  /* ---------------- toolbox flashlight wall ---------------- */
  const wall = $("#toolbox-wall");
  if (wall) {
    const tools = DATA.toolbox || [];
    const html = tools.map((t) => `<span>${t}</span>`).join("");
    $("#tb-dim").innerHTML = html;
    $("#tb-lit").innerHTML = html;
    const lit = $("#tb-lit");
    let roaming = true;
    function setLight(x, y) {
      lit.style.setProperty("--mx", x + "px");
      lit.style.setProperty("--my", y + "px");
    }
    wall.addEventListener("pointermove", (e) => {
      roaming = false;
      const r = wall.getBoundingClientRect();
      setLight(e.clientX - r.left, e.clientY - r.top);
    });
    // auto-roaming light until the visitor takes over (and always on touch)
    (function roam(t) {
      if (roaming) {
        const w = wall.clientWidth, h = wall.clientHeight;
        setLight(w / 2 + Math.cos(t / 1700) * w * 0.38, h / 2 + Math.sin(t / 1100) * h * 0.42);
      }
      requestAnimationFrame(roam);
    })(0);
  }

  /* ---------------- throwable hero chips (grab & yeet) ---------------- */
  const hero = $("#hero");
  if (!reducedMotion) {
    $$(".hero-chips .chip").forEach((chip) => {
      let raf = null, px = 0, py = 0, vx = 0, vy = 0, lastT = 0, lastX = 0, lastY = 0, grabX = 0, grabY = 0;

      function physics(t) {
        const dt = Math.min(0.04, (t - lastT) / 1000) || 0.016;
        lastT = t;
        const hr = hero.getBoundingClientRect();
        const maxX = hr.width - chip.offsetWidth - 4;
        const maxY = hr.height - chip.offsetHeight - 6;
        vy += 2400 * dt;
        px += vx * dt;
        py += vy * dt;
        if (py >= maxY) { py = maxY; vy *= -0.55; vx *= 0.82; }
        if (px <= 4) { px = 4; vx *= -0.7; }
        if (px >= maxX) { px = maxX; vx *= -0.7; }
        chip.style.left = px + "px";
        chip.style.top = py + "px";
        chip.style.transform = `rotate(${(vx * 0.01).toFixed(1)}deg)`;
        if (py >= maxY - 0.5 && Math.abs(vy) < 40 && Math.abs(vx) < 12) return; // settled
        raf = requestAnimationFrame(physics);
      }

      chip.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        cancelAnimationFrame(raf);
        const hr = hero.getBoundingClientRect();
        const cr = chip.getBoundingClientRect();
        if (!chip.classList.contains("thrown")) {
          chip.classList.add("thrown");
          hero.appendChild(chip);
        }
        px = cr.left - hr.left; py = cr.top - hr.top;
        grabX = e.clientX - cr.left; grabY = e.clientY - cr.top;
        chip.style.left = px + "px"; chip.style.top = py + "px";
        lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
        vx = 0; vy = 0;
        chip.setPointerCapture(e.pointerId);

        function move(ev) {
          const now = performance.now();
          const dt = Math.max(1, now - lastT);
          vx = ((ev.clientX - lastX) / dt) * 1000;
          vy = ((ev.clientY - lastY) / dt) * 1000;
          lastX = ev.clientX; lastY = ev.clientY; lastT = now;
          const hr2 = hero.getBoundingClientRect();
          px = ev.clientX - hr2.left - grabX;
          py = ev.clientY - hr2.top - grabY;
          chip.style.left = px + "px";
          chip.style.top = py + "px";
        }
        function up() {
          chip.removeEventListener("pointermove", move);
          chip.removeEventListener("pointerup", up);
          chip.removeEventListener("pointercancel", up);
          lastT = performance.now();
          raf = requestAnimationFrame(physics);
        }
        chip.addEventListener("pointermove", move);
        chip.addEventListener("pointerup", up);
        chip.addEventListener("pointercancel", up);
      });
    });
  }

  /* ---------------- click confetti ---------------- */
  if (!reducedMotion) {
    const palette = () => [getComputedStyle(document.documentElement).getPropertyValue("--lime").trim(), "#ff4524", "#2c39e8", "#f2ede4"];
    document.addEventListener("click", (e) => {
      const colors = palette();
      for (let i = 0; i < 6; i++) {
        const c = document.createElement("span");
        c.className = "confetti";
        c.style.left = e.clientX + "px";
        c.style.top = e.clientY + "px";
        c.style.background = colors[i % colors.length];
        document.body.appendChild(c);
        const a = Math.random() * Math.PI * 2;
        const d = 40 + Math.random() * 70;
        c.animate(
          [
            { transform: "translate(-50%,-50%) scale(1) rotate(0deg)", opacity: 1 },
            { transform: `translate(calc(-50% + ${(Math.cos(a) * d).toFixed(0)}px), calc(-50% + ${(Math.sin(a) * d + 26).toFixed(0)}px)) scale(.3) rotate(${(Math.random() * 240 - 120).toFixed(0)}deg)`, opacity: 0 },
          ],
          { duration: 550 + Math.random() * 250, easing: "cubic-bezier(.2,.6,.3,1)" }
        ).onfinish = () => c.remove();
      }
    });
  }

  /* ---------------- accent theme switcher ---------------- */
  const THEMES = [
    { name: "LIME", color: "#d9ff3d" },
    { name: "CYAN", color: "#5fe8ff" },
    { name: "PINK", color: "#ff9dd6" },
    { name: "TANGERINE", color: "#ffb13d" },
  ];
  let themeIdx = Math.max(0, THEMES.findIndex((t) => t.name === localStorage.getItem("vb-theme")));
  function applyTheme(announce) {
    const t = THEMES[themeIdx];
    document.documentElement.style.setProperty("--lime", t.color);
    localStorage.setItem("vb-theme", t.name);
    if (announce) showToast("🎨 ACCENT: " + t.name);
  }
  applyTheme(false);
  $("#theme-btn").addEventListener("click", () => {
    themeIdx = (themeIdx + 1) % THEMES.length;
    applyTheme(true);
  });

  /* ---------------- toast + konami party mode ---------------- */
  const toast = $("#toast");
  let toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }
  const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let ki = 0;
  window.addEventListener("keydown", (e) => {
    ki = e.key === KONAMI[ki] ? ki + 1 : (e.key === KONAMI[0] ? 1 : 0);
    if (ki === KONAMI.length) {
      ki = 0;
      document.body.classList.toggle("party");
      showToast(document.body.classList.contains("party") ? "🎉 PARTY MODE ON" : "PARTY MODE OFF");
    }
  });
})();
