(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const themeButton = document.querySelector('.theme-toggle');
  const updateTheme = () => {
    const light = document.documentElement.dataset.theme === 'light';
    themeButton?.setAttribute('aria-label', light ? '切换到深色模式' : '切换到浅色模式');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f5f5f8' : '#0c0d12');
  };
  if (themeButton) {
    themeButton.hidden = false;
    themeButton.addEventListener('click', () => {
      const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = theme;
      try { localStorage.setItem('kun-theme', theme); } catch {}
      updateTheme();
    });
    updateTheme();
  }
  const menu = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  if (menu && links) {
    links.classList.add('mobile-nav');
    menu.hidden = false;
    const closeMenu = () => { links.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', '打开导航菜单'); };
    menu.addEventListener('click', () => {
      const open = !links.classList.contains('is-open');
      links.classList.toggle('is-open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    });
    links.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && links.classList.contains('is-open')) { closeMenu(); menu.focus(); } });
    document.addEventListener('click', event => { if (!event.target.closest('.nav-shell')) closeMenu(); });
  }
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }, { threshold: 0.06 });
    document.querySelectorAll('[data-reveal]').forEach(element => { element.classList.add('reveal-ready'); observer.observe(element); });
  }
  const dialog = document.querySelector('.search-dialog');
  const searchOpen = document.querySelector('[data-search-open]');
  if (dialog && searchOpen && typeof dialog.showModal === 'function') {
    searchOpen.hidden = false;
    const input = dialog.querySelector('input');
    const rows = Array.from(dialog.querySelectorAll('[data-search-text]'));
    const status = dialog.querySelector('.search-status');
    let indexState = 'idle';
    const loadIndex = async () => {
      if (indexState !== 'idle') return;
      indexState = 'loading'; filter();
      try {
        const response = await fetch(dialog.dataset.searchIndex);
        if (!response.ok) throw new Error('Search index unavailable');
        const index = await response.json();
        const byPath = new Map(index.map(item => [new URL(item.url, location.href).pathname, item.text.toLocaleLowerCase()]));
        rows.forEach(row => { const text = byPath.get(new URL(row.querySelector('a').href).pathname); if (text) row.dataset.searchText += ' ' + text; });
        indexState = 'ready';
      } catch { indexState = 'error'; }
      filter();
    };
    const filter = () => {
      const terms = input.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
      let count = 0;
      rows.forEach(row => { row.hidden = !terms.every(term => row.dataset.searchText.includes(term)); if (!row.hidden) count++; });
      status.textContent = (count ? `找到 ${count} 篇文章` : '没有匹配的文章。') + (indexState === 'loading' ? ' 正在加载正文索引…' : indexState === 'error' ? ' 正文搜索暂不可用，当前搜索标题与标签。' : '');
    };
    searchOpen.addEventListener('click', () => { dialog.showModal(); document.body.classList.add('dialog-open'); filter(); input.focus(); loadIndex(); });
    dialog.querySelector('[data-search-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); searchOpen.focus(); });
    dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
    input.addEventListener('input', filter);
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const visible = rows.filter(row => !row.hidden).map(row => row.querySelector('a'));
      const current = visible.indexOf(document.activeElement);
      if (event.target !== input && current < 0) return;
      event.preventDefault();
      if (event.key === 'ArrowUp' && current <= 0) input.focus();
      else visible[Math.max(0, Math.min(visible.length - 1, current + (event.key === 'ArrowDown' ? 1 : -1)))]?.focus();
    });
    document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (!dialog.open) searchOpen.click(); } });
  }
  const archive = document.querySelector('[data-archive]');
  if (archive) {
    const query = archive.querySelector('[data-archive-query]');
    const tagSelect = archive.querySelector('[data-archive-tag]');
    const sort = archive.querySelector('[data-archive-sort]');
    const grid = archive.querySelector('.post-grid');
    const items = Array.from(grid.querySelectorAll('.archive-item'));
    const tagsFor = new Map(items.map(item => [item, JSON.parse(item.dataset.tags).map(String)]));
    const tags = [...new Set([...tagsFor.values()].flat())].sort((a,b) => a.localeCompare(b, 'zh-CN'));
    tags.forEach(tag => { const option = document.createElement('option'); option.value = tag; option.textContent = tag; tagSelect.append(option); });
    const url = new URL(location.href);
    query.value = url.searchParams.get('q') || '';
    tagSelect.value = tags.includes(url.searchParams.get('tag')) ? url.searchParams.get('tag') : '';
    sort.value = url.searchParams.get('sort') === 'old' ? 'old' : 'new';
    const filterPosts = (persist = true) => {
      const terms = query.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
      let count = 0;
      items.forEach(item => { item.hidden = !terms.every(term => item.dataset.title.includes(term)) || (!!tagSelect.value && !tagsFor.get(item).includes(tagSelect.value)); if (!item.hidden) count++; });
      items.sort((a,b) => (Date.parse(b.dataset.date) - Date.parse(a.dataset.date)) * (sort.value === 'old' ? -1 : 1)).forEach(item => grid.append(item));
      archive.querySelector('[data-archive-count]').textContent = count + ' / ' + items.length + ' 篇文章';
      archive.querySelector('[data-archive-empty]').hidden = count !== 0 || items.length === 0;
      if (persist) { const current = new URL(location.href); for (const [key,value] of [['q',query.value.trim()],['tag',tagSelect.value],['sort',sort.value === 'old' ? 'old' : '']]) { if (value) current.searchParams.set(key,value); else current.searchParams.delete(key); } history.replaceState(null,'',current); }
    };
    query.addEventListener('input', () => filterPosts()); tagSelect.addEventListener('change', () => filterPosts()); sort.addEventListener('change', () => filterPosts());
    archive.querySelector('[data-filter-reset]').addEventListener('click', () => { query.value = ''; tagSelect.value = ''; sort.value = 'new'; filterPosts(); query.focus(); });
    archive.querySelector('.archive-controls').hidden = false;
    filterPosts(false);
  }
  if (matchMedia('(pointer:fine)').matches && !reducedMotion) {
    document.querySelectorAll('[data-spotlight]').forEach(card => {
      let frame = 0, x = 0, y = 0;
      card.addEventListener('pointermove', event => {
        const r = card.getBoundingClientRect(); x = event.clientX - r.left; y = event.clientY - r.top;
        if (!frame) frame = requestAnimationFrame(() => { frame = 0; card.style.setProperty('--spot-x', x + 'px'); card.style.setProperty('--spot-y', y + 'px'); card.style.setProperty('--tilt-x', ((.5-y/r.height)*5) + 'deg'); card.style.setProperty('--tilt-y', ((x/r.width-.5)*5) + 'deg'); });
      }, {passive:true});
      card.addEventListener('pointerleave', () => { cancelAnimationFrame(frame); frame = 0; card.style.removeProperty('--tilt-x'); card.style.removeProperty('--tilt-y'); });
    });
  }
  const content = document.querySelector('.post-content');
  if (!content) return;
  const toc = document.querySelector('.toc');
  const tocLinks = document.querySelector('#toc-links');
  const headings = Array.from(content.querySelectorAll('h2, h3'));
  const usedIds = new Set(Array.from(document.querySelectorAll('[id]')).map(el => el.id));
  headings.forEach((heading, index) => {
    if (!heading.id) { let id = `section-${index + 1}`; while (usedIds.has(id)) id += '-'; heading.id = id; usedIds.add(id); }
    if (tocLinks) { const anchor = document.createElement('a'); anchor.href = `#${encodeURIComponent(heading.id)}`; anchor.textContent = heading.textContent; anchor.dataset.level = heading.tagName === 'H3' ? '3' : '2'; tocLinks.append(anchor); }
  });
  if (toc && headings.length > 1) toc.hidden = false;
  const tocToggle = document.querySelector('.toc-toggle');
  if (tocToggle && tocLinks) {
    const toggle = expanded => { tocLinks.hidden = !expanded; tocToggle.setAttribute('aria-expanded', String(expanded)); tocToggle.querySelector('span').textContent = expanded ? '−' : '+'; };
    toggle(!matchMedia('(max-width:1000px)').matches);
    tocToggle.addEventListener('click', () => toggle(tocToggle.getAttribute('aria-expanded') !== 'true'));
  }
  content.querySelectorAll('table').forEach(table => { const wrapper = document.createElement('div'); wrapper.className = 'table-scroll'; wrapper.tabIndex = 0; wrapper.setAttribute('role', 'region'); wrapper.setAttribute('aria-label', '可横向滚动的表格'); table.before(wrapper); wrapper.append(table); });
  if (navigator.clipboard && window.isSecureContext) content.querySelectorAll('pre').forEach(pre => {
    const code = pre.querySelector('code');
    if (!code) return;
    const button = document.createElement('button'); button.className = 'copy-button'; button.type = 'button'; button.textContent = '复制'; button.setAttribute('aria-label', '复制代码');
    button.addEventListener('click', async () => { try { await navigator.clipboard.writeText(code.textContent); button.textContent = '已复制'; } catch { button.textContent = '请手动复制'; } window.setTimeout(() => { button.textContent = '复制'; }, 1800); });
    pre.prepend(button);
  });
  const progress = document.querySelector('.reading-progress');
  let framePending = false;
  const updateReading = () => {
    framePending = false;
    const rect = content.getBoundingClientRect();
    const available = Math.max(1, content.offsetHeight - window.innerHeight + 110);
    if (progress) progress.style.transform = `scaleX(${Math.max(0, Math.min(1, (110 - rect.top) / available))})`;
    let current = -1;
    headings.forEach((heading, index) => { if (heading.getBoundingClientRect().top <= 150) current = index; });
    if (tocLinks) Array.from(tocLinks.children).forEach((anchor, index) => { if (index === current) anchor.setAttribute('aria-current', 'location'); else anchor.removeAttribute('aria-current'); });
  };
  const queueReading = () => { if (!framePending) { framePending = true; window.requestAnimationFrame(updateReading); } };
  window.addEventListener('scroll', queueReading, { passive: true });
  window.addEventListener('resize', queueReading, { passive: true });
  updateReading();
})();
