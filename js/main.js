/* ═══════════════════════════════════════════════════════════════════════════
   Ferdous Wahid Fahim — Data Analyst · Digital / Growth / Performance Marketer
   Complete Interactive Engine:
   - Effect 1: Hanging, Stretchy ID Card (Verlet Rope Physics)
   - Effect 2: Interactive Lens / X-Ray Photo Reveal (lerp 0.18)
   - Effect 3: 3D Floating "Let's Collab" Magnetic Goo Pill
   - Effect 4: 3-Layer Cursor Follower Ring (lerp 0.2 / 0.12)
   - Live Ad Spend Leak & ROI Calculator
   - Full Multi-Field Lead Capture Form (AJAX + WhatsApp + Local Backup)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(pointer: coarse)").matches || ("ontouchstart" in window);

  /* ── 1. Sticky Nav, Scroll Progress Bar & Mobile Drawer ── */
  var nav = document.querySelector(".nav");
  var progress = document.getElementById("scrollProgress");
  if (!progress) {
    progress = document.createElement("div");
    progress.id = "scrollProgress";
    progress.className = "scroll-progress";
    document.body.prepend(progress);
  }

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) {
      if (y > 8) nav.classList.add("is-stuck");
      else nav.classList.remove("is-stuck");
    }
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    if (progress && docH > 0) {
      progress.style.width = Math.min(100, Math.max(0, (y / docH) * 100)).toFixed(1) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ── 2. Copyright Year & Role Badge Cycler ── */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  var rolePills = document.querySelectorAll(".role-pill");
  if (rolePills.length > 1 && !reduceMotion) {
    var rIdx = 0;
    setInterval(function () {
      rolePills.forEach(function (p) { p.classList.remove("is-highlight"); });
      rIdx = (rIdx + 1) % rolePills.length;
      rolePills[rIdx].classList.add("is-highlight");
    }, 2200);
  }

  /* ── 3. EFFECT 1: Hanging, Stretchy ID Card (Verlet Rope Physics — PDF Page 4) ── */
  var stage = document.getElementById("idStage");
  var card = document.getElementById("idCard");
  var strapPath = document.getElementById("lanyardPath");
  var strapShadow = document.getElementById("lanyardShadow");

  if (stage && card && strapPath) {
    var SEGMENTS = 12;
    var GRAVITY = 0.55;
    var DAMPING = 0.982;
    var MAX_SPEED = 16;
    var CONSTRAINT_ITERS = 7;

    var points = [];
    var segLen = 11;
    var anchorX = 0;
    var anchorY = 0;
    var running = false;
    var dragging = false;
    var dragOffsetX = 0;
    var dragOffsetY = 0;
    var pointerX = 0;
    var pointerY = 0;
    var prevPointerX = 0;
    var prevPointerY = 0;
    var throwVX = 0;
    var throwVY = 0;
    var cardAngle = 0;

    function measureStage() {
      var rect = stage.getBoundingClientRect();
      var isMobile = window.innerWidth <= 580;
      var ropeTotal = isMobile ? 76 : 92;
      segLen = ropeTotal / SEGMENTS;
      anchorX = rect.width * 0.5;
      anchorY = 2;
      return rect;
    }

    function initRope(dropFromTop) {
      measureStage();
      points = [];
      var startOffsetY = dropFromTop && !reduceMotion ? -(SEGMENTS * segLen + 260) : 0;
      for (var i = 0; i <= SEGMENTS; i++) {
        var x = anchorX + (dropFromTop && !reduceMotion ? i * 1.8 : 0);
        var y = anchorY + i * segLen + (i === 0 ? 0 : startOffsetY);
        points.push({
          x: x,
          y: y,
          ox: x - (dropFromTop && !reduceMotion && i === SEGMENTS ? 3.5 : 0),
          oy: y
        });
      }
      renderFrame();
      if (!reduceMotion) startLoop();
    }

    function buildCurvePath(pts, offsetX, offsetY) {
      var ox = offsetX || 0;
      var oy = offsetY || 0;
      var d = "M " + (pts[0].x + ox).toFixed(1) + " " + (pts[0].y + oy).toFixed(1);
      for (var i = 1; i < pts.length - 1; i++) {
        var xc = (pts[i].x + pts[i + 1].x) * 0.5 + ox;
        var yc = (pts[i].y + pts[i + 1].y) * 0.5 + oy;
        d += " Q " + (pts[i].x + ox).toFixed(1) + " " + (pts[i].y + oy).toFixed(1) + ", " + xc.toFixed(1) + " " + yc.toFixed(1);
      }
      var last = pts[pts.length - 1];
      d += " L " + (last.x + ox).toFixed(1) + " " + (last.y + oy).toFixed(1);
      return d;
    }

    function stepPhysics() {
      var totalMotion = 0;

      for (var i = 1; i <= SEGMENTS; i++) {
        var p = points[i];
        if (dragging && i === SEGMENTS) {
          p.ox = p.x;
          p.oy = p.y;
          p.x = pointerX;
          p.y = pointerY;
          continue;
        }
        var vx = (p.x - p.ox) * DAMPING;
        var vy = (p.y - p.oy) * DAMPING + GRAVITY;
        var speed = Math.hypot(vx, vy);
        if (speed > MAX_SPEED) {
          vx = (vx / speed) * MAX_SPEED;
          vy = (vy / speed) * MAX_SPEED;
        }
        p.ox = p.x;
        p.oy = p.y;
        p.x += vx;
        p.y += vy;
        totalMotion += Math.abs(vx) + Math.abs(vy);
      }

      var stiffness = dragging ? 0.62 : 1.0;
      for (var iter = 0; iter < CONSTRAINT_ITERS; iter++) {
        points[0].x = anchorX;
        points[0].y = anchorY;
        if (dragging) {
          points[SEGMENTS].x = pointerX;
          points[SEGMENTS].y = pointerY;
        }

        for (var j = 0; j < SEGMENTS; j++) {
          var a = points[j];
          var b = points[j + 1];
          var dx = b.x - a.x;
          var dy = b.y - a.y;
          var dist = Math.hypot(dx, dy) || 0.0001;

          if (dist > segLen) {
            var diff = ((dist - segLen) / dist) * stiffness;
            if (j === 0) {
              if (!(dragging && j + 1 === SEGMENTS)) {
                b.x -= dx * diff;
                b.y -= dy * diff;
              }
            } else if (dragging && j + 1 === SEGMENTS) {
              a.x += dx * diff;
              a.y += dy * diff;
            } else {
              a.x += dx * diff * 0.5;
              a.y += dy * diff * 0.5;
              b.x -= dx * diff * 0.5;
              b.y -= dy * diff * 0.5;
            }
          }
        }
      }

      return totalMotion;
    }

    function renderFrame() {
      var tip = points[SEGMENTS];
      var prev = points[SEGMENTS - 2] || points[SEGMENTS - 1];
      var dx = tip.x - prev.x;
      var dy = Math.max(tip.y - prev.y, 8);
      var targetAngle = Math.atan2(-dx, dy) * (180 / Math.PI) * 0.65;
      targetAngle = Math.max(-38, Math.min(38, targetAngle));
      cardAngle += (targetAngle - cardAngle) * 0.28;

      var cardW = card.offsetWidth || 258;
      var cardX = tip.x - cardW * 0.5;
      var cardY = tip.y + 16;

      card.style.transform =
        "translate3d(" + cardX.toFixed(1) + "px, " + cardY.toFixed(1) + "px, 0) rotate(" + cardAngle.toFixed(2) + "deg)";

      var pathData = buildCurvePath(points, 0, 0);
      strapPath.setAttribute("d", pathData);
      if (strapShadow) {
        strapShadow.setAttribute("d", buildCurvePath(points, 4, 6));
      }
    }

    function tick() {
      if (!running) return;
      var motion = stepPhysics();
      renderFrame();

      var tip = points[SEGMENTS];
      var distFromRest = Math.abs(tip.x - anchorX) + Math.abs(tip.y - (anchorY + SEGMENTS * segLen));
      if (!dragging && motion < 0.06 && distFromRest < 1.2 && Math.abs(cardAngle) < 0.25) {
        running = false;
        return;
      }
      requestAnimationFrame(tick);
    }

    function startLoop() {
      if (!running) {
        running = true;
        requestAnimationFrame(tick);
      }
    }

    card.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      var rect = stage.getBoundingClientRect();
      var tip = points[SEGMENTS];
      dragging = true;
      card.classList.add("is-dragging");
      if (card.setPointerCapture) {
        try { card.setPointerCapture(e.pointerId); } catch (_) {}
      }

      var localX = e.clientX - rect.left;
      var localY = e.clientY - rect.top;
      dragOffsetX = tip.x - localX;
      dragOffsetY = tip.y - localY;
      pointerX = tip.x;
      pointerY = tip.y;
      prevPointerX = pointerX;
      prevPointerY = pointerY;
      throwVX = 0;
      throwVY = 0;
      startLoop();
    });

    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var rect = stage.getBoundingClientRect();
      var rawX = e.clientX - rect.left + dragOffsetX;
      var rawY = e.clientY - rect.top + dragOffsetY;

      var maxStretchX = rect.width * 0.46;
      pointerX = Math.max(anchorX - maxStretchX, Math.min(anchorX + maxStretchX, rawX));
      pointerY = Math.max(24, Math.min(rect.height - 150, rawY));

      throwVX = (pointerX - prevPointerX) * 0.45;
      throwVY = (pointerY - prevPointerY) * 0.45;
      prevPointerX = pointerX;
      prevPointerY = pointerY;
    }, { passive: true });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      card.classList.remove("is-dragging");
      if (e && card.releasePointerCapture) {
        try { card.releasePointerCapture(e.pointerId); } catch (_) {}
      }
      var tip = points[SEGMENTS];
      var clampVX = Math.max(-12, Math.min(12, throwVX));
      var clampVY = Math.max(-12, Math.min(12, throwVY));
      tip.ox = tip.x - clampVX;
      tip.oy = tip.y - clampVY;
      startLoop();
    }

    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    window.addEventListener("resize", function () {
      var oldAnchorX = anchorX;
      measureStage();
      var shiftX = anchorX - oldAnchorX;
      for (var i = 0; i < points.length; i++) {
        points[i].x += shiftX;
        points[i].ox += shiftX;
      }
      renderFrame();
      startLoop();
    });

    initRope(true);
  }

  /* ── 4. EFFECT 2: Lens / X-Ray Photo Reveal (PDF Page 5 — lerp 0.18) ── */
  var lensFrames = document.querySelectorAll(".lens-frame");
  lensFrames.forEach(function (frame) {
    var mx = 155, my = 170;
    var tx = 155, ty = 170;
    var r = 0, tr = 0;
    var lensRunning = false;
    var pressed = false;

    function updateLens() {
      mx += (tx - mx) * 0.18;
      my += (ty - my) * 0.18;
      r += (tr - r) * 0.18;

      frame.style.setProperty("--mx", mx.toFixed(1) + "px");
      frame.style.setProperty("--my", my.toFixed(1) + "px");
      frame.style.setProperty("--r", r.toFixed(1) + "px");

      if (Math.abs(tx - mx) > 0.2 || Math.abs(ty - my) > 0.2 || Math.abs(tr - r) > 0.2) {
        requestAnimationFrame(updateLens);
      } else {
        lensRunning = false;
      }
    }

    function kickLens() {
      if (!lensRunning) {
        lensRunning = true;
        requestAnimationFrame(updateLens);
      }
    }

    function setTargetFromEvent(e) {
      var rect = frame.getBoundingClientRect();
      tx = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      ty = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
      var baseR = rect.width * (pressed ? 0.34 : 0.23);
      tr = baseR;
      frame.classList.add("is-active");
      kickLens();
    }

    frame.addEventListener("pointerenter", function (e) {
      var rect = frame.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
      setTargetFromEvent(e);
      if (cursorLayer) cursorLayer.classList.add("is-hidden");
    });

    frame.addEventListener("pointermove", setTargetFromEvent);

    frame.addEventListener("pointerdown", function (e) {
      pressed = true;
      setTargetFromEvent(e);
    });

    window.addEventListener("pointerup", function () {
      if (pressed) {
        pressed = false;
        if (frame.classList.contains("is-active")) {
          tr = frame.getBoundingClientRect().width * 0.23;
          kickLens();
        }
      }
    });

    frame.addEventListener("pointerleave", function () {
      pressed = false;
      tr = 0;
      frame.classList.remove("is-active");
      kickLens();
      if (cursorLayer) cursorLayer.classList.remove("is-hidden");
    });
  });

  /* ── 5. EFFECT 3: 3D Floating "Let's Collab" Magnetic Goo Pill (PDF Page 6) ── */
  var gooPill = document.getElementById("gooPill");
  if (gooPill && !isTouch && !reduceMotion) {
    window.addEventListener("pointermove", function (e) {
      var rect = gooPill.getBoundingClientRect();
      var cx = rect.left + rect.width * 0.5;
      var cy = rect.top + rect.height * 0.5;
      var dx = e.clientX - cx;
      var dy = e.clientY - cy;
      var dist = Math.hypot(dx, dy);
      if (dist < 170) {
        var pull = (1 - dist / 170) * 0.28;
        var sx = 1 + Math.abs(dx) * 0.0008;
        var sy = 1 - Math.abs(dx) * 0.0004;
        gooPill.style.transform =
          "translate3d(" + (dx * pull).toFixed(1) + "px, " + (dy * pull).toFixed(1) + "px, 0) scale(" + sx.toFixed(3) + ", " + sy.toFixed(3) + ")";
      } else {
        gooPill.style.transform = "translate3d(0,0,0) scale(1,1)";
      }
    }, { passive: true });
  }

  /* ── 6. EFFECT 4: 3-Layer Cursor Follower Ring (PDF Page 6) ── */
  var cursorLayer = null;
  if (!isTouch && !reduceMotion) {
    cursorLayer = document.createElement("div");
    cursorLayer.className = "cursor-layer is-hidden";
    cursorLayer.setAttribute("aria-hidden", "true");
    cursorLayer.innerHTML = '<div class="c-halo"></div><div class="c-ring"></div><div class="c-dot"></div>';
    document.body.appendChild(cursorLayer);

    var cDot = cursorLayer.querySelector(".c-dot");
    var cRing = cursorLayer.querySelector(".c-ring");
    var cHalo = cursorLayer.querySelector(".c-halo");

    var cmx = window.innerWidth * 0.5, cmy = window.innerHeight * 0.5;
    var rx = cmx, ry = cmy;
    var hx = cmx, hy = cmy;
    var cActive = false;

    function tickCursor() {
      rx += (cmx - rx) * 0.2;
      ry += (cmy - ry) * 0.2;
      hx += (cmx - hx) * 0.12;
      hy += (cmy - hy) * 0.12;

      cDot.style.transform = "translate3d(" + cmx.toFixed(1) + "px, " + cmy.toFixed(1) + "px, 0)";
      cRing.style.transform = "translate3d(" + rx.toFixed(1) + "px, " + ry.toFixed(1) + "px, 0)";
      cHalo.style.transform = "translate3d(" + hx.toFixed(1) + "px, " + hy.toFixed(1) + "px, 0)";

      if (Math.abs(cmx - hx) > 0.15 || Math.abs(cmy - hy) > 0.15) {
        requestAnimationFrame(tickCursor);
      } else {
        cActive = false;
      }
    }

    window.addEventListener("pointermove", function (e) {
      cmx = e.clientX;
      cmy = e.clientY;
      cursorLayer.classList.remove("is-hidden");
      var hoverTarget = e.target.closest("a, button, select, input, textarea, summary, .id-card");
      if (hoverTarget) cursorLayer.classList.add("is-hover");
      else cursorLayer.classList.remove("is-hover");

      if (!cActive) {
        cActive = true;
        requestAnimationFrame(tickCursor);
      }
    }, { passive: true });
  }

  /* ── 7. Interactive Ad Spend Leak & Growth ROI Calculator ── */
  var spendRange = document.getElementById("calcSpend");
  var cvrRange = document.getElementById("calcCvr");
  var cpcRange = document.getElementById("calcCpc");

  function updateCalculator() {
    if (!spendRange || !cvrRange || !cpcRange) return;
    var spend = parseFloat(spendRange.value) || 5000;
    var cvr = parseFloat(cvrRange.value) || 6;
    var cpc = parseFloat(cpcRange.value) || 4.5;

    var spendLbl = document.getElementById("calcSpendVal");
    var cvrLbl = document.getElementById("calcCvrVal");
    var cpcLbl = document.getElementById("calcCpcVal");

    if (spendLbl) spendLbl.textContent = "$" + spend.toLocaleString();
    if (cvrLbl) cvrLbl.textContent = cvr.toFixed(1) + "%";
    if (cpcLbl) cpcLbl.textContent = "$" + cpc.toFixed(2);

    var clicks = spend / cpc;
    var currentLeads = Math.round(clicks * (cvr / 100));
    /* Typical wasted spend from unfiltered search terms + broken conversion signals ~28% */
    var wastedSpend = Math.round(spend * 0.28);
    /* Projected leads after Tracking-First rebuild + negative keyword shield (+38% efficiency) */
    var projectedLeads = Math.max(currentLeads + 4, Math.round(currentLeads * 1.42));
    var extraLeads = projectedLeads - currentLeads;
    var newCpa = projectedLeads > 0 ? (spend / projectedLeads) : 0;

    var elWaste = document.getElementById("coWaste");
    var elLeads = document.getElementById("coLeads");
    var elCpa = document.getElementById("coCpa");

    if (elWaste) elWaste.textContent = "$" + wastedSpend.toLocaleString() + "/mo";
    if (elLeads) elLeads.textContent = "+" + extraLeads + " Leads/mo";
    if (elCpa) elCpa.textContent = "$" + newCpa.toFixed(2);

    var calcCta = document.getElementById("calcApplyBtn");
    if (calcCta) {
      calcCta.onclick = function () {
        var afGoal = document.getElementById("afGoal");
        var afBudget = document.getElementById("afBudget");
        if (afGoal) {
          afGoal.value =
            "Current spend ~$" + spend.toLocaleString() + "/mo (CVR " + cvr + "%, CPC $" + cpc + "). Want to stop ~$" + wastedSpend.toLocaleString() + "/mo leak & unlock +" + extraLeads + " leads.";
        }
        if (afBudget) {
          if (spend < 3000) afBudget.value = "$1K – $3K / mo";
          else if (spend <= 10000) afBudget.value = "$3K – $10K / mo";
          else afBudget.value = "$10K – $25K+ / mo";
        }
      };
    }
  }

  if (spendRange && cvrRange && cpcRange) {
    spendRange.addEventListener("input", updateCalculator);
    cvrRange.addEventListener("input", updateCalculator);
    cpcRange.addEventListener("input", updateCalculator);
    updateCalculator();
  }

  /* ── 8. Animated Counters & Skill Bars ── */
  var counters = document.querySelectorAll(".counter");
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    var start = null;
    var dur = 1300;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCounter(en.target); cObs.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cObs.observe(c); });
  } else {
    counters.forEach(animateCounter);
  }

  var bars = document.querySelectorAll(".bar");
  if ("IntersectionObserver" in window) {
    var bObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("fill"); bObs.unobserve(en.target); }
      });
    }, { threshold: 0.35 });
    bars.forEach(function (b) { bObs.observe(b); });
  } else {
    bars.forEach(function (b) { b.classList.add("fill"); });
  }

  /* ── 9. Scroll Reveal & Pipeline Board Tilt Flatten ── */
  var revealTargets = document.querySelectorAll(
    ".sec-head, .leak-card, .proof-frame, .svc, .pkg-card, .case, .deep-case, .niche-col, .steps li, .about-copy, .stat-card, .cert-card, .tl-item, .quote-grid blockquote, .faq details, .cta-box, .calc-box, .pipeline-board, .skill"
  );
  if ("IntersectionObserver" in window && !reduceMotion) {
    var rObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          if (en.target.classList.contains("pipeline-board")) {
            en.target.classList.add("is-flat");
          }
          rObs.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
    revealTargets.forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = ((i % 4) * 45) + "ms";
      rObs.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ── 10. Marquee Duplicate ── */
  var track = document.getElementById("marqueeTrack");
  if (track) track.innerHTML += track.innerHTML;

  /* ── 11. Lightbox for Dashboard Proof Screenshots ── */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbClose = document.getElementById("lbClose");

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lbImg.src = "";
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-lightbox]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var src = btn.getAttribute("data-lightbox");
      if (!src || !lightbox || !lbImg) return;
      lbImg.src = src;
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });

  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
  });

  /* ── 12. Full Multi-Field Lead Capture Form (Direct Email AJAX + WhatsApp + Local Backup) ── */
  var afService = document.getElementById("afService");
  document.querySelectorAll("[data-service]").forEach(function (link) {
    link.addEventListener("click", function () {
      var svc = link.getAttribute("data-service");
      if (!afService || !svc) return;
      if (svc.indexOf("Tracking") !== -1) {
        afService.value = "Fix Broken GA4 / GTM / Conversion Tracking";
      } else if (svc.indexOf("Server-Side") !== -1) {
        afService.value = "Server-Side Tracking (Stape.io / Meta CAPI)";
      } else {
        afService.value = "Scale Existing Google Ads Campaigns";
      }
    });
  });

  var auditForm = document.getElementById("auditForm");
  var afWaBtn = document.getElementById("afWaBtn");
  var afStatus = document.getElementById("afStatus");

  function collectLeadData() {
    return {
      name: ((document.getElementById("afName") || {}).value || "").trim(),
      email: ((document.getElementById("afEmail") || {}).value || "").trim(),
      phone: ((document.getElementById("afPhone") || {}).value || "").trim(),
      site: ((document.getElementById("afSite") || {}).value || "").trim(),
      service: ((document.getElementById("afService") || {}).value || "Google Ads + Conversion Tracking Audit"),
      budget: ((document.getElementById("afBudget") || {}).value || "$3K – $10K / mo"),
      goal: ((document.getElementById("afGoal") || {}).value || "").trim(),
      submittedAt: new Date().toISOString()
    };
  }

  function formatWhatsAppText(d) {
    var lines = [
      "Hi Fahim, I just submitted the Lead / Audit Form on your website:",
      "• Name: " + (d.name || "Not provided"),
      "• Email: " + (d.email || "Not provided"),
      "• Phone/WA: " + (d.phone || "Not provided"),
      "• Service: " + d.service,
      "• Monthly Budget: " + d.budget
    ];
    if (d.site) lines.push("• Website: " + d.site);
    if (d.goal) lines.push("• Challenge / Goal: " + d.goal);
    return lines.join("\n");
  }

  function saveLeadLocally(d) {
    try {
      var existing = JSON.parse(localStorage.getItem("fahim_portfolio_leads") || "[]");
      existing.unshift(d);
      localStorage.setItem("fahim_portfolio_leads", JSON.stringify(existing.slice(0, 50)));
    } catch (_) {}
  }

  if (auditForm) {
    auditForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = collectLeadData();
      saveLeadLocally(d);

      var submitBtn = auditForm.querySelector('button[type="submit"]');
      var origText = submitBtn ? submitBtn.textContent : "Submit Lead";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending Lead...";
      }

      fetch("https://formsubmit.co/ajax/ferdouswahidfahim24@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: "New Portfolio Lead: " + (d.name || d.site || d.service),
          Name: d.name,
          Email: d.email,
          Phone_WhatsApp: d.phone,
          Website: d.site,
          Service_Needed: d.service,
          Monthly_Budget: d.budget,
          Challenge_Goal: d.goal
        })
      })
        .then(function () {
          if (afStatus) {
            afStatus.textContent = "✓ Thank you, " + (d.name || "friend") + "! Your audit request has been received. Want an instant reply? Click the green WhatsApp button below.";
            afStatus.classList.add("is-visible");
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "✓ Lead Sent Successfully";
          }
        })
        .catch(function () {
          /* Fallback to mailto if offline or blocked */
          if (afStatus) {
            afStatus.textContent = "✓ Lead saved! Opening your email client or click WhatsApp below for instant chat.";
            afStatus.classList.add("is-visible");
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = origText;
          }
          var mailUrl = "mailto:ferdouswahidfahim24@gmail.com?subject=" +
            encodeURIComponent("New Audit Lead: " + (d.name || d.service)) +
            "&body=" + encodeURIComponent(formatWhatsAppText(d));
          window.location.href = mailUrl;
        });
    });
  }

  if (afWaBtn) {
    afWaBtn.addEventListener("click", function () {
      var d = collectLeadData();
      saveLeadLocally(d);
      var waUrl = "https://wa.me/8801521724734?text=" + encodeURIComponent(formatWhatsAppText(d));
      window.open(waUrl, "_blank", "noopener");
    });
  }
})();


