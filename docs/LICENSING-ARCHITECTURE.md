# Server-Side Licensing Architecture

**Status:** Planning Phase
**Platform:** Cloudflare Workers
**Target:** Anavo Tech commercial plugins

---

## Current Limitations (Client-Side)

- Easy to bypass (DevTools script blocking)
- Extra HTTP request per page load
- No real-time license updates
- No usage analytics

---

## Solution: Cloudflare Workers API

### Why Cloudflare Workers?
- **Performance:** <50ms latency globally (edge network)
- **Cost:** Free tier = 100k requests/day (3M/month)
- **Simplicity:** Single JavaScript file, no framework
- **Scalability:** Handles traffic spikes automatically

### Endpoint
```
GET https://api.anavo.tech/validate?domain=example.com&plugin=ExpandedMenu
```

### Response
```json
{
  "licensed": true,
  "plan": "pro",
  "expires": "2027-12-31",
  "features": ["unlimited-domains"]
}
```

---

## Implementation Timeline

**Week 1-2:** Basic validation API with KV storage
**Week 3-4:** Admin dashboard + analytics
**Week 5:** Full production rollout

---

## Plugin Integration

```javascript
async function validateLicense() {
  const response = await fetch(
    `https://api.anavo.tech/validate?domain=${window.location.hostname}&plugin=ExpandedMenu`,
    { cache: 'force-cache' } // 24hr cache
  );
  const data = await response.json();
  return data.licensed;
}
```

---

## Database Schema

### Cloudflare KV Key Format
`{domain}:{plugin}` → License JSON

### License Object
```json
{
  "customer_email": "user@example.com",
  "plan": "pro",
  "plugins": ["ExpandedMenu", "QuotationBuilder"],
  "issued": "2026-02-17T00:00:00Z",
  "expires": "2027-02-17T00:00:00Z",
  "max_domains": 5,
  "status": "active"
}
```

---

## Security

- Rate limiting (10 req/min per domain)
- Domain verification via HTTP referrer
- CORS whitelist for Squarespace domains
- Future: HMAC-signed requests

---

## Cost Projection

- **0-1000 customers:** $0/month (free tier)
- **1000-10000 customers:** $5/month
- **10000+ customers:** $10-20/month

---

## Development Setup

```bash
# Install Wrangler CLI
npm install -g wrangler
wrangler login

# Create worker project
wrangler init anavo-licensing
cd anavo-licensing

# Create KV namespace
wrangler kv:namespace create "LICENSES"

# Deploy
wrangler deploy

# Add custom domain (in Cloudflare Dashboard)
# Workers > anavo-licensing > Settings > Triggers
# Add: api.anavo.tech
```

---

## Migration Strategy

1. **Hybrid Phase:** Both client-side and server-side run in parallel
2. **Gradual Migration:** New versions use server-side only
3. **Full Migration:** Remove client-side licensing entirely

---

**Next Steps:**
1. Review plan with team
2. Set up Cloudflare Workers account
3. Build proof-of-concept endpoint
4. Test with expanded-menu plugin

---

**Full Technical Details:** See `CLOUDFLARE-LICENSING-PLAN.md` in local documentation folder.
