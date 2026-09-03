// app.js — fetch & parse M3U playlist, render UI
const RAW_PL = 'https://raw.githubusercontent.com/RYANTVv3/Bmtvniryan/main/Bmtvniryan';

const el = (id)=>document.getElementById(id);
const channelsEl = el('channels');
const searchEl = el('search');
const groupFilterEl = el('groupFilter');
const reloadBtn = el('reload');
const videoEl = el('video');
const nowTitleEl = el('now-title');
const openExternal = el('open-external');
const downloadPl = el('download-pl');
const plUrlEl = el('pl-url');

let channels = [];
let groups = [];

function parseExtinf(line){
  // Example: #EXTINF:-1 tvg-id="" tvg-name="" tvg-logo="..." group-title="Group", Display Name
  const attrPart = line.split(',')[0];
  const title = line.split(',').slice(1).join(',').trim() || '';
  const attrs = {};
  const re = /(\w+?)="([^"]*)"/g;
  let m;
  while((m=re.exec(attrPart)) !== null){
    attrs[m[1]] = m[2];
  }
  return {title, attrs};
}

async function fetchPlaylist(url){
  plUrlEl.textContent = url;
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error('Network response not ok');
    const text = await res.text();
    return text;
  }catch(err){
    console.error('Failed to fetch playlist',err);
    alert('Failed to fetch playlist: '+err.message);
    return null;
  }
}

function parseM3U(text){
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(l=>l!=="");
  const out = [];
  for(let i=0;i<lines.length;i++){
    const l = lines[i];
    if(l.startsWith('#EXTINF')){
      const info = parseExtinf(l);
      // next non-empty non-comment line is URL
      let j=i+1; let url='';
      while(j<lines.length){
        if(!lines[j].startsWith('#')){ url = lines[j]; break; }
        j++;
      }
      i = j; // skip ahead
      out.push({
        title: info.title || info.attrs['tvg-name'] || 'Unknown',
        logo: info.attrs['tvg-logo'] || '',
        group: info.attrs['group-title'] || '',
        rawAttrs: info.attrs,
        url: url
      });
    }
  }
  return out;
}

function buildGroups(list){
  const set = new Set();
  list.forEach(c=> set.add(c.group||''));
  const arr = Array.from(set).filter(g=>g!=="").sort();
  groups = arr;
}

function renderChannels(list){
  channelsEl.innerHTML = '';
  if(list.length===0){ channelsEl.innerHTML='<p style="color:#9aa4b2">No channels found</p>'; return; }
  list.forEach(ch=>{
    const div = document.createElement('div'); div.className='channel';
    div.innerHTML = `
      <img src="${ch.logo||'https://via.placeholder.com/160x90?text=No+Logo'}" alt="logo" loading="lazy" />
      <div class="meta">
        <h3>${escapeHtml(ch.title)}</h3>
        <p>${escapeHtml(ch.group||'')}</p>
      </div>
    `;
    div.addEventListener('click',()=> playChannel(ch));
    channelsEl.appendChild(div);
  });
}

function escapeHtml(s){ return s.replace(/[&<>\"]+/g, (c)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]||c)); }

function playChannel(ch){
  nowTitleEl.textContent = ch.title;
  openExternal.href = ch.url;
  openExternal.textContent = 'Open in new tab';
  // set video source
  videoEl.pause();
  videoEl.src = ch.url;
  videoEl.load();
  // try to autoplay
  videoEl.play().catch(()=>{});
}

function applyFilters(){
  const q = searchEl.value.trim().toLowerCase();
  const g = groupFilterEl.value;
  let list = channels.slice();
  if(g) list = list.filter(c=>c.group===g);
  if(q) list = list.filter(c=> (c.title||'').toLowerCase().includes(q) || (c.group||'').toLowerCase().includes(q));
  renderChannels(list);
}

reloadBtn.addEventListener('click', init);
searchEl.addEventListener('input', applyFilters);
groupFilterEl.addEventListener('change', applyFilters);

downloadPl.addEventListener('click',(e)=>{
  e.preventDefault();
  // download current playlist as text
  const blob = new Blob([channels.map(c=>`#EXTINF:-1,${c.title}\n${c.url}`).join('\n')],{type:'text/plain'});
  const url = URL.createObjectURL(blob);
  downloadPl.href = url;
  downloadPl.download = 'bmtvniryan_extract.m3u';
  setTimeout(()=> URL.revokeObjectURL(url), 5000);
});

async function init(){
  const text = await fetchPlaylist(RAW_PL);
  if(!text) return;
  channels = parseM3U(text);
  buildGroups(channels);
  // populate group filter
  groupFilterEl.innerHTML = '<option value="">All groups</option>' + groups.map(g=>`<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join('');
  renderChannels(channels);
}

// start
plUrlEl.textContent = RAW_PL;
init();