/* ═══════════════════════════════════════════════════════════════════════════
   13. "PROOF OF SKILL" LIVE GTM / DATALAYER TELEMETRY + QUIZ + CALL BOOKING
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  window.dataLayer = window.dataLayer || [];

  function pushTrackingEvent(eventName, params) {
    var payload = Object.assign({ event: eventName, timestamp: new Date().toLocaleTimeString() }, params || {});
    window.dataLayer.push(payload);
  }

  /* Initial page_view event */
  pushTrackingEvent("page_view", { page: window.location.pathname.split("/").pop() || "index.html", signal: "100%" });

  /* Hook into ID Card, Lens, Calculator, Video, and Lead Form */
  var idCard = document.getElementById("idCard");
  if (idCard) {
    idCard.addEventListener("pointerdown", function () {
      pushTrackingEvent("id_card_grabbed", { component: "hero_lanyard" });
    });
  }

  document.querySelectorAll(".lens-frame").forEach(function (lf) {
    lf.addEventListener("pointerenter", function () {
      pushTrackingEvent("lens_hud_inspected", { role: "Data_Analyst_HUD" });
    });
  });

  var calcSpend = document.getElementById("calcSpend");
  if (calcSpend) {
    calcSpend.addEventListener("change", function () {
      pushTrackingEvent("roi_calculator_used", { spend: "$" + calcSpend.value });
    });
  }

  var auditVideo = document.getElementById("auditVideo");
  if (auditVideo) {
    auditVideo.addEventListener("play", function () {
      pushTrackingEvent("audit_video_played", { duration: "90s_walkthrough" });
    });
  }

  var auditForm = document.getElementById("auditForm");
  if (auditForm) {
    auditForm.addEventListener("submit", function () {
      pushTrackingEvent("generate_lead", { method: "lead_form", value: "audit_request" });
    });
  }

  /* ── 60-Second Tracking Health Quiz Scorecard ── */
  var quizItems = document.querySelectorAll(".quiz-item");
  var qrScore = document.getElementById("qrScoreVal");
  var qrStatus = document.getElementById("qrStatus");
  var qrDesc = document.getElementById("qrDesc");
  var qrApplyBtn = document.getElementById("qrApplyBtn");
  var quizAnswers = {};

  function evaluateQuiz() {
    var totalQuestions = quizItems.length || 5;
    var score = 0;
    var answeredCount = 0;
    var issues = [];

    quizItems.forEach(function (item, idx) {
      var ans = quizAnswers[idx];
      if (ans !== undefined) {
        answeredCount++;
        if (ans === "good") {
          score += 20;
        } else {
          issues.push(item.getAttribute("data-issue") || ("Signal issue #" + (idx + 1)));
        }
      }
    });

    if (answeredCount === 0) return;

    if (qrScore) qrScore.textContent = score + "/100";
    if (qrStatus && qrDesc) {
      if (score <= 40) {
        qrStatus.textContent = "⚠️ Critical Budget Leak Detected";
        qrStatus.style.color = "#FCA5A5";
        qrDesc.textContent = "Your Smart Bidding is likely optimizing on broken or incomplete signals. Fixing your GTM/GA4 + Server-Side setup should be priority #1.";
      } else if (score <= 80) {
        qrStatus.textContent = "⚡ Moderate Signal Loss (" + score + "/100)";
        qrStatus.style.color = "#FDE047";
        qrDesc.textContent = "You have foundational tracking, but missing Enhanced/Server-Side or call attribution is costing you 20–35% of attribution accuracy.";
      } else {
        qrStatus.textContent = "✅ Strong Signal Architecture (100/100)";
        qrStatus.style.color = "#4ADE80";
        qrDesc.textContent = "Your tracking foundation looks solid! You are ready for aggressive Search, PMax & CRO scaling.";
      }
    }

    pushTrackingEvent("tracking_quiz_scored", { score: score + "/100", answered: answeredCount + "/" + totalQuestions });

    if (qrApplyBtn) {
      qrApplyBtn.onclick = function () {
        var afGoal = document.getElementById("afGoal");
        var afService = document.getElementById("afService");
        if (afService) afService.value = "Data Analysis + GA4 / GTM Tracking Fix";
        if (afGoal) {
          afGoal.value = "Tracking Health Quiz Score: " + score + "/100. Issues flagged: " + (issues.join(", ") || "Ready to scale campaigns.");
        }
      };
    }
  }

  quizItems.forEach(function (item, idx) {
    var btns = item.querySelectorAll(".q-opt");
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) { b.classList.remove("active-good", "active-bad"); });
        var type = btn.getAttribute("data-ans");
        quizAnswers[idx] = type;
        item.classList.add("is-answered");
        btn.classList.add(type === "good" ? "active-good" : "active-bad");
        evaluateQuiz();
      });
    });
  });

  /* ── Direct 30-Min Call Slot Picker inside Lead Form ── */
  var slotPills = document.querySelectorAll(".slot-pill");
  slotPills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      slotPills.forEach(function (p) { p.classList.remove("is-selected"); });
      pill.classList.add("is-selected");
      var slotText = pill.getAttribute("data-slot");
      var afGoal = document.getElementById("afGoal");
      if (afGoal && slotText) {
        var current = afGoal.value.replace(/\[Preferred Call Slot:.*?\]\s*/g, "");
        afGoal.value = "[Preferred Call Slot: " + slotText + "] " + current;
      }
      pushTrackingEvent("call_slot_selected", { slot: slotText });
    });
  });
})();


