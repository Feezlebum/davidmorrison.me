// One silent preview plays at a time. Detached players cannot update a new selection.
let pausedByUser = false;

export function mountProjectPreviews(root, entries, initialSlug, onSelect) {
  const links = [...root.querySelectorAll('.project-index-link')];
  const circularMode = Boolean(root.querySelector('[data-circular-slider]'));
  const wrapper = root.querySelector('.project-preview-wrap');
  const stage = root.querySelector('.project-preview');
  const frame = root.querySelector('.project-preview-media');
  const title = root.querySelector('[data-preview-title]');
  const button = root.querySelector('[data-preview-playback]');
  if (!wrapper || !stage || !frame || !title || !button) return () => {};

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = globalThis.navigator?.connection;
  let active = true;
  let inView = false;
  let video = null;
  let selected = null;
  let releaseListeners = () => {};
  let pendingPlay = null;
  let playbackIntent = null;
  let startupTimer = null;
  let failed = false;
  let playBlocked = false;
  let manualMotion = false;
  let selectedEntry = null;
  let releasePoster = () => {};
  const isCurrent = candidate => active && root.isConnected && video === candidate;
  const canPlay = () => active && root.isConnected && inView && !document.hidden && !failed && !playBlocked && !pausedByUser && (!(reducedMotion.matches || connection?.saveData) || manualMotion);
  const clearStartup = () => {
    if (startupTimer !== null) clearTimeout(startupTimer);
    startupTimer = null;
  };
  const invalidatePlayback = () => {
    playbackIntent = null;
    pendingPlay = null;
    clearStartup();
  };
  const showState = state => {
    wrapper.dataset.previewState = state;
    button.hidden = !video;
    const playing = state === 'playing' || state === 'loading';
    const action = failed ? 'Retry' : playing ? 'Pause' : 'Play';
    button.textContent = action;
    button.setAttribute('aria-label', `${action} video preview`);
  };
  const stopVideo = () => {
    const previous = video;
    video = null;
    invalidatePlayback();
    releaseListeners();
    releaseListeners = () => {};
    if (previous) {
      previous.pause();
      previous.removeAttribute('src');
      previous.load();
      previous.remove();
    }
    delete wrapper.dataset.previewReady;
  };
  const failVideo = current => {
    if (!isCurrent(current)) return;
    failed = true;
    invalidatePlayback();
    current.pause();
    delete wrapper.dataset.previewReady;
    showState('fallback');
  };
  const reconcile = () => {
    const current = video;
    if (!current) return;
    if (!canPlay()) {
      invalidatePlayback();
      current.pause();
      showState(failed ? 'fallback' : 'paused');
      return;
    }
    if (!current.paused || pendingPlay?.video === current) return;
    showState('loading');
    const intent = {video: current};
    pendingPlay = intent;
    playbackIntent = intent;
    startupTimer = setTimeout(() => {
      if (isCurrent(current) && playbackIntent === intent) failVideo(current);
    }, 13000);
    const onRejected = error => {
      if (!isCurrent(current) || playbackIntent !== intent) return;
      if (error?.name === 'NotAllowedError' || error?.name === 'AbortError') {
        playBlocked = true;
        invalidatePlayback();
        current.pause();
        showState('paused');
      } else failVideo(current);
    };
    let request;
    try { request = current.play(); }
    catch (error) { onRejected(error); return; }
    void Promise.resolve(request).then(() => {
      if (!isCurrent(current)) { current.pause(); return; }
      if (playbackIntent !== intent) {
        if (!canPlay()) current.pause();
        return;
      }
      clearStartup();
      if (!canPlay()) { current.pause(); showState(failed ? 'fallback' : 'paused'); }
    }).catch(onRejected).finally(() => {
      if (pendingPlay === intent) pendingPlay = null;
    });
  };
  const createVideo = entry => {
    const current = document.createElement('video');
    video = current;
    current.dataset.previewVideo = '';
    current.setAttribute('aria-hidden', 'true');
    current.setAttribute('muted', '');
    current.setAttribute('playsinline', '');
    current.setAttribute('loop', '');
    current.defaultMuted = true;
    current.muted = true;
    current.playsInline = true;
    current.loop = true;
    current.preload = 'none';
    current.disablePictureInPicture = true;
    current.disableRemotePlayback = true;
    current.poster = frame.querySelector('[data-preview-image]')?.src || entry.media.path;
    current.width = entry.video.width;
    current.height = entry.video.height;
    current.src = entry.video.streamUrl;
    const onPlaying = () => {
      if (!isCurrent(current)) return;
      if (!canPlay() || !playbackIntent) {
        current.pause();
        showState(failed ? 'fallback' : 'paused');
        return;
      }
      if (current.paused) return;
      clearStartup();
      wrapper.dataset.previewReady = 'true';
      showState('playing');
    };
    const onPause = () => {
      if (isCurrent(current) && current.paused && !failed) showState('paused');
    };
    const onError = () => failVideo(current);
    current.addEventListener('playing', onPlaying);
    current.addEventListener('pause', onPause);
    current.addEventListener('error', onError);
    releaseListeners = () => {
      current.removeEventListener('playing', onPlaying);
      current.removeEventListener('pause', onPause);
      current.removeEventListener('error', onError);
    };
    frame.append(current);
    reconcile();
  };
  const select = slug => {
    if (!active || !root.isConnected) return;
    const entry = entries.find(item => item.slug === slug);
    if (!entry) return;
    if (selected === slug) { reconcile(); return; }
    stopVideo();
    releasePoster();
    selected = slug;
    selectedEntry = entry;
    failed = false;
    playBlocked = false;
    manualMotion = false;
    onSelect(slug);
    stage.dataset.activeProject = slug;
    stage.href = `/work/${slug}`;
    stage.setAttribute('aria-label', `Open ${entry.title} case study`);
    title.textContent = entry.title;
    for (const link of links) {
      if (link.dataset.project === slug) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }

    const poster = document.createElement('img');
    poster.dataset.previewImage = '';
    poster.src = entry.media.path;
    poster.alt = entry.media.alt;
    poster.width = entry.media.width;
    poster.height = entry.media.height;
    poster.decoding = 'async';
    let artworkFallback = false;
    const onPosterError = () => {
      if (!active || frame.querySelector('[data-preview-image]') !== poster || artworkFallback || !entry.thumbnail?.path) return;
      artworkFallback = true;
      poster.src = entry.thumbnail.path;
      poster.alt = `Original portfolio artwork for ${entry.title}; decorative campaign thumbnail.`;
      poster.width = entry.thumbnail.width;
      poster.height = entry.thumbnail.height;
      if (video) video.poster = entry.thumbnail.path;
    };
    poster.addEventListener('error', onPosterError);
    releasePoster = () => poster.removeEventListener('error', onPosterError);
    frame.replaceChildren(poster);
    if (!entry.video) { showState('fallback'); return; }
    createVideo(entry);
  };

  const onPlaybackClick = () => {
    if (!video) return;
    if (failed) {
      stopVideo();
      failed = false;
      playBlocked = false;
      pausedByUser = false;
      manualMotion = true;
      createVideo(selectedEntry);
      return;
    }
    if (wrapper.dataset.previewState === 'playing' || wrapper.dataset.previewState === 'loading') {
      pausedByUser = true;
      reconcile();
    } else {
      pausedByUser = false;
      playBlocked = false;
      manualMotion = true;
      reconcile();
    }
  };
  const handlers = (circularMode ? [] : links).map(link => {
    const onPointer = event => { if (event.pointerType !== 'touch') select(link.dataset.project); };
    const onFocus = () => select(link.dataset.project);
    const onClick = () => onSelect(link.dataset.project);
    link.addEventListener('pointerenter', onPointer);
    link.addEventListener('focus', onFocus);
    link.addEventListener('click', onClick);
    return () => {
      link.removeEventListener('pointerenter', onPointer);
      link.removeEventListener('focus', onFocus);
      link.removeEventListener('click', onClick);
    };
  });
  const observer = new IntersectionObserver(records => {
    inView = records.some(record => record.isIntersecting && record.intersectionRatio >= .15);
    reconcile();
  }, {threshold: [0, .15]});
  observer.observe(frame);
  const onMotionChange = () => { manualMotion = false; reconcile(); };
  const onPageHide = () => { inView = false; reconcile(); };
  const onPageShow = () => { observer.disconnect(); observer.observe(frame); };
  document.addEventListener('visibilitychange', reconcile);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', onPageShow);
  reducedMotion.addEventListener('change', onMotionChange);
  connection?.addEventListener?.('change', onMotionChange);
  button.addEventListener('click', onPlaybackClick);
  select(initialSlug);

  const dispose = () => {
    active = false;
    observer.disconnect();
    document.removeEventListener('visibilitychange', reconcile);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('pageshow', onPageShow);
    reducedMotion.removeEventListener('change', onMotionChange);
    connection?.removeEventListener?.('change', onMotionChange);
    button.removeEventListener('click', onPlaybackClick);
    handlers.forEach(remove => remove());
    releasePoster();
    stopVideo();
  };
  dispose.select = select;
  return dispose;
}
