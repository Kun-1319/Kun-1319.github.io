(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    const filter = () => {
      const terms = input.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
      let count = 0;
      rows.forEach(row => { row.hidden = !terms.every(term => row.dataset.searchText.includes(term)); if (!row.hidden) count++; });
      status.textContent = count ? `找到 ${count} 篇文章` : '暂时没有找到，换个关键词试试。';
    };
    searchOpen.addEventListener('click', () => { dialog.showModal(); document.body.classList.add('dialog-open'); filter(); input.focus(); });
    dialog.querySelector('[data-search-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); searchOpen.focus(); });
    dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
    input.addEventListener('input', filter);
    document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (!dialog.open) searchOpen.click(); } });
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
