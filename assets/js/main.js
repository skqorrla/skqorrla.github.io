(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- mobile menu ---------- */
  var menuToggle = $('.menu-toggle');
  var nav = $('#site-nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    });
  }

  /* ---------- toast: 상단에서 내려오는 "준비 중" 안내 ---------- */
  var toast = $('#toast');
  var toastTimer = null;
  var showToast = function (text) {
    if (!toast) return;
    $('.toast__text', toast).textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2600);
  };
  $$('[data-coming-soon]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      if (nav && nav.classList.contains('is-open')) menuToggle.click();
      showToast(el.getAttribute('data-coming-soon'));
    });
  });

  /* ---------- search bar (header expander) ---------- */
  var searchToggle = $('.search-toggle');
  var searchBar = $('#search-bar');
  var searchInput = $('.search-bar__input');
  if (searchToggle && searchBar && !searchToggle.hasAttribute('data-coming-soon')) {
    searchToggle.addEventListener('click', function () {
      var open = searchBar.classList.toggle('is-open');
      searchToggle.setAttribute('aria-expanded', String(open));
      if (open && searchInput) searchInput.focus();
    });
  }

  /* ---------- home: category / tag / search filter ---------- */
  var list = $('#post-list');
  if (list) {
    var cards = $$('.post-card', list);
    var chips = $$('.category-filter__item');
    var empty = $('#post-list-empty');
    var status = $('#post-list-status');
    var params = new URLSearchParams(location.search);
    var hashCat = 'all';
    try { hashCat = decodeURIComponent(location.hash.replace('#', '')) || 'all'; } catch (e) { hashCat = 'all'; }
    var state = {
      category: hashCat.toLowerCase(),
      q: (params.get('q') || '').trim().toLowerCase(),
      tag: (params.get('tag') || '').trim().toLowerCase()
    };
    if (!chips.some(function (c) { return c.dataset.category === state.category; })) state.category = 'all';
    if (searchInput && state.q) { searchInput.value = state.q; searchBar.classList.add('is-open'); }

    var apply = function () {
      var shown = 0;
      cards.forEach(function (card) {
        var tags = (card.dataset.tags || '').split(',');
        var okCat = state.category === 'all' || card.dataset.category === state.category;
        var okTag = !state.tag || tags.indexOf(state.tag) !== -1;
        var hay = [card.dataset.title, card.dataset.summary, card.dataset.tags].join(' ');
        var okQ = !state.q || hay.indexOf(state.q) !== -1;
        var ok = okCat && okTag && okQ;
        card.classList.toggle('is-hidden', !ok);
        if (ok) shown++;
      });
      chips.forEach(function (c) { c.classList.toggle('is-active', c.dataset.category === state.category); });
      if (empty) empty.hidden = shown > 0;
      if (status) {
        var parts = [];
        if (state.tag) parts.push('#' + state.tag);
        if (state.q) parts.push('"' + state.q + '"');
        status.hidden = parts.length === 0;
        status.innerHTML = parts.length ? '필터: ' + parts.join(' · ') + '<a href="' + location.pathname + '">해제</a>' : '';
      }
    };

    chips.forEach(function (chip) {
      chip.addEventListener('click', function (e) {
        e.preventDefault();
        state.category = chip.dataset.category;
        history.replaceState(null, '', state.category === 'all' ? location.pathname + location.search : '#' + state.category);
        apply();
      });
    });
    if (searchInput) {
      searchInput.addEventListener('input', function () { state.q = searchInput.value.trim().toLowerCase(); apply(); });
      var form = searchInput.closest('form');
      if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });
    }
    window.addEventListener('hashchange', function () {
      var c = 'all';
      try { c = (decodeURIComponent(location.hash.replace('#', '')) || 'all').toLowerCase(); } catch (e) { c = 'all'; }
      state.category = chips.some(function (ch) { return ch.dataset.category === c; }) ? c : 'all';
      apply();
    });
    apply();
  }

  /* ---------- post: TOC build + scroll spy ---------- */
  var content = $('#post-content');
  var toc = $('#toc');
  var tocList = $('#toc-list');
  if (content && toc && tocList) {
    var heads = $$('h2, h3', content);
    if (heads.length) {
      var root = document.createElement('ul');
      var currentUl = null;
      var lastLi = null;
      heads.forEach(function (h, i) {
        if (!h.id) h.id = 'section-' + (i + 1);
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        li.appendChild(a);
        if (h.tagName === 'H2' || !lastLi) {
          root.appendChild(li); lastLi = li; currentUl = null;
        } else {
          if (!currentUl) { currentUl = document.createElement('ul'); lastLi.appendChild(currentUl); }
          currentUl.appendChild(li);
        }
      });
      tocList.appendChild(root);
      toc.hidden = false;

      var links = $$('a', tocList);
      var setActive = function (id) {
        links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
      };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
        }, { rootMargin: '0px 0px -70% 0px', threshold: 0 });
        heads.forEach(function (h) { io.observe(h); });
      }
    }
  }
})();
