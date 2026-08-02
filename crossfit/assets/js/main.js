/* ==========================================================================
   SATOSHI FRIENDS & FITNESS
   --------------------------------------------------------------------------
   Principios aplicados en todo el archivo:
   1. El contenido SIEMPRE es visible sin JavaScript. GSAP solo lo mejora.
      Si el CDN falla o el usuario pide menos movimiento, no se pierde nada.
   2. Solo se animan `transform` y `opacity` (nunca width/height/top/left),
      para mantener 60 fps y no provocar layout shift (CLS).
   3. El parallax se desactiva en móvil: ahorra batería y evita jank.
   ========================================================================== */

(function () {
  "use strict";

  /* ======================================================================
     1. CONFIGURACIÓN — editá solo esta sección para cambiar los datos
     ====================================================================== */

  const CONFIG = {
    // Formato internacional sin signos, para los enlaces de wa.me
    whatsapp: "59892321900",
    // TODO: reemplazar por el email real del gimnasio (ver README).
    email: "hola@satoshifitness.uy",
    nombre: "Satoshi Friends & Fitness",
  };

  /* --- Grilla semanal --------------------------------------------------
     Construida dentro de las franjas reales del box (7–13 y 16–22 h).
     `prog` debe ser: "standard" | "fit" | "hibrida".
     -------------------------------------------------------------------- */
  const PROGRAMAS = {
    standard: "Standard",
    fit: "Fit",
    hibrida: "Híbrida",
  };

  const IMPARES = [
    { t: "07:00", prog: "standard" },
    { t: "08:00", prog: "standard" },
    { t: "09:00", prog: "fit" },
    { t: "10:00", prog: "hibrida" },
    { t: "12:00", prog: "standard" },
    { t: "16:00", prog: "fit" },
    { t: "17:00", prog: "standard" },
    { t: "18:00", prog: "standard" },
    { t: "19:00", prog: "hibrida" },
    { t: "20:00", prog: "standard" },
    { t: "21:00", prog: "fit" },
  ];

  const PARES = [
    { t: "07:00", prog: "hibrida" },
    { t: "08:00", prog: "standard" },
    { t: "09:00", prog: "fit" },
    { t: "10:00", prog: "standard" },
    { t: "12:00", prog: "fit" },
    { t: "16:00", prog: "standard" },
    { t: "17:00", prog: "hibrida" },
    { t: "18:00", prog: "standard" },
    { t: "19:00", prog: "standard" },
    { t: "20:00", prog: "fit" },
    { t: "21:00", prog: "hibrida" },
  ];

  const HORARIOS = [
    { dia: "Lunes", clases: IMPARES },
    { dia: "Martes", clases: PARES },
    { dia: "Miércoles", clases: IMPARES },
    { dia: "Jueves", clases: PARES },
    { dia: "Viernes", clases: IMPARES },
    {
      dia: "Sábado",
      clases: [
        { t: "09:00", prog: "standard" },
        { t: "10:00", prog: "hibrida" },
        { t: "11:00", prog: "fit" },
      ],
    },
  ];

  /* --- Reseñas ---------------------------------------------------------
     TODO: reemplazar por reseñas reales (ver README).
     -------------------------------------------------------------------- */
  const RESENAS = [
    {
      nombre: "Valentina Suárez",
      etiqueta: "Programación Standard · 2 años",
      texto:
        "Llegué sin saber levantar una barra y hoy hago snatch con técnica. Los coaches te corrigen siempre, nunca te dejan solo. El ambiente es lo que te hace volver.",
    },
    {
      nombre: "Martín Pereyra",
      etiqueta: "Programación Híbrida · 8 meses",
      texto:
        "Bajé 11 kilos entrenando híbrido. El trabajo continuo y los bloques de running me cambiaron el cardio por completo. Nunca me aburrí de una clase.",
    },
    {
      nombre: "Camila Rodríguez",
      etiqueta: "Programación Fit · 1 año",
      texto:
        "Tenía dolores de espalda hace años. Con los circuitos por estaciones y el trabajo de core, se me fueron. Entreno fuerte pero cuidada.",
    },
    {
      nombre: "Diego Fernández",
      etiqueta: "Programación Standard · 3 años",
      texto:
        "Probé varios boxes en Montevideo y ninguno escala el trabajo como acá. Cada uno entrena a su nivel en la misma clase y todos terminan destruidos.",
    },
    {
      nombre: "Lucía Méndez",
      etiqueta: "Programación Fit · 6 meses",
      texto:
        "Volví a entrenar después de ser mamá y me recibieron con una paciencia enorme. La movilidad que gané en medio año no la tuve nunca antes.",
    },
    {
      nombre: "Sebastián Olivera",
      etiqueta: "Híbrida + Standard · 1 año",
      texto:
        "Combino las dos programaciones según la semana. Es el único lugar donde sentí que la planificación tiene una lógica real detrás y no es improvisada.",
    },
  ];

  /* ======================================================================
     2. UTILIDADES
     ====================================================================== */

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const animate = hasGSAP && !reduceMotion;

  if (hasGSAP && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  /* ======================================================================
     3. IMÁGENES — degradación elegante si una URL falla
     ====================================================================== */

  function guardImages() {
    $$(".media img").forEach((img) => {
      const fail = () => img.classList.add("is-broken");
      if (img.complete && img.naturalWidth === 0) fail();
      img.addEventListener("error", fail, { once: true });
    });
  }

  /* ======================================================================
     4. VIDEO DEL HERO
     ----------------------------------------------------------------------
     El <video> no lleva `autoplay` en el HTML a propósito: así el control
     de si se reproduce o no queda acá, donde podemos consultar las
     preferencias del usuario. Si algo falla, queda el póster, que es el
     primer fotograma del propio video.
     ====================================================================== */

  function initHeroVideo() {
    const video = $("#hero-video");
    const toggle = $("#hero-video-toggle");
    if (!video) return;

    const ahorroDatos = window.matchMedia("(prefers-reduced-data: reduce)").matches;

    // Movimiento reducido o ahorro de datos: nos quedamos con el póster.
    // Ni siquiera se descarga el video.
    if (reduceMotion || ahorroDatos) {
      // "none" y no removeAttribute: al quitarlo el navegador vuelve a su
      // valor por defecto, que en varios casos ya descarga el archivo.
      video.setAttribute("preload", "none");
      return;
    }

    let pausadoPorUsuario = false;

    const pintarControl = () => {
      if (!toggle) return;
      const enPausa = video.paused;
      toggle.setAttribute(
        "aria-label",
        enPausa ? "Reproducir el video de fondo" : "Pausar el video de fondo"
      );
      const pausa = $('[data-icon="pause"]', toggle);
      const play = $('[data-icon="play"]', toggle);
      if (pausa) pausa.classList.toggle("hidden", enPausa);
      if (play) play.classList.toggle("hidden", !enPausa);
    };

    const mostrarControl = () => {
      if (!toggle || !toggle.classList.contains("hidden")) return;
      toggle.classList.remove("hidden");
      toggle.classList.add("grid");
      pintarControl();
      if (animate) {
        window.gsap.from(toggle, { opacity: 0, y: 10, duration: 0.5, ease: "expo.out" });
      }
    };

    // play() devuelve una promesa: si el navegador bloquea la reproducción
    // automática, no mostramos el control (no habría nada que pausar).
    video
      .play()
      .then(mostrarControl)
      .catch(() => {});

    if (toggle) {
      toggle.addEventListener("click", () => {
        if (video.paused) {
          pausadoPorUsuario = false;
          video.play().catch(() => {});
        } else {
          pausadoPorUsuario = true;
          video.pause();
        }
        pintarControl();
      });
    }

    video.addEventListener("play", pintarControl);
    video.addEventListener("pause", pintarControl);

    // Fuera de pantalla no tiene sentido decodificar cuadros: se pausa para
    // ahorrar batería, salvo que el usuario lo haya pausado a mano.
    const hero = $("#inicio");
    if (hero && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (pausadoPorUsuario) return;
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        },
        { threshold: 0.05 }
      );
      io.observe(hero);
    }
  }

  /* ======================================================================
     5. HEADER — estado al hacer scroll + link activo
     ====================================================================== */

  function initHeader() {
    const bar = $("#nav-bar");
    if (!bar) return;

    const solid = ["bg-ink/92", "backdrop-blur-xl", "border-line"];
    let ticking = false;

    const paint = () => {
      const on = window.scrollY > 24;
      solid.forEach((c) => bar.classList.toggle(c, on));
      bar.classList.toggle("border-transparent", !on);
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(paint);
        }
      },
      { passive: true }
    );
    paint();
  }

  function initScrollSpy() {
    const links = $$(".nav-link");
    if (!links.length || !("IntersectionObserver" in window)) return;

    const map = new Map();
    links.forEach((a) => {
      const id = a.getAttribute("href");
      const target = id && id.startsWith("#") ? $(id) : null;
      if (target) map.set(target, a);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => a.removeAttribute("aria-current"));
          const active = map.get(entry.target);
          if (active) active.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    map.forEach((_, section) => io.observe(section));
  }

  /* ======================================================================
     6. MENÚ MÓVIL — con trampa de foco y cierre por Escape
     ====================================================================== */

  function initMobileMenu() {
    const menu = $("#mobile-menu");
    const openBtn = $("#menu-toggle");
    const closeBtn = $("#menu-close");
    if (!menu || !openBtn || !closeBtn) return;

    let lastFocus = null;

    const open = () => {
      lastFocus = document.activeElement;
      menu.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      openBtn.setAttribute("aria-expanded", "true");
      closeBtn.focus();

      if (animate) {
        window.gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
        window.gsap.fromTo(
          $$(".m-link, #mobile-menu .btn", menu),
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, stagger: 0.045, ease: "expo.out", delay: 0.05 }
        );
      }
    };

    const close = () => {
      menu.classList.add("hidden");
      document.body.style.overflow = "";
      openBtn.setAttribute("aria-expanded", "false");
      if (lastFocus) lastFocus.focus();
    };

    openBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    $$("a", menu).forEach((a) => a.addEventListener("click", close));

    document.addEventListener("keydown", (e) => {
      if (menu.classList.contains("hidden")) return;

      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;

      // Trampa de foco: el tabulado no debe escapar del menú abierto
      const focusables = $$("a[href], button:not([disabled])", menu);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ======================================================================
     7. HORARIOS — render + filtro
     ====================================================================== */

  function initSchedule() {
    const grid = $("#schedule-grid");
    if (!grid) return;

    grid.innerHTML = HORARIOS.map(
      (dia) => `
      <div class="day-card">
        <h3 class="day-head">${dia.dia}</h3>
        <div class="flex flex-col" data-slots>
          ${dia.clases
            .map(
              (c) => `
            <div class="slot" data-prog="${c.prog}">
              <span class="slot-time">${c.t}</span>
              <span class="slot-tag">${PROGRAMAS[c.prog]}</span>
            </div>`
            )
            .join("")}
        </div>
        <p class="day-empty" hidden>Sin clases de esta programación.</p>
      </div>`
    ).join("");

    const chips = $$(".chip[data-filter]");
    const cards = $$(".day-card", grid);

    const apply = (filter) => {
      cards.forEach((card) => {
        const slots = $$(".slot", card);
        let visibles = 0;

        slots.forEach((slot) => {
          const match = filter === "all" || slot.dataset.prog === filter;
          slot.classList.toggle("is-hidden", !match);
          if (match) visibles++;
        });

        const empty = $(".day-empty", card);
        if (empty) empty.hidden = visibles > 0;

        if (animate && visibles > 0) {
          window.gsap.fromTo(
            $$(".slot:not(.is-hidden)", card),
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.3, stagger: 0.02, ease: "power2.out", overwrite: true }
          );
        }
      });
    };

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
        apply(chip.dataset.filter);
      });
    });
  }

  /* ======================================================================
     8. RESEÑAS — carril con scroll-snap nativo
     ====================================================================== */

  function initReviews() {
    const track = $("#rev-track");
    if (!track) return;

    const star = `<svg class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.6 2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95L12 2.6Z"/></svg>`;

    track.innerHTML = RESENAS.map((r) => {
      const iniciales = r.nombre
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("");
      return `
      <article class="review">
        <div class="review-stars" role="img" aria-label="5 de 5 estrellas">${star.repeat(5)}</div>
        <p class="review-body">“${r.texto}”</p>
        <div class="review-foot">
          <span class="review-avatar" aria-hidden="true">${iniciales}</span>
          <span>
            <span class="block font-semibold text-cloud">${r.nombre}</span>
            <span class="block text-sm text-ash">${r.etiqueta}</span>
          </span>
        </div>
      </article>`;
    }).join("");

    const step = () => {
      const card = $(".review", track);
      return card ? card.getBoundingClientRect().width + 20 : 340;
    };

    const prev = $("#rev-prev");
    const next = $("#rev-next");
    if (prev) prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    if (next) next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));

    // Navegación por teclado dentro del carril
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        track.scrollBy({ left: step(), behavior: "smooth" });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        track.scrollBy({ left: -step(), behavior: "smooth" });
      }
    });
  }

  /* ======================================================================
     9. PROGRAMACIONES — acordeón accesible
     ====================================================================== */

  function initPrograms() {
    $$(".prog-toggle").forEach((btn) => {
      const panel = $(".prog-more", btn.closest(".prog"));
      const label = $("span", btn);
      if (!panel) return;

      btn.addEventListener("click", () => {
        const willOpen = btn.getAttribute("aria-expanded") !== "true";
        btn.setAttribute("aria-expanded", String(willOpen));
        if (label) {
          label.textContent = willOpen ? label.dataset.labelClose : label.dataset.labelOpen;
        }

        if (!animate) {
          panel.hidden = !willOpen;
          return;
        }

        if (willOpen) {
          panel.hidden = false;
          window.gsap.fromTo(
            panel,
            { height: 0, opacity: 0 },
            {
              height: "auto",
              opacity: 1,
              duration: 0.5,
              ease: "expo.out",
              onComplete: () => {
                window.gsap.set(panel, { clearProps: "height" });
                if (window.ScrollTrigger) window.ScrollTrigger.refresh();
              },
            }
          );
        } else {
          window.gsap.to(panel, {
            height: 0,
            opacity: 0,
            duration: 0.32,
            ease: "power2.in",
            onComplete: () => {
              panel.hidden = true;
              window.gsap.set(panel, { clearProps: "height,opacity" });
              if (window.ScrollTrigger) window.ScrollTrigger.refresh();
            },
          });
        }
      });
    });
  }

  /* ======================================================================
     10. FORMULARIO — validación + envío por WhatsApp / email
     ====================================================================== */

  function initForm() {
    const form = $("#contact-form");
    if (!form) return;

    const status = $("#form-status");

    const setError = (id, msg) => {
      const input = $("#f-" + id);
      const box = $("#e-" + id);
      if (!input || !box) return;
      const bad = Boolean(msg);
      input.setAttribute("aria-invalid", String(bad));
      box.textContent = msg || "";
      box.classList.toggle("is-visible", bad);
    };

    const showStatus = (msg, ok) => {
      if (!status) return;
      status.textContent = msg;
      status.hidden = false;
      status.classList.remove("hidden");
      status.style.color = ok ? "#F4F4F5" : "#FF5A45";
      status.style.borderColor = ok ? "#2A2D33" : "#FF5A45";
    };

    // Validación al salir del campo (no en cada tecla)
    ["nombre", "tel", "email"].forEach((id) => {
      const input = $("#f-" + id);
      if (input) input.addEventListener("blur", () => validate(id));
    });

    function validate(only) {
      let ok = true;

      const check = (id, condition, msg) => {
        if (only && only !== id) return;
        if (condition) {
          setError(id, "");
        } else {
          setError(id, msg);
          ok = false;
        }
      };

      const nombre = ($("#f-nombre").value || "").trim();
      check("nombre", nombre.length >= 2, "Contanos cómo te llamás.");

      const tel = ($("#f-tel").value || "").replace(/\D/g, "");
      check("tel", tel.length >= 8, "Ingresá un número de WhatsApp válido (mínimo 8 dígitos).");

      const email = ($("#f-email").value || "").trim();
      check("email", email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email), "Revisá el formato del email.");

      if (!only) {
        const ok2 = $("#f-ok").checked;
        setError("ok", ok2 ? "" : "Necesitamos tu autorización para poder responderte.");
        if (!ok2) ok = false;
      }

      return ok;
    }

    function focusFirstInvalid() {
      const bad = $('[aria-invalid="true"]', form) || ($("#f-ok").checked ? null : $("#f-ok"));
      if (bad) bad.focus({ preventScroll: false });
    }

    function buildMessage() {
      const v = (id) => ($("#f-" + id) ? $("#f-" + id).value.trim() : "");
      const lines = [
        `Hola ${CONFIG.nombre}, quiero sumarme.`,
        "",
        `Nombre: ${v("nombre")}`,
        `WhatsApp: ${v("tel")}`,
      ];
      if (v("email")) lines.push(`Email: ${v("email")}`);
      lines.push(`Programación de interés: ${$("#f-prog").value}`);
      if (v("msg")) lines.push("", `Mensaje: ${v("msg")}`);
      return lines.join("\n");
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) {
        showStatus("Revisá los campos marcados para poder enviar tu consulta.", false);
        focusFirstInvalid();
        return;
      }
      const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(buildMessage())}`;
      window.open(url, "_blank", "noopener");
      showStatus("Abrimos WhatsApp con tu consulta lista para enviar. ¡Nos vemos en el box!", true);
      form.reset();
    });

    const emailBtn = $("#send-email");
    if (emailBtn) {
      emailBtn.addEventListener("click", () => {
        if (!validate()) {
          showStatus("Revisá los campos marcados para poder enviar tu consulta.", false);
          focusFirstInvalid();
          return;
        }
        const subject = encodeURIComponent(`Consulta web — ${$("#f-nombre").value.trim()}`);
        const body = encodeURIComponent(buildMessage());
        window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
        showStatus("Abrimos tu cliente de correo con la consulta lista para enviar.", true);
      });
    }
  }

  /* ======================================================================
     11. ANIMACIONES GSAP
     ====================================================================== */

  function initHero() {
    const items = $$("[data-hero]").sort(
      (a, b) => Number(a.dataset.hero) - Number(b.dataset.hero)
    );
    if (!items.length || !animate) return;

    const tl = window.gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(items, {
      y: 34,
      opacity: 0,
      duration: 1.05,
      stagger: 0.09,
    });
  }

  function initReveals() {
    const els = $$("[data-reveal]");
    if (!els.length || !animate || !window.ScrollTrigger) return;

    // Se agrupan los hermanos sólo para calcular el retardo de la cascada.
    const grupos = new Map();
    els.forEach((el) => {
      const key = el.parentElement;
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key).push(el);
    });

    const offset = { up: { y: 42, x: 0 }, left: { y: 0, x: -42 }, right: { y: 0, x: 42 } };

    grupos.forEach((items) => {
      items.forEach((el, i) => {
        // Cada elemento tiene su propio disparador. Si se compartiera uno solo,
        // al apilarse las columnas en móvil el contenido que queda por encima
        // del disparador nunca llegaría a revelarse.
        const from = offset[el.dataset.reveal] || offset.up;

        window.gsap.from(el, {
          opacity: 0,
          y: from.y,
          x: from.x,
          duration: 0.9,
          ease: "expo.out",
          delay: Math.min(i, 4) * 0.085,
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            once: true,
          },
        });
      });
    });

    // Red de seguridad: si algo quedara sin revelar (por ejemplo si el layout
    // cambia de tamaño durante la carga), se muestra igual.
    window.addEventListener("load", () => {
      window.ScrollTrigger.refresh();
      setTimeout(() => {
        els.forEach((el) => {
          const r = el.getBoundingClientRect();
          const visible = r.top < window.innerHeight && r.bottom > 0;
          if (visible && Number(getComputedStyle(el).opacity) === 0) {
            window.gsap.set(el, { clearProps: "opacity,transform" });
          }
        });
      }, 600);
    });
  }

  function initCounters() {
    const nums = $$("[data-count]");
    if (!nums.length) return;

    if (!animate || !window.ScrollTrigger) {
      nums.forEach((n) => (n.textContent = n.dataset.count));
      return;
    }

    nums.forEach((n) => {
      const target = Number(n.dataset.count) || 0;
      const box = { v: 0 };
      window.gsap.to(box, {
        v: target,
        duration: 1.6,
        ease: "power2.out",
        onUpdate: () => {
          n.textContent = String(Math.round(box.v));
        },
        scrollTrigger: { trigger: n, start: "top 90%", once: true },
      });
    });
  }

  function initParallax() {
    // Solo en desktop: en móvil cuesta batería y aporta poco.
    if (!animate || !window.ScrollTrigger || !isDesktop) return;

    $$("[data-parallax]").forEach((el) => {
      // El desplazamiento nunca supera el margen que da el zoom (scale 1.28),
      // así que la imagen jamás deja ver un borde vacío.
      const shift = Math.min((parseFloat(el.dataset.parallax) || 0.1) * 50, 12);

      window.gsap.fromTo(
        el,
        { yPercent: -shift, scale: 1.28 },
        {
          yPercent: shift,
          scale: 1.28,
          ease: "none",
          scrollTrigger: {
            trigger: el.closest("figure, section") || el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        }
      );
    });
  }

  /* --- Profundidad por puntero -----------------------------------------
     Al mover el mouse dentro de "Quiénes somos" y "Friends & Fitness"
     reaccionan tres capas a distinta velocidad: un foco ámbar que sigue al
     cursor, la foto que se inclina en 3D y el marco de acento que se
     desplaza. Las tres velocidades distintas son las que crean la
     sensación de profundidad; una sola capa se vería como un truco.

     No se toca ni la foto (ya tiene parallax de scroll) ni el contenedor
     que anima al entrar: se transforman elementos que no tienen otro tween
     encima, para que nada compita.
     -------------------------------------------------------------------- */

  function initPointerDepth() {
    // Requiere puntero fino: en pantallas táctiles no hay "mover el mouse"
    // y el efecto quedaría trabado en el último punto tocado.
    if (!animate) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const INCLINACION = 4.5; // grados máximos de giro de la foto

    $$("[data-depth-section]").forEach((seccion) => {
      const foco = $("[data-depth-glow]", seccion);
      const foto = $("[data-depth-card]", seccion);
      const capas = $$("[data-depth-layer]", seccion).map((el) => ({
        fuerza: parseFloat(el.dataset.depthLayer) || 10,
        x: window.gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
        y: window.gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
      }));

      if (!foco && !foto && !capas.length) return;

      const focoX = foco && window.gsap.quickTo(foco, "x", { duration: 0.65, ease: "power3.out" });
      const focoY = foco && window.gsap.quickTo(foco, "y", { duration: 0.65, ease: "power3.out" });
      const giroX = foto && window.gsap.quickTo(foto, "rotationX", { duration: 0.8, ease: "power3.out" });
      const giroY = foto && window.gsap.quickTo(foto, "rotationY", { duration: 0.8, ease: "power3.out" });

      if (foco) window.gsap.set(foco, { xPercent: -50, yPercent: -50 });

      let caja = null;
      let medidaVieja = true;

      // El rect sólo se vuelve a leer cuando hace falta, y siempre justo
      // antes de escribir con GSAP: así no se intercalan lecturas y
      // escrituras de layout en el mismo frame.
      const invalidar = () => {
        medidaVieja = true;
      };
      window.addEventListener("scroll", invalidar, { passive: true });
      window.addEventListener("resize", invalidar);

      seccion.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse") return;
        caja = seccion.getBoundingClientRect();
        medidaVieja = false;

        if (foco) {
          const x = e.clientX - caja.left;
          const y = e.clientY - caja.top;
          // El segundo argumento fija el punto de partida: el foco aparece
          // bajo el cursor en vez de deslizarse desde la esquina.
          focoX(x, x);
          focoY(y, y);
          window.gsap.to(foco, { opacity: 1, duration: 0.45, ease: "power2.out" });
        }
      });

      seccion.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        if (medidaVieja || !caja) {
          caja = seccion.getBoundingClientRect();
          medidaVieja = false;
        }

        const x = e.clientX - caja.left;
        const y = e.clientY - caja.top;
        const px = (x / caja.width - 0.5) * 2; // -1 a 1
        const py = (y / caja.height - 0.5) * 2;

        if (foco) {
          focoX(x);
          focoY(y);
        }
        if (foto) {
          giroY(px * INCLINACION);
          giroX(-py * INCLINACION);
        }
        capas.forEach((c) => {
          c.x(px * c.fuerza);
          c.y(py * c.fuerza);
        });
      });

      seccion.addEventListener("pointerleave", (e) => {
        if (e.pointerType !== "mouse") return;
        if (foco) window.gsap.to(foco, { opacity: 0, duration: 0.5, ease: "power2.out" });
        if (foto) {
          giroX(0);
          giroY(0);
        }
        capas.forEach((c) => {
          c.x(0);
          c.y(0);
        });
      });
    });
  }

  function initMagnetic() {
    // Micro-interacción de puntero: solo en dispositivos con hover real.
    if (!animate || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    // Se marca en el HTML con data-magnetic, no con la clase del botón.
    // Antes seguía a `.btn-primary`, que son 7 en la página: cuando todo se
    // mueve, nada destaca. El efecto es jerarquía, así que va en el único
    // botón que tiene que ganar la pantalla. Los demás conservan sus
    // transiciones de color y la escala al presionar, que ya alcanzan.
    $$("[data-magnetic]").forEach((btn) => {
      // quickTo reutiliza un mismo tween en vez de crear uno por evento.
      const moverX = window.gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
      const moverY = window.gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });

      // GSAP escribe `transform` inline, que pisa el scale(0.975) de
      // `.btn:active`. Los demás botones conservan esa regla porque ya no
      // los toca ningún tween; en este hay que devolver el gesto acá.
      // Sin `overwrite`: son eventos puntuales, y sobrescribir podría matar
      // los tweens de x/y que corren en paralelo.
      const escalar = (v) => window.gsap.to(btn, { scale: v, duration: 0.18, ease: "power2.out" });

      btn.addEventListener("pointerdown", () => escalar(0.975));
      btn.addEventListener("pointerup", () => escalar(1));

      const soltar = () => {
        escalar(1);
        window.gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" });
      };

      btn.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        // El rect se lee en cada movimiento en vez de cachearse: es un solo
        // elemento chico, y así el efecto no se descalibra si la página
        // scrollea mientras el cursor está encima.
        const caja = btn.getBoundingClientRect();
        // El tirón se limita para que el botón nunca salga de su zona táctil.
        moverX((e.clientX - (caja.left + caja.width / 2)) * 0.16);
        moverY((e.clientY - (caja.top + caja.height / 2)) * 0.28);
      });

      btn.addEventListener("pointerleave", soltar);
      btn.addEventListener("blur", soltar);
    });
  }

  /* ======================================================================
     12. VARIOS
     ====================================================================== */

  function initMisc() {
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());

    // El botón flotante de WhatsApp se retira sobre el hero (que ya tiene su
    // propio CTA) y sobre el formulario, para no tapar contenido ni campos.
    const fab = $("#wa-fab");
    const zonas = [$("#inicio"), $("#contacto")].filter(Boolean);

    if (fab && zonas.length && "IntersectionObserver" in window) {
      const activas = new Set();

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) activas.add(entry.target);
            else activas.delete(entry.target);
          });

          const ocultar = activas.size > 0;
          fab.style.transform = ocultar ? "translateY(140%)" : "translateY(0)";
          fab.style.pointerEvents = ocultar ? "none" : "";
          fab.setAttribute("aria-hidden", String(ocultar));
        },
        { threshold: 0.3 }
      );

      zonas.forEach((z) => io.observe(z));
    }
  }

  /* ======================================================================
     BOOT
     ====================================================================== */

  function boot() {
    guardImages();
    initHeroVideo();
    initHeader();
    initScrollSpy();
    initMobileMenu();
    initSchedule();
    initReviews();
    initPrograms();
    initForm();
    initMisc();

    initHero();
    initReveals();
    initCounters();
    initParallax();
    initPointerDepth();
    initMagnetic();

    if (hasGSAP && window.ScrollTrigger) {
      window.addEventListener("load", () => window.ScrollTrigger.refresh());
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