/* ═══════════════════════════════════════════════════════════════════════════
   14. INTERACTIVE VIDEO WALKTHROUGH PLAYER WITH VOICEOVER & SOUND
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var player = document.getElementById("walkthroughPlayer");
  if (!player) return;

  var stage = player.querySelector(".wp-stage");
  var scenes = player.querySelectorAll(".wp-scene");
  var chapters = player.querySelectorAll(".wp-chap");
  var playBtn = document.getElementById("wpPlayBtn");
  var soundBtn = document.getElementById("wpSoundBtn");
  var captionBar = document.getElementById("wpCaptionBar");
  var progBar = document.getElementById("wpProgBar");
  var progTrack = document.getElementById("wpProgTrack");
  var timeEl = document.getElementById("wpTime");

  /* Inject After Effects Motion Graphics Layers (Particle Canvas + Scanline + Glow Orb + Audio Waveform) */
  var aeWaveform = document.createElement("span");
  aeWaveform.className = "ae-waveform";
  aeWaveform.setAttribute("aria-hidden", "true");
  aeWaveform.innerHTML = "<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>";
  if (soundBtn && soundBtn.parentNode) {
    soundBtn.parentNode.insertBefore(aeWaveform, soundBtn);
  }

  if (stage) {
    var scanline = document.createElement("div");
    scanline.className = "ae-scanline";
    var orb = document.createElement("div");
    orb.className = "ae-glow-orb";
    var canvas = document.createElement("canvas");
    canvas.className = "ae-canvas";
    stage.prepend(orb);
    stage.prepend(scanline);
    stage.prepend(canvas);

    var ctx = canvas.getContext("2d");
    var particles = [];
    for (var p = 0; p < 28; p++) {
      particles.push({
        x: Math.random() * 900,
        y: Math.random() * 400,
        r: Math.random() * 2 + 0.8,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -Math.random() * 0.55 - 0.15,
        a: Math.random() * 0.55 + 0.2
      });
    }

    function resizeAeCanvas() {
      var r = stage.getBoundingClientRect();
      canvas.width = r.width || 800;
      canvas.height = r.height || 390;
    }
    resizeAeCanvas();
    window.addEventListener("resize", resizeAeCanvas);

    function drawAeParticles() {
      if (!ctx) return;
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      /* Subtle AE cyber grid */
      ctx.strokeStyle = "rgba(56, 189, 248, 0.05)";
      ctx.lineWidth = 1;
      for (var gx = 0; gx < w; gx += 44) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }
      for (var gy = 0; gy < h; gy += 44) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }

      /* Floating glowing data nodes + connecting lines */
      for (var i = 0; i < particles.length; i++) {
        var pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        if (pt.y < -10) pt.y = h + 10;
        if (pt.x < -10) pt.x = w + 10;
        if (pt.x > w + 10) pt.x = -10;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56, 189, 248, " + pt.a + ")";
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var pt2 = particles[j];
          var d = Math.hypot(pt.x - pt2.x, pt.y - pt2.y);
          if (d < 95) {
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt2.x, pt2.y);
            ctx.strokeStyle = "rgba(56, 189, 248, " + ((1 - d / 95) * 0.14).toFixed(3) + ")";
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawAeParticles);
    }
    requestAnimationFrame(drawAeParticles);
  }

  var voAudio = document.getElementById("voAudioPlayer");
  var TOTAL_MS = 36000; /* 36 seconds total (9s per scene when muted) */
  var SCENE_MS = TOTAL_MS / scenes.length;
  var elapsed = 0;
  var isPlaying = true;
  var soundEnabled = false;
  var lastTick = performance.now();
  var activeIdx = 0;
  var audioCtx = null;

  function playChime() {
    if (!soundEnabled) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === "suspended") audioCtx.resume();

      var now = audioCtx.currentTime;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(528, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.18);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch (_) {}
  }

  function stopVoiceAudio() {
    aeWaveform.classList.remove("is-speaking");
    if (voAudio) {
      try {
        voAudio.pause();
        voAudio.currentTime = 0;
      } catch (_) {}
    }
    if ("speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }
  }

  function speakScene(idx) {
    var sc = scenes[idx];
    if (!sc) return;
    var text = sc.getAttribute("data-narration") || "";
    var audioSrc = sc.getAttribute("data-audio");
    if (captionBar && text) {
      captionBar.textContent = (soundEnabled ? '🔊 "' : '💬 "') + text + '"';
    }
    if (!soundEnabled) return;

    if (voAudio && audioSrc) {
      stopVoiceAudio();
      voAudio.src = audioSrc;
      voAudio.playbackRate = 1.0;
      aeWaveform.classList.add("is-speaking");
      voAudio.play().catch(function () {
        aeWaveform.classList.remove("is-speaking");
      });
      return;
    }

    if ("speechSynthesis" in window && text) {
      try {
        window.speechSynthesis.cancel();
        var utter = new SpeechSynthesisUtterance(text);
        utter.lang = "en-US";
        utter.rate = 1.02;
        window.speechSynthesis.speak(utter);
      } catch (_) {}
    }
  }

  if (voAudio) {
    voAudio.addEventListener("ended", function () {
      if (!soundEnabled || !isPlaying) return;
      var nextIdx = (activeIdx + 1) % scenes.length;
      elapsed = nextIdx * SCENE_MS;
      showScene(nextIdx, true);
    });
  }

  function formatSec(ms) {
    var s = Math.min(36, Math.floor(ms / 1000));
    return "00:" + (s < 10 ? "0" + s : s) + " / 00:36";
  }

  function showScene(idx, forceSpeak) {
    var changed = (idx !== activeIdx) || !scenes[idx].classList.contains("is-active");
    activeIdx = idx;
    scenes.forEach(function (sc, i) {
      sc.classList.toggle("is-active", i === idx);
    });
    chapters.forEach(function (ch, i) {
      ch.classList.toggle("is-active", i === idx);
    });
    if (changed || forceSpeak) {
      var text = scenes[idx] ? scenes[idx].getAttribute("data-narration") : "";
      if (captionBar && text) {
        captionBar.textContent = (soundEnabled ? '🔊 "' : '💬 "') + text + '"';
      }
      if (soundEnabled) {
        playChime();
        speakScene(idx);
      }
    }
  }

  function stepPlayer(now) {
    var dt = now - lastTick;
    lastTick = now;
    if (isPlaying) {
      /* When MP3 voiceover is playing, let the audio duration drive scene transitions so sentences never get cut off! */
      if (soundEnabled && voAudio && !voAudio.paused && voAudio.duration > 0) {
        var sceneProgress = voAudio.currentTime / voAudio.duration;
        elapsed = (activeIdx + Math.min(0.99, sceneProgress)) * SCENE_MS;
      } else {
        elapsed += dt;
        if (elapsed >= TOTAL_MS) elapsed = 0;
        var targetScene = Math.min(scenes.length - 1, Math.floor(elapsed / SCENE_MS));
        if (targetScene !== activeIdx) {
          showScene(targetScene, false);
        }
      }
      var pct = (elapsed / TOTAL_MS) * 100;
      if (progBar) progBar.style.width = pct.toFixed(1) + "%";
      if (timeEl) timeEl.textContent = formatSec(elapsed);
    }
    requestAnimationFrame(stepPlayer);
  }

  if (soundBtn) {
    soundBtn.addEventListener("click", function () {
      soundEnabled = !soundEnabled;
      soundBtn.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
      soundBtn.classList.toggle("is-on", soundEnabled);
      if (soundEnabled) {
        soundBtn.textContent = "🔊 Voiceover Narration: ON";
        isPlaying = true;
        if (playBtn) playBtn.textContent = "⏸ Pause";
        playChime();
        speakScene(activeIdx);
      } else {
        soundBtn.textContent = "🔊 Listen to Voiceover Narration";
        stopVoiceAudio();
      }
    });
  }

  if (playBtn) {
    playBtn.addEventListener("click", function () {
      isPlaying = !isPlaying;
      playBtn.textContent = isPlaying ? "⏸ Pause" : "▶ Play";
      if (!isPlaying) {
        if (voAudio) voAudio.pause();
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      } else if (soundEnabled) {
        if (voAudio && voAudio.src) voAudio.play().catch(function () {});
        else speakScene(activeIdx);
      }
    });
  }

  chapters.forEach(function (ch, idx) {
    ch.addEventListener("click", function () {
      elapsed = idx * SCENE_MS;
      showScene(idx, true);
      if (progBar) progBar.style.width = ((elapsed / TOTAL_MS) * 100).toFixed(1) + "%";
      if (timeEl) timeEl.textContent = formatSec(elapsed);
    });
  });

  if (progTrack) {
    progTrack.addEventListener("click", function (e) {
      var rect = progTrack.getBoundingClientRect();
      var ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      elapsed = ratio * TOTAL_MS;
      var targetScene = Math.min(scenes.length - 1, Math.floor(elapsed / SCENE_MS));
      showScene(targetScene, true);
      if (progBar) progBar.style.width = (ratio * 100).toFixed(1) + "%";
      if (timeEl) timeEl.textContent = formatSec(elapsed);
    });
  }

  requestAnimationFrame(stepPlayer);
})();


