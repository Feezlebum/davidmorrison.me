// X's native widget renders the original post and its media.
// Load the provider once, then mount posts as they approach the viewport.
let widgetsPromise;
let widgetsLoadFailed=false;
let cancelWidgetsLoad;
let providerConsumers=0;
const PROVIDER_TIMEOUT=15000;
const POST_TIMEOUT=12000;

export function tweetId(url) {
  try {
    const source=new URL(url);
    if(!['x.com','twitter.com','www.x.com','www.twitter.com'].includes(source.hostname))return null;
    return source.pathname.match(/^\/[^/]+\/status\/(\d+)(?:\/|$)/)?.[1] || null;
  } catch { return null; }
}

function loadWidgets() {
  if(window.twttr?.widgets?.createTweet)return Promise.resolve(window.twttr.widgets);
  if(widgetsPromise)return widgetsPromise;
  widgetsPromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.id='x-post-widgets';
    script.src='https://platform.twitter.com/widgets.js';
    script.async=true;
    script.charset='utf-8';
    let settled=false;
    let timeout;
    const finish=error=>{
      if(settled)return;
      settled=true;
      clearTimeout(timeout);
      script.removeEventListener('load',onLoad);
      script.removeEventListener('error',onError);
      cancelWidgetsLoad=undefined;
      if(error) {
        widgetsLoadFailed=true;
        script.remove();
        reject(error);
      } else resolve(window.twttr.widgets);
    };
    const onLoad=()=>finish(window.twttr?.widgets?.createTweet?null:new Error('X widget did not initialize'));
    const onError=()=>finish(new Error('X widget could not load'));
    script.addEventListener('load',onLoad);
    script.addEventListener('error',onError);
    timeout=setTimeout(()=>finish(new Error('X widget timed out')),PROVIDER_TIMEOUT);
    cancelWidgetsLoad=()=>finish(new Error('X widget load cancelled'));
    document.head.append(script);
  });
  return widgetsPromise;
}

