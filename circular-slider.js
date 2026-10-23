export const wrapIndex = (index, count) => count > 0 ? ((index % count) + count) % count : 0;

export function circularPositions(count, position, width, cardWidth) {
  if (count < 1) return [];
  const radius = Math.max(1, width * 1.8);
  const step = Math.asin(Math.min(.95, (cardWidth + 14) / radius));
  return Array.from({length: count}, (_, index) => {
    const offset = wrapIndex(index - position + count / 2, count) - count / 2;
    const angle = offset * step;
    const distance = Math.abs(offset);
    return {
      index, offset,
      x: radius * Math.sin(angle),
      y: radius * (1 - Math.cos(angle)),
      rotation: angle * 180 / Math.PI,
      opacity: distance <= 1 ? 1 - distance * .18 : Math.max(0, (2 - distance) * .82),
      z: Math.round(100 - distance * 10),
    };
  });
}

export function mountCircularSlider(root, initialSlug, onSelect) {
  const inert = {select: () => false, dispose: () => {}};
  if (!root) return inert;
  const track = root.querySelector('[data-circular-track]');
  const links = [...root.querySelectorAll('.project-index-link[data-project]')];
  const items = links.map(link => link.closest('.circular-project'));
  if (!track || !links.length || items.some(item => !item)) return inert;
  const previous = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');
  const status = root.querySelector('[data-carousel-status]');
  const motion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
  let active = true;
  let selected = Math.max(0, links.findIndex(link => link.dataset.project === initialSlug));
  let drag = null;
  let suppressClick = null;
  let suppressionTimer = null;
  let width = 320;
  let cardWidth = 140;
  const oldTouchAction = track.style.touchAction;
  track.style.touchAction = 'pan-y pinch-zoom';

  const clearSuppression = () => {
    suppressClick = null;
    if (suppressionTimer !== null) clearTimeout(suppressionTimer);
    suppressionTimer = null;
  };
  const suppressDragClick = pointerId => {
    clearSuppression();
    suppressClick = {pointerId};
    suppressionTimer = setTimeout(clearSuppression, 500);
  };
  const paint = (position = selected) => {
    if (!active) return;
    for (const point of circularPositions(links.length, position, width, cardWidth)) {
      const item = items[point.index];
      item.style.setProperty('--card-x', `${point.x.toFixed(3)}px`);
      item.style.setProperty('--card-y', `${point.y.toFixed(3)}px`);
      item.style.setProperty('--card-rotation', `${point.rotation.toFixed(3)}deg`);
      item.style.setProperty('--card-opacity', String(point.opacity));
      item.style.setProperty('--card-z', String(point.z));
      item.style.pointerEvents = point.opacity > .05 ? '' : 'none';
      item.dataset.active = String(point.index === selected);
    }
    for (const [index, link] of links.entries()) {
      if (index === selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };
  const announce = () => {
    if (!status) return;
    const title = links[selected].querySelector('.project-index-name')?.textContent.trim() || links[selected].getAttribute('aria-label') || links[selected].dataset.project;
    status.textContent = `${title}, ${selected + 1} of ${links.length}`;
  };
  const releaseCapture = gesture => {
    if (!gesture?.captured) return;
    try { track.releasePointerCapture(gesture.pointerId); } catch {}
  };
  const cancelDrag = (cancelled = false) => {
    const gesture = drag;
    drag = null;
    track.dataset.dragging = 'false';
    if (gesture && (gesture.moved || cancelled)) suppressDragClick(gesture.pointerId);
    releaseCapture(gesture);
    paint();
  };
  const commit = index => {
    if (!active) return false;
    if (drag) cancelDrag();
    const candidate = wrapIndex(index, links.length);
    const changed = candidate !== selected;
    selected = candidate;
    paint();
    if (changed) {
      announce();
      onSelect?.(links[selected].dataset.project);
    }
    return changed;
  };
  const select = slug => {
    const index = links.findIndex(link => link.dataset.project === slug);
    return index >= 0 ? commit(index) : false;
  };
  const measure = () => {
    if (!active) return;
    if (drag) cancelDrag();
    width = track.clientWidth || track.getBoundingClientRect().width || 320;
    // offsetWidth stays unrotated; a transformed bounding box would inflate the arc.
    cardWidth = items[0].offsetWidth || links[0].offsetWidth || 140;
    paint();
  };
  const onDown = event => {
    if (!active || drag || event.isPrimary === false || (event.button !== undefined && event.button !== 0)) return;
    clearSuppression();
    drag = {pointerId: event.pointerId, x: event.clientX, y: event.clientY, start: selected, position: selected, horizontal: false, vertical: false, captured: false, moved: false};
  };
  const onMove = event => {
    if (!active || !drag || event.pointerId !== drag.pointerId || drag.vertical) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) >= 8) drag.moved = true;
    if (!drag.horizontal) {
      if (Math.abs(dy) >= 8 && Math.abs(dy) > Math.abs(dx)) { drag.vertical = true; return; }
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy) * 1.2) return;
      drag.horizontal = true;
      track.dataset.dragging = 'true';
      try { track.setPointerCapture(drag.pointerId); drag.captured = true; } catch {}
    }
    event.preventDefault();
    drag.position = drag.start - dx / (cardWidth + 14);
    paint(drag.position);
  };
  const onUp = event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const gesture = drag;
    drag = null;
    track.dataset.dragging = 'false';
    releaseCapture(gesture);
    if (gesture.horizontal) {
      suppressDragClick(gesture.pointerId);
      commit(Math.round(gesture.position));
    } else {
      if (gesture.moved) suppressDragClick(gesture.pointerId);
      paint();
    }
  };
  const onCancel = event => { if (drag && event.pointerId === drag.pointerId) cancelDrag(true); };
  // Touch input is implicitly captured by the card under the finger. Taking capture for the track makes that card
  // lose it, and its lostpointercapture bubbles here; only the track's own loss ends a drag.
  const onLostCapture = event => { if (event.target === track) onCancel(event); };
  const onClick = event => {
    if (!active) return;
    if (suppressClick && event.detail !== 0 && track.contains(event.target) && (event.pointerId === undefined || event.pointerId === suppressClick.pointerId)) {
      clearSuppression();
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return;
    }
    const link = event.target.closest?.('[data-project]');
    if (links.includes(link) && !event.defaultPrevented) select(link.dataset.project);
  };
  const onKey = event => {
    if (!active || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    const destination = {ArrowLeft: selected - 1, ArrowRight: selected + 1, Home: 0, End: links.length - 1}[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    const fromCard = links.includes(event.target.closest?.('[data-project]'));
    commit(destination);
    if (fromCard) links[selected].focus({preventScroll: true});
  };
  const onPrevious = event => { event.preventDefault(); commit(selected - 1); };
  const onNext = event => { event.preventDefault(); commit(selected + 1); };
  const onNativeDrag = event => event.preventDefault();
  const onBlur = () => { if (drag) cancelDrag(true); };
  const onMotion = () => { if (drag) cancelDrag(); else paint(); };
  const focusHandlers = links.map(link => {
    // Pointer focus precedes click/drag classification. Moving that card now
    // could move its hit target; native click selects it before navigation.
    const handler = () => { if (!drag) select(link.dataset.project); };
    link.addEventListener('focus', handler);
    return () => link.removeEventListener('focus', handler);
  });
  root.addEventListener('click', onClick, true);
  root.addEventListener('keydown', onKey);
  track.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, {passive: false});
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onCancel);
  track.addEventListener('lostpointercapture', onLostCapture);
  track.addEventListener('dragstart', onNativeDrag);
  previous?.addEventListener('click', onPrevious);
  next?.addEventListener('click', onNext);
  window.addEventListener('blur', onBlur);
  window.addEventListener('resize', measure);
  motion?.addEventListener('change', onMotion);
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
  observer?.observe(track);
  observer?.observe(items[0]);
  track.dataset.dragging = 'false';
  measure();
  announce();
  return {
    select,
    dispose() {
      if (!active) return;
      active = false;
      const gesture = drag;
      drag = null;
      track.dataset.dragging = 'false';
      clearSuppression();
      observer?.disconnect();
      root.removeEventListener('click', onClick, true);
      root.removeEventListener('keydown', onKey);
      track.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      track.removeEventListener('lostpointercapture', onLostCapture);
      track.removeEventListener('dragstart', onNativeDrag);
      previous?.removeEventListener('click', onPrevious);
      next?.removeEventListener('click', onNext);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('resize', measure);
      motion?.removeEventListener('change', onMotion);
      focusHandlers.forEach(remove => remove());
      releaseCapture(gesture);
      track.style.touchAction = oldTouchAction;
    },
  };
}
