// script.js (frontend)

// Set baseAPI to your Render URL later, e.g. https://trymygold-server.onrender.com
const baseAPI = ''; // <-- update this after you deploy the server

const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('overlay');
const ctx = canvasElement.getContext('2d');
const loader = document.getElementById('loader');
const modeContainer = document.getElementById('jewelry-mode');
const subcatButtons = document.getElementById('subcategory-buttons');
const optionsGroup = document.getElementById('jewelry-options');

let camera = null;
let currentType = '';
let currentImage = null;
let smoothedLandmarks = null;
let smoothingFactor = 0.18;
let smoothedPoints = {};

function setLoading(v){ loader.classList.toggle('hidden', !v); }

function loadImage(src){
  return new Promise(res=>{
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = ()=>res(img);
    img.onerror = ()=>res(null);
    img.src = src;
  });
}

// mapping from UI selection to Cloudinary folder prefix
const folderMap = {
  'gold_earrings': 'trymygold/gold_earrings',
  'diamond_earrings': 'trymygold/diamond_earrings',
  'gold_chains': 'trymygold/gold_chains',
  'diamond_chains': 'trymygold/diamond_chains'
};

async function fetchResources(folderKey){
  if(!baseAPI) { console.warn('baseAPI not set'); return []; }
  try{
    setLoading(true);
    const res = await fetch(`${baseAPI}/api/resources/${encodeURIComponent(folderKey)}`);
    if(!res.ok) throw new Error('Server error '+res.status);
    return await res.json();
  }catch(err){
    console.error('fetchResources error', err);
    return [];
  }finally{
    setLoading(false);
  }
}

async function insertJewelryOptions(key){
  optionsGroup.innerHTML = '';
  setLoading(true);
  const items = await fetchResources(key);
  if(!items || items.length===0){
    optionsGroup.innerHTML = '<div style="color:#fff8">No items found in this folder.</div>';
    setLoading(false);
    return;
  }
  for(const it of items){
    const btn = document.createElement('button');
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = it.src;
    img.alt = it.public_id || 'jewel';
    img.onerror = ()=>{ img.src = 'placeholder.png'; };
    btn.appendChild(img);
    btn.onclick = async ()=>{
      setLoading(true);
      const loaded = await loadImage(it.src);
      if(loaded) currentImage = loaded;
      setTimeout(()=>setLoading(false),200);
    };
    optionsGroup.appendChild(btn);
  }
  setLoading(false);
}

// Mediapipe setup + camera code (use the same logic we used previously — omitted here for brevity).
// ... (paste the Mediapipe faceMesh code from earlier sample)