/* ═══════════════════════════════════════════════════════════════════════════
   15. DYNAMIC BLOG / INSIGHTS ENGINE (JSON + ADMIN CMS + SEO/AIO SCHEMA)
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var grid = document.getElementById("dynamicInsightsGrid");
  if (!grid) return;

  var searchInput = document.getElementById("insightsSearch");
  var filterBtns = document.querySelectorAll(".it-btn");
  var modal = document.getElementById("articleModal");
  var modalBody = document.getElementById("amBody");
  var modalClose = document.getElementById("amClose");
  var activeCategory = "all";
  var allPosts = [];

  function getLocalPosts() {
    try {
      return JSON.parse(localStorage.getItem("fahim_cms_posts") || "null");
    } catch (_) {
      return null;
    }
  }

  function renderPosts() {
    var query = (searchInput ? searchInput.value : "").trim().toLowerCase();
    var filtered = allPosts.filter(function (p) {
      var matchCat = activeCategory === "all" || (p.category || "").toLowerCase().indexOf(activeCategory.toLowerCase()) !== -1;
      var hay = ((p.title || "") + " " + (p.excerpt || "") + " " + (p.category || "")).toLowerCase();
      var matchQ = !query || hay.indexOf(query) !== -1;
      return matchCat && matchQ;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);">No articles matched your search. Try another keyword or topic.</div>';
      return;
    }

    grid.innerHTML = filtered.map(function (post, idx) {
      var takeawaysHtml = (post.takeaways || []).map(function (t) {
        return "<li>" + t + "</li>";
      }).join("");
      return (
        '<article class="post-card">' +
          '<div class="post-meta">' +
            '<span class="post-tag">' + (post.category || "Google Ads & Tracking") + '</span>' +
            '<span>' + (post.readTime || "5 Min Read") + ' · ' + (post.publishedAt || "2026") + '</span>' +
          '</div>' +
          '<h3>' + post.title + '</h3>' +
          '<p>' + post.excerpt + '</p>' +
          (takeawaysHtml ? '<ul class="post-takeaways">' + takeawaysHtml + '</ul>' : '') +
          '<div style="margin-top:auto;display:flex;gap:14px;align-items:center;flex-wrap:wrap;">' +
            '<button type="button" class="btn btn-ghost btn-sm read-post-btn" data-slug="' + post.slug + '">Read Full Article →</button>' +
            '<a href="#contact" class="svc-link" style="font-size:.82rem;">Apply to my account →</a>' +
          '</div>' +
        '</article>'
      );
    }).join("");

    grid.querySelectorAll(".read-post-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var slug = btn.getAttribute("data-slug");
        var found = allPosts.find(function (p) { return p.slug === slug; });
        if (found && modal && modalBody) {
          modalBody.innerHTML =
            '<div class="post-meta"><span class="post-tag">' + (found.category || "") + '</span><span>' + (found.readTime || "") + ' · Published ' + (found.publishedAt || "") + ' by Ferdous Wahid Fahim</span></div>' +
            '<h2 style="font-size:clamp(1.5rem,3vw,2.1rem);margin-bottom:14px;">' + found.title + '</h2>' +
            '<div class="am-content">' + (found.content || "<p>" + found.excerpt + "</p>") + '</div>' +
            '<div style="margin-top:26px;padding-top:18px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
              '<b>Want me to implement this in your account?</b>' +
              '<a href="#contact" class="btn btn-primary btn-sm" onclick="document.getElementById(\'articleModal\').hidden=true;">Book Free 30-Min Audit →</a>' +
            '</div>';
          modal.hidden = false;
        }
      });
    });
  }

  if (modalClose && modal) {
    modalClose.addEventListener("click", function () { modal.hidden = true; });
    modal.addEventListener("click", function (e) { if (e.target === modal) modal.hidden = true; });
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      activeCategory = btn.getAttribute("data-cat") || "all";
      renderPosts();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", renderPosts);
  }

  /* Load from localStorage first (if edited in Admin CMS), otherwise fetch data/posts.json */
  var local = getLocalPosts();
  if (local && Array.isArray(local) && local.length > 0) {
    allPosts = local;
    renderPosts();
  } else {
    fetch("data/posts.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        allPosts = data;
        renderPosts();
      })
      .catch(function () {});
  }
})();


/* Secret Keyboard Shortcut (Ctrl + Shift + A) to open Admin Panel privately */
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
    e.preventDefault();
    window.location.href = "admin.html";
  }
});
