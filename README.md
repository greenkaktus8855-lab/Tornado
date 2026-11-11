# TORNADO — Global Severe Weather Monitor

A dark, responsive weather-monitoring dashboard with a world map, official US National Weather Service alerts, and point weather lookups from Open-Meteo.

## Important data limitations

- The included official alert feed is the US National Weather Service (`api.weather.gov`). It does **not** provide worldwide official tornado warnings.
- Open-Meteo provides weather conditions, not confirmed tornado reports or a global tornado-warning feed.
- A severe thunderstorm, high CAPE, or strong wind is not proof that a tornado exists.
- This project must not be used as an emergency-warning service. Always follow local meteorological and emergency-management authorities.

## Run locally

Open `index.html` in a browser, or serve this folder with any static web server.

## Deploy

This is a static site and can be hosted with Cloudflare Pages or another static host. Upload the repository and set the build output directory to `/` (no build command required).

For `tornado.mopcblox.online`, add the domain in Cloudflare Pages after deployment and follow the DNS instructions shown by Cloudflare.

## Current features

- Interactive world map (Leaflet + OpenStreetMap)
- Active official US NWS alert polygons
- Separate tornado-warning count
- Alert list with map zoom and details
- Click-anywhere weather lookup using Open-Meteo
- Responsive dark dashboard
- Five-minute automatic alert refresh

## Planned next steps

1. Add trusted official alert feeds by country/region where available.
2. Add a proper wind/radar overlay with provider attribution and terms compliance.
3. Add verified tornado report sources and clearly distinguish reports from warnings.
4. Add backend caching/proxying and health checks for production.
5. Add alert history and configurable region filters.