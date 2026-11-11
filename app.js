const map = L.map('map',{worldCopyJump:true,zoomControl:false}).setView([25,10],2);
L.control.zoom({position:'bottomright'}).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap'}).addTo(map);
const warningLayer=L.layerGroup().addTo(map), windLayer=L.layerGroup(), capeLayer=L.layerGroup();
let alerts=[], selectedLayer='all', lastWeather=null;
const $=id=>document.getElementById(id);
const fmtTime=s=>s?new Date(s).toLocaleString():'Time unavailable';
function setSelection(title,detail){$('selection').innerHTML=`<div class="selection-title">${escapeHtml(title)}</div><div class="selection-meta">${escapeHtml(detail)}</div>`}
function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function colorFor(event){if(/tornado/i.test(event))return '#ff4d5d';if(/severe thunderstorm/i.test(event))return '#ff9d42';return '#f2d35c'}
function renderAlerts(){
 warningLayer.clearLayers();
 const list=$('alertList');$('alertLabel').textContent=alerts.length;
 $('alertCount').textContent=alerts.length;$('allCount').textContent=alerts.length;
 const tornado=alerts.filter(a=>/tornado warning/i.test(a.properties.event||''));
 $('metricAlerts').textContent=alerts.length;$('metricTornado').textContent=tornado.length;
 if(!alerts.length){list.innerHTML='<div class="empty">No active US alerts returned by the NWS feed.</div>';return}
 list.innerHTML=alerts.slice(0,30).map((a,i)=>{const p=a.properties;const tor=/tornado warning/i.test(p.event||'');return `<div class="alert-card ${tor?'tornado':''}" data-index="${i}"><strong>${escapeHtml(p.event||'Weather alert')}</strong><small>${escapeHtml(p.areaDesc||'Area unavailable')}</small><small>Expires: ${fmtTime(p.ends||p.expires)}</small></div>`}).join('');
 list.querySelectorAll('.alert-card').forEach(el=>el.addEventListener('click',()=>focusAlert(Number(el.dataset.index))));
 alerts.forEach((a,i)=>{const p=a.properties||{};const geom=a.geometry;if(!geom)return;const layer=L.geoJSON(a,{style:{color:colorFor(p.event||''),weight:2,fillOpacity:.12,fillColor:colorFor(p.event||'')}});layer.bindPopup(`<b>${escapeHtml(p.event||'Alert')}</b><br>${escapeHtml(p.areaDesc||'')}<br>${escapeHtml(p.headline||'')}`);layer.on('click',()=>{setSelection(p.event||'Weather alert',`${p.areaDesc||''} · Expires ${fmtTime(p.ends||p.expires)}`)});layer.addTo(warningLayer)});
}
function focusAlert(i){const a=alerts[i];if(!a)return;const p=a.properties||{};if(a.geometry){const l=L.geoJSON(a);map.fitBounds(l.getBounds(),{maxZoom:7});}setSelection(p.event||'Alert',`${p.areaDesc||''} · ${p.headline||''}`)}
async function loadAlerts(){
 $('connection').textContent='FETCHING NWS ALERTS';
 try{const r=await fetch('https://api.weather.gov/alerts/active?status=actual',{headers:{Accept:'application/geo+json'}});if(!r.ok)throw new Error(`NWS ${r.status}`);const d=await r.json();alerts=d.features||[];renderAlerts();$('connection').textContent='DATA FEED ONLINE';}
 catch(e){$('connection').textContent='NWS FEED UNAVAILABLE';$('alertList').innerHTML='<div class="empty">Could not load official alerts. The feed may be temporarily unavailable.</div>';console.error(e)}
 $('updated').textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+' LOCAL';
}
async function loadWeather(lat=39.5,lon=-98.35){
 try{
  const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=cape,wind_speed_10m,wind_direction_10m&forecast_days=1`;
  const r=await fetch(url);if(!r.ok)throw new Error('Weather API error');lastWeather=await r.json();
  const c=lastWeather.current;
  setSelection('Weather conditions',`${lat.toFixed(2)}, ${lon.toFixed(2)} · ${c.temperature_2m}°C · Wind ${c.wind_speed_10m} km/h · Gusts ${c.wind_gusts_10m} km/h`);
 }catch(e){setSelection('Weather data unavailable','Try selecting another location later.')}
}
map.on('click',e=>loadWeather(e.latlng.lat,e.latlng.lng));
$('worldBtn').onclick=()=>map.setView([25,10],2);
$('locateBtn').onclick=()=>{if(!navigator.geolocation){setSelection('Location unavailable','Browser geolocation is not supported.');return}navigator.geolocation.getCurrentPosition(p=>{map.setView([p.coords.latitude,p.coords.longitude],7);loadWeather(p.coords.latitude,p.coords.longitude)},()=>setSelection('Location permission denied','You can still click anywhere on the map.'))};
$('refresh').onclick=()=>{loadAlerts();};
$('warningsToggle').onchange=e=>e.target.checked?map.addLayer(warningLayer):map.removeLayer(warningLayer);
$('windToggle').onchange=e=>{if(e.target.checked){map.addLayer(windLayer);setSelection('Wind layer','Wind data is available by selecting a location. A global wind overlay is not configured in this starter build.')}else map.removeLayer(windLayer)};
$('capeToggle').onchange=e=>{if(e.target.checked){map.addLayer(capeLayer);setSelection('Storm potential','CAPE is a measure of atmospheric instability. It is not a tornado prediction. Select a location for current weather conditions.')}else map.removeLayer(capeLayer)};
document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));b.classList.add('active');selectedLayer=b.dataset.layer;if(selectedLayer==='alerts'&&alerts.length){const a=alerts.find(x=>/tornado warning/i.test(x.properties.event||''))||alerts[0];focusAlert(alerts.indexOf(a))}else if(selectedLayer==='storms'){setSelection('Storm conditions','Use weather observations and official local alerts. Model ingredients are not confirmation of a tornado.')}else setSelection('Global overview','Showing active official US NWS alerts and worldwide basemap.')});
loadAlerts();setInterval(loadAlerts,5*60*1000);