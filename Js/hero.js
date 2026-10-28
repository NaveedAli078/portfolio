/* ============================================
   GIS PORTFOLIO — HERO (hero.js)
   Name typing + role typewriter + counters + video
============================================ */

(function () {
  "use strict";

  function init() {
    if (window.__ghHeroInit) return;
    window.__ghHeroInit = true;

    var hero = document.querySelector(".gh-hero");
    if (!hero) return;

    var nameText = hero.querySelector("#gh-name-text");
    var nameCursor = hero.querySelector(".gh-name-cursor");
    var typedText = hero.querySelector("#gh-typed-text");
    var roleCursor = hero.querySelector(".gh-role-cursor");
    var statsBox = hero.querySelector(".gh-stats");
    var statNums = hero.querySelectorAll(".gh-num");
    var video = hero.querySelector(".gh-visual video");

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- 1. Name typing ---------- */

    var fullName = "Naveed";
    var nameIndex = 0;

    function typeName() {
      if (!nameText) { startRole(); return; }

      if (reduceMotion) {
        nameText.textContent = fullName;
        if (nameCursor) nameCursor.style.display = "none";
        startRole();
        return;
      }

      if (nameIndex < fullName.length) {
        nameText.textContent += fullName.charAt(nameIndex++);
        setTimeout(typeName, 110);
      } else {
        setTimeout(function () {
          if (nameCursor) nameCursor.style.display = "none";
          startRole();
        }, 450);
      }
    }

    /* ---------- 2. Single-line Role typewriter (loops continuously) ---------- */

    var lines = [
      "Turning satellite imagery and spatial data into clear maps and useful insight.",
      "I analyze satellite imagery & earth observation data",
      "I create spatial solutions with GIS technology",
      "I transform geospatial data into actionable insights"
    ];

    var lineIndex = 0;
    var charIndex = 0;
    var isDeleting = false;

    function typeWriter() {
      if (!typedText) return;

      var currentLine = lines[lineIndex];
      
      if (isDeleting) {
        // Deleting characters
        typedText.textContent = currentLine.substring(0, charIndex - 1);
        charIndex--;
        
        if (charIndex === 0) {
          // Finished deleting, move to next line
          isDeleting = false;
          lineIndex = (lineIndex + 1) % lines.length;
          setTimeout(typeWriter, 500);
        } else {
          setTimeout(typeWriter, 30);
        }
      } else {
        // Typing characters
        typedText.textContent = currentLine.substring(0, charIndex + 1);
        charIndex++;
        
        if (charIndex === currentLine.length) {
          // Finished typing, pause then start deleting
          isDeleting = true;
          setTimeout(typeWriter, 2000);
        } else {
          setTimeout(typeWriter, 65);
        }
      }
    }

    function startRole() {
      if (typedText) typedText.textContent = "";
      lineIndex = 0;
      charIndex = 0;
      isDeleting = false;
      setTimeout(typeWriter, 300);
    }

    /* ---------- 3. Counters ---------- */

    function animateCounter(el, target, duration) {
      var span = el.querySelector(".gh-count");
      if (!span || !isFinite(target)) return;

      if (reduceMotion) { span.textContent = target; return; }

      var start = performance.now();
      span.textContent = "0";

      function tick(now) {
        var p = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        span.textContent = p < 1 ? Math.floor(eased * target) : target;
        if (p < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }

    var countersStarted = false;

    function startCounters() {
      if (countersStarted) return;
      countersStarted = true;

      Array.prototype.forEach.call(statNums, function (el, i) {
        var target = Number(el.getAttribute("data-gh-target"));
        setTimeout(function () { animateCounter(el, target, 1800); }, i * 120);
      });
    }

    if (statsBox && "IntersectionObserver" in window) {
      var statsObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startCounters();
            statsObs.disconnect();
          }
        });
      }, { threshold: 0.25 });
      statsObs.observe(statsBox);
    } else {
      startCounters();
    }

    /* ---------- 4. Earth video ---------- */

    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;

      var play = function () {
        if (document.hidden) return;
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      };

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && entry.intersectionRatio > 0.05) play();
            else video.pause();
          });
        }, { threshold: [0, 0.05, 0.25] }).observe(hero);
      } else {
        play();
      }

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          video.pause();
        } else {
          var r = hero.getBoundingClientRect();
          if (r.bottom > 0 && r.top < window.innerHeight) play();
        }
      });
    }

    /* ---------- 5. Smooth scroll for #links ---------- */

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href");
        if (!href || href === "#") return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      });
    });

    /* ---------- 6. Start ---------- */

    if (nameText) nameText.textContent = "";
    typeName();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();