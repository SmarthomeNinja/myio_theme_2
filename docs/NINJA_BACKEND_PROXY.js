/**
 * Ninja AI Chatbot - Backend Proxy
 * 
 * Ez a fájl egy example szerver implementáció az Anthropic API secure kezeléséhez.
 * Az API kulcs backend-en tárolódik, frontend-en nem!
 * 
 * Implementálható: Node.js/Express, Python/Flask, PHP, stb.
 */

// ============================================
// NODE.JS / EXPRESS IMPLEMENTÁCIÓ (JAVASOLT)
// ============================================

const express = require('express');
const axios = require('axios');
const app = express();

// Biztonsági headrek
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

app.use(helmet());
app.use(express.json());

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 perc
  max: 30, // max 30 kérés
  message: 'Túl sok kérés, kérlek próbálj később.'
});

// Authentikáció middleware (javasolt)
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentikáció szükséges' });
  }
  
  // JWT vagy session ellenőrzés
  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Érvénytelen token' });
  }
};

// Chat endpoint
app.post('/api/chat', apiLimiter, authenticateUser, async (req, res) => {
  const { message, history } = req.body;

  // Input validáció
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Érvénytelen üzenet' });
  }

  if (message.length > 5000) {
    return res.status(400).json({ error: 'Üzenet túl hosszú (max 5000 char)' });
  }

  if (!Array.isArray(history) || history.length > 50) {
    return res.status(400).json({ error: 'Érvénytelen előzmények' });
  }

  try {
    // Anthropic API hívás
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: `You are Ninja, a helpful AI assistant integrated into a smart home dashboard (MyIO). 
You have expertise in smart home automation, energy monitoring, and device management.
Keep responses concise and friendly. Always be respectful and try to understand the user's smart home context.`,
        messages: [
          ...history,
          { role: 'user', content: message }
        ]
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    // Válasz feldolgozása
    const aiResponse = response.data.content[0].text;

    // Audit loggolás (opcionális)
    console.log(`[CHAT] User: ${req.user?.id || 'unknown'} | Msg length: ${message.length}`);

    // Válasz küldése a frontend-nek
    res.json({ response: aiResponse });

  } catch (error) {
    console.error('Anthropic API Error:', error.response?.data || error.message);

    // User-friendly hiba válasz
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'API kulcs hiba - lépj kapcsolatba az admin-nal' });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Túl sok API kérés - próbálj később' });
    }

    res.status(500).json({ error: 'Szerver hiba történt' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ninja-chatbot-proxy' });
});

// Szerver indítása
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ninja Chatbot Proxy fut: http://localhost:${PORT}`);
});

// ============================================
// PYTHON / FLASK IMPLEMENTÁCIÓ
// ============================================

/*
from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import requests
import os
import jwt

app = Flask(__name__)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

def authenticate_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').split(' ')[-1]
        if not token:
            return jsonify({'error': 'Authentikáció szükséges'}), 401
        try:
            # JWT ellenőrzés
            # data = jwt.decode(token, os.environ['JWT_SECRET'], algorithms=['HS256'])
            # request.user_id = data['user_id']
            pass
        except:
            return jsonify({'error': 'Érvénytelen token'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/api/chat', methods=['POST'])
@limiter.limit("30 per 15 minute")
@authenticate_token
def chat():
    data = request.get_json()
    message = data.get('message', '').strip()
    history = data.get('history', [])

    # Validáció
    if not message or len(message) > 5000:
        return jsonify({'error': 'Érvénytelen üzenet'}), 400

    if len(history) > 50:
        return jsonify({'error': 'Túl sok előzmény'}), 400

    try:
        response = requests.post(
            'https://api.anthropic.com/v1/messages',
            json={
                'model': 'claude-3-5-sonnet-20241022',
                'max_tokens': 1024,
                'system': 'You are Ninja, a smart home AI assistant...',
                'messages': history + [{'role': 'user', 'content': message}]
            },
            headers={
                'x-api-key': os.environ['ANTHROPIC_API_KEY'],
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            }
        )

        if response.status_code != 200:
            return jsonify({'error': 'API hiba'}), 500

        ai_response = response.json()['content'][0]['text']
        return jsonify({'response': ai_response})

    except Exception as e:
        print(f'Error: {e}')
        return jsonify({'error': 'Szerver hiba'}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'ninja-chatbot-proxy'})

if __name__ == '__main__':
    app.run(debug=False, port=5000)
*/

// ============================================
// .ENV KONFIGURÁCIÓ
// ============================================

/*
# Anthropic API
ANTHROPIC_API_KEY=sk_ant_xxxxxxxxxxxxxxxxxxxxx

# Server
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=https://myio.local

# Logging
LOG_LEVEL=info
*/

// ============================================
// DOCKER DEPLOYMENT
// ============================================

/*
# Dockerfile

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]

---

# docker-compose.yml

version: '3.8'

services:
  ninja-proxy:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
*/

// ============================================
// BIZTONSÁGI AJÁNLÁSOK
// ============================================

/*
1. API KULCS KEZELÉS
   ✓ Soha nem hardcoded
   ✓ Environment variable-ban tárold
   ✓ .env fájl git-ignore-ban

2. HITELESÍTÉS
   ✓ JWT vagy OAuth2 használj
   ✓ Szinkronizáld az MyIO felhasználói rendszerrel
   ✓ Session timeout (15-30 perc)

3. RATE LIMITING
   ✓ Kérések korlátozása per user/IP
   ✓ DDoS védelem
   ✓ Exponential backoff a retry-nél

4. INPUT VALIDATION
   ✓ Üzenet hossz limit (5000 char)
   ✓ Előzmények limitálása (50 üzenet max)
   ✓ SQL injection védelem (ha DB-t használsz)

5. NAPLÓZÁS & MONITORING
   ✓ Audit log az összes chatbot interakcióról
   ✓ Error logging
   ✓ Performance monitoring
   ✓ API usage tracking

6. HTTPS/TLS
   ✓ Production-ban TLS 1.2+
   ✓ Certificate pinning lehetséges

7. CORS BEÁLLÍTÁS
   ✓ Csak saját domain-ből engedj kéréseket
   ✓ Credentials szükséges (ha cookie-t használsz)
*/

// ============================================
// TESZTELÉS
// ============================================

/*
# cURL test

curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Hello Ninja!",
    "history": []
  }'

# Response

{
  "response": "Hello! I'm Ninja, your smart home AI assistant..."
}
*/

module.exports = { setupNinjaChatProxy: true };
