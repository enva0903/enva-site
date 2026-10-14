(() => {
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const q=s=>document.querySelector(s);
  const qa=s=>[...document.querySelectorAll(s)];
  let paused=false;
  // Keep the reference's short, staggered character entrances.
  qa('[data-letter-reveal]').forEach(el=>{let i=0;const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(node=>{if(!node.textContent.trim())return;const f=document.createDocumentFragment();for(const ch of node.textContent){const span=document.createElement('span');span.className='letter'+(/\s/.test(ch)?' space':'');span.style.setProperty('--i',i++);span.textContent=ch;span.setAttribute('aria-hidden','true');f.append(span);}node.parentNode.replaceChild(f,node);});el.setAttribute('aria-label',el.textContent);});
  qa('[data-letter-reveal]').forEach(el=>{const letters=[...el.querySelectorAll('.letter')];letters.forEach((letter,i)=>{letter.style.setProperty('--letter-x',((i-(letters.length-1)/2)*.22)+'em');letter.style.setProperty('--letter-turn',[-130,170,-110,70,-60][i%5]+'deg');letter.style.setProperty('--letter-mid-turn',[-35,50,-25,20,30][i%5]+'deg');letter.style.setProperty('--letter-duration',[.6,.5,.61,.55][i%4]+'s');letter.style.setProperty('--letter-delay',(100+(i%5)*14)+'ms');});});
  qa('#lunch,#dinner').forEach(section=>{const body=document.createElement('div');body.className='motion-panel-body';while(section.firstChild)body.append(section.firstChild);section.append(body);section.classList.add('motion-layer');});
  qa('.squish').forEach(el=>{const inner=document.createElement('span');inner.className='squish-inner';while(el.firstChild)inner.append(el.firstChild);el.append(inner);});
  function fitTypography(){qa('.squish').forEach(el=>{const inner=el.querySelector(':scope > .squish-inner');const style=getComputedStyle(el);const edges=['paddingTop','paddingBottom','borderTopWidth','borderBottomWidth'].reduce((sum,key)=>sum+(parseFloat(style[key])||0),0);el.style.height=(inner.offsetHeight*.64+edges)+'px';});const hero=q('.hero');hero.style.setProperty('--hero-stick',Math.min(0,innerHeight-hero.offsetHeight)+'px');requestAnimationFrame(refreshGeometry);}
  fitTypography();document.fonts.ready.then(fitTypography);window.addEventListener('resize',fitTypography);
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});},{threshold:.08,rootMargin:'0px 0px -20px 0px'});
  qa('.reveal,.step-enter,[data-letter-reveal]').forEach(el=>observer.observe(el));
  root.classList.add('js');
  const menu=q('#navigation'), toggle=q('.menu-toggle');
  let previouslyFocused;
  function openMenu(){previouslyFocused=document.activeElement;toggle.setAttribute('aria-expanded','true');menu.showModal();document.body.style.overflow='hidden';}
  function closeMenu(){menu.close();toggle.setAttribute('aria-expanded','false');document.body.style.overflow='';previouslyFocused?.focus();}
  toggle.addEventListener('click',openMenu);q('.menu-close').addEventListener('click',closeMenu);
  menu.addEventListener('cancel',e=>{e.preventDefault();closeMenu();});
  menu.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',closeMenu));
  const demo=q('#demo-dialog');let demoFocus;
  const demoTexts={visit:['ご来店のご案内','こむぎ日和は、デザイン検証用の架空のラーメン店です。実在する住所・店舗・予約窓口はありません。お店の情報を見せる画面の試作としてご覧ください。'],noodles:['麺づくりのお便り','小麦と水を合わせるところから、毎朝の一杯づくりが始まる。そんなお店の物語を伝えるお便り欄の試作です。記事の配信や会員登録は行いません。'],journal:['日々のお便り','写真も店内も、架空のお店のために生成したものです。外部のSNSアカウントには接続していません。']};
  qa('[data-demo]').forEach(b=>b.addEventListener('click',()=>{const [title,description]=demoTexts[b.dataset.demo];q('#demo-title').textContent=title;q('#demo-description').textContent=description;demoFocus=b;demo.showModal();}));
  function closeDemo(){demo.close();demoFocus?.focus();}
  q('.demo-close').addEventListener('click',closeDemo);demo.addEventListener('cancel',e=>{e.preventDefault();closeDemo();});
  demo.addEventListener('click',e=>{if(e.target===demo){const r=demo.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDemo();}});
  const mates=[
    {name:'小麦',initial:'麦',english:'Wheat',sprite:'wheat',sound:'toasty, toasty!',color:'#f39b60',description:'スープにふわりと広がる、焦がし麦の香り。小さな粒から、一杯の個性がはじまります。'},
    {name:'たまご',initial:'卵',english:'Golden egg',sprite:'egg',sound:'soft & golden',color:'#edcf4f',description:'白身はふるふる、黄身はとろり。やさしい醤油だれで味を含ませた、どんぶりの小さなごほうび。'},
    {name:'醤油',initial:'醤',english:'Shoyu',sprite:'shoyu',sound:'deep, mellow!',color:'#c7e3c3',description:'鶏だしと麦の香りをつなぐ、まろやかな醤油だれ。強すぎず、薄すぎず、一杯をきゅっとまとめます。'},
    {name:'細麺',initial:'麺',english:'House noodles',sprite:'noodle',sound:'slurp, slurp!',color:'#f2bc84',description:'毎朝打って、細く切り出す自家製麺。つるっと、ぷつっと。小麦の甘さを感じる、こむぎ日和の主役です。'},
    {name:'ねぎ',initial:'葱',english:'Scallions',sprite:'scallion',sound:'fresh & crisp!',color:'#cbe0b5',description:'しゃきっと軽い食感と、すっと抜ける香り。最後のひと口までさわやかにしてくれる、頼れる脇役。'}
  ];
  const ingredients=q('#ingredients'),card=q('.ingredient-card'),cardInner=q('.card-inner');
  const cardNav=qa('[data-card]');
  let index=-1,requestedIndex=-1,transitionBusy=false,cardAnimation=null,manualSelection=null;
  const canAnimate=()=>!paused&&!reduced.matches;
  function renderMate(i){index=i;const m=mates[i];cardInner.style.transition='none';card.classList.remove('flipped');requestAnimationFrame(()=>requestAnimationFrame(()=>{cardInner.style.transition='';}));card.setAttribute('aria-label',m.name+'のカードを裏返す');card.setAttribute('aria-pressed','false');q('.flip-hint').textContent='Tap to meet me ↻';card.style.setProperty('--card-color',m.color);card.style.setProperty('--card-r',i%2?'3deg':'-3deg');q('.card-initial').textContent=m.initial;q('.card-sound').textContent=m.sound;q('.card-name .squish-inner').textContent=m.name;q('.card-en').textContent=m.english;q('.card-description').textContent=m.description;qa('.card-mascot').forEach(el=>el.className='mascot '+m.sprite+' card-mascot');cardNav.forEach(b=>{const active=Number(b.dataset.card)===i;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});q('.card-stack').dataset.active=i;q('.ingredient-progress').style.setProperty('--progress-x',(i*100)+'%');const title=q('.card-name');title.style.height=(title.firstElementChild.offsetHeight*.64)+'px';}
  async function moveCard(frames,duration){cardAnimation=card.animate(frames,{duration,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});const animation=cardAnimation;try{await animation.finished;}catch{}finally{animation.cancel();if(cardAnimation===animation)cardAnimation=null;}}
  async function changeCard(){transitionBusy=true;card.setAttribute('aria-busy','true');try{while(requestedIndex!==index){const direction=requestedIndex>index?1:-1;if(canAnimate()&&index>=0)await moveCard([{opacity:1,translate:'0 0',rotate:'0deg'},{opacity:.3,translate:`${-direction*12}px 3px`,rotate:`${-direction*8}deg`},{opacity:0,translate:`${-direction*34}px 13px`,rotate:`${-direction*12}deg`}],140);renderMate(requestedIndex);if(canAnimate())await moveCard([{opacity:0,translate:`${direction*40}px 18px`,rotate:`${direction*11}deg`},{opacity:1,translate:`${-direction*3}px -2px`,rotate:`${-direction*2}deg`,offset:.8},{opacity:1,translate:'0 0',rotate:'0deg'}],360);}}finally{transitionBusy=false;card.setAttribute('aria-busy','false');}}
  function selectMate(i,animate=true){requestedIndex=i;if(!animate){renderMate(i);return;}if(!transitionBusy&&i!==index)void changeCard();}
  selectMate(0,false);
  card.addEventListener('click',()=>{if(transitionBusy)return;const flipped=card.classList.toggle('flipped');card.setAttribute('aria-pressed',String(flipped));q('.flip-hint').textContent=flipped?'Tap to turn me back ↻':'Tap to meet me ↻';});
  cardNav.forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.card);selectMate(i);if(!reduced.matches){const target=ingredientTop+ingredientDistance*(i+.5)/5;manualSelection={index:i,target,expires:performance.now()+1800};window.scrollTo({top:target,behavior:paused?'auto':'smooth'});requestScrollFrame();}}));
  // Measure layout only when it changes; transforms must not feed back into bounds.
  const panels=qa('.overlap-panel');
  let panelGeometry=[],ingredientTop=0,ingredientDistance=0,scrollFrame=0,lastFrameTime=0;
  function documentTop(el){let top=0;for(let node=el;node;node=node.offsetParent)top+=node.offsetTop;return top;}
  function refreshGeometry(){const layers=qa('.motion-layer');layers.forEach(el=>{el.style.position='relative';el.style.top='0px';});panelGeometry=panels.map((el,i)=>({el,body:el.querySelector(':scope > .motion-panel-body'),top:documentTop(el),height:el.offsetHeight,nextTop:panels[i+1]?documentTop(panels[i+1]):null,current:panelGeometry[i]?.current||0}));ingredientTop=documentTop(ingredients);ingredientDistance=Math.max(0,ingredients.offsetHeight-innerHeight);layers.forEach(el=>{el.style.setProperty('--panel-stick',Math.min(-1,innerHeight-el.offsetHeight-1)+'px');el.style.position='';el.style.top='';});requestScrollFrame();}
  function requestScrollFrame(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);}
  function updateScroll(time){scrollFrame=0;const y=scrollY,view=innerHeight;const dt=Math.min(64,Math.max(1,lastFrameTime?time-lastFrameTime:16));lastFrameTime=time;let settling=false;
    if(manualSelection&&(Math.abs(y-manualSelection.target)<3||time> manualSelection.expires))manualSelection=null;
    if(!manualSelection&&!reduced.matches&&ingredientDistance>0&&y>=ingredientTop-15&&y<=ingredientTop+ingredientDistance+15){const p=Math.max(0,Math.min(.999,(y-ingredientTop)/ingredientDistance));const next=Math.min(4,Math.floor(p*5));const boundary=next>requestedIndex?next/5:(next+1)/5;const pastBoundary=next>requestedIndex?p>boundary+.012:p<boundary-.012;if(next===requestedIndex||pastBoundary)selectMate(next);}
    const alpha=1-Math.exp(-dt/95);
    panelGeometry.forEach((g,i)=>{const actor=g.body||g.el;if(!canAnimate()){g.current=0;actor.style.transform='';return;}let target;if(g.body){const entry=Math.max(0,Math.min(1,(g.top-y)/view));target=Math.round(entry*2)/2;}else{if(g.nextTop===null){actor.style.transform='';return;}target=Math.max(0,Math.min(1,(view*.48-(g.nextTop-y))/(view*.75)));}const visible=g.top+g.height-y>0&&g.top-y<view;g.current=visible?g.current+(target-g.current)*alpha:target;if(Math.abs(target-g.current)>.002&&visible)settling=true;else g.current=target;if(g.body){g.el.style.transform='';actor.style.transform=`translateX(${-g.current*4}%) rotate(${g.current*10}deg)`;}else actor.style.transform=`scale(${1-g.current*.025}) rotate(${(i%2?1:-1)*g.current*.7}deg)`;});
    if(settling||manualSelection)requestScrollFrame();
  }
  ['wheel','touchstart','keydown'].forEach(event=>window.addEventListener(event,()=>{manualSelection=null;},{passive:true}));
  window.addEventListener('scroll',requestScrollFrame,{passive:true});window.addEventListener('resize',refreshGeometry);refreshGeometry();
  // Desktop mouse wheels ease into position; touch and small trackpad deltas stay native.
  let wheelFrame=0,wheelTarget=0,wheelTime=0;
  function stopWheel(){if(wheelFrame)cancelAnimationFrame(wheelFrame);wheelFrame=0;wheelTime=0;root.classList.remove('wheel-smoothing');}
  function easeWheel(time){const dt=Math.min(64,wheelTime?time-wheelTime:16);wheelTime=time;const y=scrollY;if(Math.abs(wheelTarget-y)<4){window.scrollTo({top:wheelTarget,behavior:'instant'});stopWheel();return;}const next=y+(wheelTarget-y)*(1-Math.exp(-dt/105));window.scrollTo({top:next,behavior:'instant'});wheelFrame=requestAnimationFrame(easeWheel);}
  window.addEventListener('wheel',event=>{if(!canAnimate()||event.ctrlKey||event.shiftKey||document.querySelector('dialog[open]')||event.target.closest?.('.journal-strip')||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;const amount=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);if(Math.abs(amount)<35){stopWheel();return;}event.preventDefault();manualSelection=null;const max=document.documentElement.scrollHeight-innerHeight;wheelTarget=Math.max(0,Math.min(max,(wheelFrame?wheelTarget:scrollY)+amount));root.classList.add('wheel-smoothing');if(!wheelFrame)wheelFrame=requestAnimationFrame(easeWheel);},{passive:false});
  ['touchstart','pointerdown','keydown'].forEach(event=>window.addEventListener(event,stopWheel,{passive:true}));
  function anchorTop(node){const panel=panelGeometry.find(g=>g.el===node);return Math.max(0,(panel?panel.top:node===document.body?0:documentTop(node))-25);}
  function alignToHash(){if(!location.hash)return;const node=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(node){stopWheel();manualSelection=null;window.scrollTo({top:anchorTop(node),behavior:'instant'});requestScrollFrame();}}
  qa('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{const hash=link.getAttribute('href'),node=document.getElementById(hash.slice(1));if(!node)return;event.preventDefault();stopWheel();manualSelection=null;history.replaceState(null,'',hash);window.scrollTo({top:anchorTop(node),behavior:canAnimate()?'smooth':'instant'});requestScrollFrame();}));
  window.addEventListener('hashchange',alignToHash);
  document.fonts.ready.then(()=>requestAnimationFrame(alignToHash));
  function refreshMotion(){if(!canAnimate()){cardAnimation?.cancel();stopWheel();}refreshGeometry();}
  q('.motion-toggle').addEventListener('click',e=>{paused=!paused;root.classList.toggle('motion-paused',paused);e.currentTarget.setAttribute('aria-pressed',String(paused));e.currentTarget.textContent=paused?'動きを再開する':'動きを止める';refreshMotion();});
  reduced.addEventListener('change',refreshMotion);
})();