export function mountTweetEmbeds(root) {
  if(!root)return ()=>{};
  const panels=Array.from(root.querySelectorAll('.tweet-embed[data-tweet-id]'));
  if(!panels.length)return ()=>{};
  // A failed provider is retried on the next mount, never once per post.
  if(widgetsLoadFailed) {
    widgetsPromise=undefined;
    widgetsLoadFailed=false;
  }
  let active=true;
  let provider;
  let usesProvider=false;
  const getWidgets=()=>{
    if(!provider) {
      usesProvider=true;
      providerConsumers++;
      provider=loadWidgets();
    }
    return provider;
  };
  const jobs=new WeakMap();
  const pending=new Set();
  const render=panel=>{
    if(jobs.has(panel))return jobs.get(panel);
    if(panel.dataset.embedState==='ready'||panel.dataset.embedState==='fallback')return Promise.resolve();
    let resolveJob;
    const job=new Promise(resolve=>{resolveJob=resolve;});
    jobs.set(panel,job);
    panel.dataset.embedState='loading';
    const host=panel.querySelector('.tweet-host');
    let settled=false;
    let timeout;
    let slot;
    const discardSlot=()=>{
      if(!slot)return;
      slot.replaceChildren();
      slot.remove();
    };
    const finish=state=>{
      if(settled)return;
      settled=true;
      clearTimeout(timeout);
      pending.delete(cancel);
      if(state==='ready'&&active&&panel.isConnected) {
        slot.style.minHeight='';
        panel.dataset.embedState='ready';
      } else {
        discardSlot();
        if(active&&panel.isConnected)panel.dataset.embedState='fallback';
      }
      resolveJob();
    };
    const cancel=()=>finish('fallback');
    pending.add(cancel);
    void (async()=>{
      try {
        const widgets=await getWidgets();
        if(settled||!active||!panel.isConnected||!host||!panel.dataset.tweetId) {
          finish('fallback');
          return;
        }
        // The provider only receives this disposable slot. A late result after
        // timeout or navigation can populate a detached node, never the page.
        slot=document.createElement('div');
        slot.className='tweet-render-slot';
        slot.style.minHeight='200px';
        host.replaceChildren(slot);
        timeout=setTimeout(cancel,POST_TIMEOUT);
        const widget=await widgets.createTweet(panel.dataset.tweetId,slot,{
          theme:panel.dataset.tweetTheme==='light'?'light':'dark',
          conversation:'none',
          dnt:true,
          align:'left',
          // CSS fits the column while allowing the widget to grow on resize.
          width:550,
        });
        if(settled||!active||!panel.isConnected) {
          discardSlot();
          finish('fallback');
          return;
        }
        finish(widget?'ready':'fallback');
      } catch { finish('fallback'); }
    })();
    return job;
  };
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){observer.unobserve(entry.target);void render(entry.target);}
  },{rootMargin:'800px 0px'});
  panels.forEach(panel=>observer.observe(panel));

  const chapters=Array.from(root.querySelectorAll('.timeline-chapter'));
  const route=location.pathname+location.search;
  let correction;
  const cancelCorrection=()=>{
    const previous=correction;
    correction=undefined;
    if(!previous)return;
    if(previous.frame)cancelAnimationFrame(previous.frame);
    previous.cancelWait?.();
  };
  const current=intent=>active&&root.isConnected&&correction===intent&&location.pathname+location.search===route&&location.hash===intent.hash;
  const chapterForHash=hash=>{
    let id;
    try { id=decodeURIComponent(hash.slice(1)); } catch { return null; }
    return chapters.find(chapter=>chapter.id===id)||null;
  };
  const waitForLayout=(intent,through)=>new Promise(resolve=>{
    let quietTimeout;
    let limitTimeout;
    let resizeObserver;
    let settled=false;
    const finish=()=>{
      if(settled)return;
      settled=true;
      clearTimeout(quietTimeout);
      clearTimeout(limitTimeout);
      resizeObserver?.disconnect();
      intent.cancelWait=undefined;
      resolve(current(intent));
    };
    const changed=()=>{
      clearTimeout(quietTimeout);
      quietTimeout=setTimeout(finish,300);
    };
    intent.cancelWait=finish;
    if(typeof ResizeObserver!=='undefined') {
      resizeObserver=new ResizeObserver(changed);
      through.forEach(chapter=>resizeObserver.observe(chapter));
    }
    limitTimeout=setTimeout(finish,2000);
    changed();
  });
  const requestCorrection=hash=>{
    const target=chapterForHash(hash);
    if(!target) {
      cancelCorrection();
      return;
    }
    if(correction?.hash===hash)return;
    cancelCorrection();
    const intent={hash,target,frame:undefined,cancelWait:undefined};
    correction=intent;
    // The native anchor first updates history and the hash. No navigation is
    // intercepted; only its position is restored after earlier posts settle.
    intent.frame=requestAnimationFrame(async()=>{
      intent.frame=undefined;
      if(!current(intent))return;
      const through=chapters.slice(0,chapters.indexOf(target)+1);
      const required=panels.filter(panel=>through.includes(panel.closest('.timeline-chapter')));
      await Promise.all(required.map(panel=>{
        observer.unobserve(panel);
        return render(panel);
      }));
      if(!current(intent))return;
      if(!await waitForLayout(intent,through))return;
      intent.frame=requestAnimationFrame(()=>{
        intent.frame=undefined;
        if(!current(intent))return;
        target.scrollIntoView({block:'start',behavior:'instant'});
        correction=undefined;
      });
    });
  };
  const onClick=event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest?.('a[href]');
    if(!link||link.target||link.hasAttribute('download'))return;
    const url=new URL(link.href,location.href);
    if(url.origin===location.origin&&url.pathname+url.search===route&&url.hash)requestCorrection(url.hash);
  };
  const onHashChange=()=>requestCorrection(location.hash);
  const onKeyDown=event=>{
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','PageUp','PageDown','Home','End',' ','Spacebar','Tab'].includes(event.key))cancelCorrection();
  };
  root.addEventListener('click',onClick);
  window.addEventListener('hashchange',onHashChange);
  window.addEventListener('wheel',cancelCorrection,{passive:true});
  window.addEventListener('touchstart',cancelCorrection,{passive:true});
  window.addEventListener('keydown',onKeyDown);
  window.addEventListener('resize',cancelCorrection);
  requestCorrection(location.hash);

  return ()=>{
    if(!active)return;
    active=false;
    cancelCorrection();
    observer.disconnect();
    root.removeEventListener('click',onClick);
    window.removeEventListener('hashchange',onHashChange);
    window.removeEventListener('wheel',cancelCorrection);
    window.removeEventListener('touchstart',cancelCorrection);
    window.removeEventListener('keydown',onKeyDown);
    window.removeEventListener('resize',cancelCorrection);
    pending.forEach(cancel=>cancel());
    panels.forEach(panel=>{
      panel.querySelector('.tweet-host')?.replaceChildren();
      delete panel.dataset.embedState;
    });
    if(usesProvider) {
      providerConsumers--;
      if(!providerConsumers)cancelWidgetsLoad?.();
    }
  };
}
