# ISTC_Major_Project

A full-stack **smart café management system** with IoT drink dispenser, AI chat assistant, and Spotify music integration. Built as a collaborative campus project.

---

## Project Overview

This system connects **three layers**: a customer-facing digital ordering interface (via QR code at each table), an admin dashboard for staff, and an ESP32-powered hardware drink dispenser. Customers can browse the menu, place orders, chat with an AI assistant, and control music — all from their table. Orders are dispatched in real-time to the drink dispenser via MQTT.

### Additional Modules

The project also includes an **exam & marks management** app (PDF-based question paper viewer with mark sheet generation) and a **custom music search** tool powered by Spotify.

---

## Tech Stack

| Layer        | Technology                                         |
|-------------|----------------------------------------------------|
| **Frontend**  | Next.js 14 (React), TypeScript, Tailwind CSS, NextUI |
| **Backend**   | Node.js, Express.js, Prisma ORM                    |
| **Database**  | MongoDB (via Prisma)                               |
| **IoT**       | ESP32 (PlatformIO), MQTT                           |
| **AI**        | OpenAI GPT-3.5 Turbo (LLM chat assistant)   |
| **Music**     | Spotify Web API                                    |
| **Auth**      | RFID card / Phone number                           |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                       │
│                                                              │
│  ┌───────────┐ ┌──────────┐ ┌───────────┐ ┌─────────────┐  │
│  │ Start/     │ │ User     │ │ Admin     │ │ MQTT /      │  │
│  │ Screensaver│ │ Table    │ │ Dashboard │ │ Marks /     │  │
│  │           │ │ (Order,  │ │ (Tables,  │ │ Music       │  │
│  │           │ │ Chat,    │ │ Users,    │ │ Dashboards  │  │
│  │           │ │ Music)   │ │ Orders)   │ │             │  │
│  └───────────┘ └────┬─────┘ └─────┬─────┘ └──────┬──────┘  │
│                     │              │               │         │
└─────────────────────┼──────────────┼───────────────┼─────────┘
                      │              │               │
                      ▼              ▼               ▼
┌──────────────────────────────────────────────────────────────┐
│                   Backend (Express.js :2500)                  │
│                                                              │
│  ┌──────────┐ ┌────────┐ ┌──────┐ ┌────────┐ ┌──────────┐ │
│  │ Items    │ │ Users  │ │ LLM  │ │ MQTT   │ │ Spotify  │ │
│  │ (Menu,   │ │ (Auth, │ │ (Chat │ │ (Drink  │ │ (Search, │ │
│  │ Cart,    │ │  RFID, │ │  Gen- │ │  Disp-  │ │  Queue,  │ │
│  │ Orders)  │ │  Cart) │ │  AI)  │ │  enser) │ │  Play)   │ │
│  └──────────┘ └────────┘ └──────┘ └────────┘ └──────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Prisma ORM → MongoDB                     │   │
│  │  Models: FoodItem, AddOn, UserCart, Order            │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────┬───────────────────────────────┘
                               │ MQTT
                               ▼
                ┌─────────────────────────────┐
                │   ESP32 Drink Dispenser      │
                │  (4 relays, 4 buttons, LED)  │
                │  Subscribes: "drinkdispenser" │
                │  Publishes: "buzzer"          │
                └─────────────────────────────┘
```

---

## Features

### Customer Ordering (`/user/[tableID]`)
- Browse menu grouped by category (with images, descriptions, add-ons)
- Add items to cart with quantity management
- Checkout with table number, mobile number, payment method
- **LLM Chat Assistant** — AI-powered conversational agent that can:
  - Suggest menu items with add-ons
  - Show cart contents and order history
  - Skip songs / add songs to Spotify queue
  - Provide dietary advice
  - Respond in a friendly, markdown-formatted tone
- **Spotify Music** — View currently playing track, skip, add to queue
- **Mobile Input** — Mobile-friendly UI for placing orders
- **Screen Saver** — Idle animation for kiosk/tablet mode
- **RFID Login** — Tap RFID card to log in and sync cart

### Admin Dashboard (`/admin`)
- **Table Status** — Real-time occupancy of 3 tables; manage active orders per table
- **Order Management** — View all orders with filtering (status, date range), update status (pending → preparing → ready → completed), cancel pending orders, change table assignment
- **User Management** — List, create, update, delete users; view user details and cart; assign RFID UIDs
- **Order Reports** — Sales reports, top items analytics
- **Payment Status** — Update payment status (pending/paid/failed)

### IoT Integration
- **ESP32 Drink Dispenser** — 4 relays for pumps/valves controlling drink dispensing
- **MQTT Control** — Remote dispense commands (`drinkdispenser` topic: "1"=Orange Juice, "2"=Mineral Water, "3"=Cola, "4"=Cappuccino); unknown items published to `itemRequest`
- **Physical Controls** — 4 button inputs for manual dispensing + queue button for auto-dispensing
- **LED Status Indicator** — Visual feedback: OK, Error, Dispensing, Timeout, In Queue
- **Environmental Sensors** — Structure for per-table temperature, humidity, light, LDR data
- **MQTT Dashboard** (`/mqttDashboard`) — Real-time view of MQTT traffic


### Custom Music (`/customMusic`)
- Search Spotify tracks and add them directly to the playback queue


---

## Project Structure

```
ISTC_Major_Project/
│
├── backend/                          # Express.js API server (port 2500)
│   ├── index.js                      # App entry: routes setup, rate limiting, CORS
│   ├── package.json
│   ├── jumbleWord.cpp                # Standalone C++ word jumble game
│   ├── prisma/
│   │   └── schema.prisma             # MongoDB models: FoodItem, AddOn, UserCart, Order
│   ├── routes/
│   │   ├── itemListRoute.js          # Menu CRUD, cart management, orders, tables, reports
│   │   ├── userRoute.js              # User CRUD, phone/RFID auth, cart sync, order history
│   │   ├── llmRoute.js               # OpenAI GPT chat with menu/cart/order context
│   │   ├── mqttData.js               # MQTT pub/sub (drink dispenser, sensor data)
│   │   └── spotifyRoutes.js          # Spotify search, queue, playback control, OAuth
│   └── customModule/
│       └── cacheManager.js           # File-based cache with TTL and update thresholds
│
├── frontend/                         # Next.js 14 React app
│   ├── APIconfig.ts                  # Backend URL configuration
│   ├── types.d.ts                    # TypeScript type definitions
│   ├── package.json
│   ├── app/
│   │   ├── layout.tsx                # Root layout (Inter font, dark theme, NextUI provider)
│   │   ├── page.tsx                  # Landing → StartPage component
│   │   ├── globals.css               # Tailwind + global styles
│   │   ├── providers.tsx             # NextUI provider wrapper
│   │   ├── clientOnly.tsx            # Client-side rendering guard
│   │   │
│   │   ├── user/[tableID]/           # Table-specific ordering pages
│   │   │   ├── page.tsx              # Renders CustomUserPage with table ID
│   │   │   ├── CheckoutPage.tsx      # Order checkout form
│   │   │   └── LlmChat.tsx           # AI chat interface
│   │   │
│   │   ├── admin/                    # Admin dashboard
│   │   │   ├── page.tsx              # Navigation hub (table status, users, orders)
│   │   │   ├── tableStatus/TablePage.tsx   # Real-time table occupancy
│   │   │   ├── users/userList.tsx          # User listing with CRUD
│   │   │   ├── users/UserDetailModal.tsx   # User details popup
│   │   │   └── orderHistory/OrderHistory.tsx # Order history view
│   │   │
│   │   ├── marks/                    # Exam & marks management
│   │   │   ├── page.tsx → MarksPage.tsx, ExamGenerator.tsx, ExamModal.tsx, SubjectResultCard.tsx
│   │   │
│   │   ├── customMusic/              # Spotify track search & queue
│   │   │   ├── page.tsx → component/SearchPage.tsx
│   │   │
│   │   ├── mqttDashboard/            # MQTT traffic monitor
│   │   │   ├── page.tsx → Dashboard.tsx, ConnectioNdET.tsx
│   │   │
│   │   └── component/               # Shared UI components
│   │       ├── MainPage/             # StartPage, Cart, Login, MobileInput, Music, Screensaver
│   │       ├── Music/MusicCard.tsx   # Now playing display
│   │       ├── CategoryBox.tsx       # Menu category display
│   │       ├── itemBox.tsx           # Individual menu item
│   │       ├── InfoCard.tsx          # Information card component
│   │       └── Loading.tsx           # Loading spinner
│   │
│   └── public/                       # Static assets
│       ├── food/                     # Menu item images (burgers, wraps, drinks, etc.)
│       ├── *.json                    # Exam subject question data
│       ├── *.pdf                     # Exam papers (2017–2024)
│       └── qr.png, scan.gif, etc.    # QR code, animations
│
├── ESP32 Code/
│   └── Drink_Dis_V0.1/               # ESP32 drink dispenser firmware (PlatformIO)
│       ├── src/main.cpp              # Wi-Fi + MQTT + relay control + LED + button handling
│       ├── platformio.ini            # Board config, dependencies (PubSubClient, WiFi)
│       └── ...                       # include/, lib/, test/
│
└── README.md
```

---

## API Endpoints

All routes are prefixed with `/api/v1/`.

### Items & Menu (`/api/v1/item`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Fetch all menu items (grouped by category, with add-ons) |
| GET | `/cart` | Get current cart contents |
| POST | `/cart` | Add item to cart |
| DELETE | `/cart/:id` | Remove item from cart by index |
| POST | `/updateCart` | Replace entire cart |
| GET | `/clearCart` | Clear cart |
| POST | `/table/checkOut` | Place order (table, mobile, payment method) |
| GET | `/orders` | List orders (filters: status, skip, take, sort) |
| PUT | `/orders/:id/status` | Update order status (pending/preparing/ready/completed) |
| PUT | `/orders/:id/table` | Reassign order to a different table |
| PUT | `/orders/:id/payment-status` | Update payment status (pending/paid/failed) |
| POST | `/orders/:id/cancel` | Cancel a pending order |
| DELETE | `/orders/:id` | Delete an order |
| GET | `/orders/tables` | Get orders grouped by table |
| GET | `/orders/reports` | Sales & top items reports (date range) |
| GET | `/tables/status` | Get status of all 3 tables |
| GET | `/tables/:num/status` | Get specific table status |
| PUT | `/tables/:num/status` | Update table status + publish MQTT buzzer |
| DELETE | `/tables/:num/status` | Clear table + delete orders |
| GET | `/tables/:num/orders` | Get orders for a specific table |
| PUT | `/tables/:num/orders/complete` | Mark all table orders as complete |
| POST | `/login` | Login via RFID UID |
| GET | `/loggedin` | Get currently logged-in user |
| DELETE | `/logout` | Logout |
| GET | `/cart/syncCart` | Sync cart with logged-in user's stored cart |

### Users (`/api/v1/user`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/mobile/:mobile` | Get or create user by phone number |
| GET | `/rfid/:id` | Lookup user by RFID UID |
| POST | `/cart/mobile/:mobile` | Save cart for a user |
| GET | `/users` | List all users |
| POST | `/users` | Create new user |
| PUT | `/users/:id` | Update user name |
| DELETE | `/users/:id` | Delete user |
| GET | `/users/:id/cart` | Get user's cart |
| PUT | `/users/:id/rfid` | Assign new RFID UID to user |
| GET | `/users/history/:mobile` | Get order history by mobile |

### LLM Chat (`/api/v1/llm`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Send message to AI assistant (with user context, menu items, song info) |
| GET | `/items` | Get simplified item list for LLM context |

### MQTT (`/api/v1/mqtt`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get recent MQTT messages (last 25) |
| GET | `/clear` | Clear MQTT message log |
| POST | `/publish` | Publish drink dispense command (maps drink name → number) |

### Spotify (`/api/v1/spotify`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/search` | Search tracks |
| GET | `/login` | Get OAuth authorize URL |
| GET | `/login1` | Redirect to OAuth login |
| GET | `/callback` | OAuth callback handler |
| GET | `/currentQueue` | Get currently playing track |
| GET | `/nextSong` | Skip to next track |
| POST | `/addToQueue` | Add track to playback queue by ID |

---

## Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** instance (local or Atlas)
- **ESP32** with PlatformIO (for IoT features)
- **MQTT Broker** (e.g., Mosquitto) running on `localhost:1883` — or configure in code
- **Spotify Premium** account (for playback control API)
- **OpenAI API key** (for LLM chat)

### Backend Setup

```bash
cd backend
npm install

# Create .env file:
#   DATABASE_URL="mongodb+srv://..."
#   OPENAI_API_KEY="sk-..."
#   SPOTIFY_TOKEN="..."
#   (Optional) SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET

node index.js
# Server starts on http://0.0.0.0:2500
```

### Frontend Setup

```bash
cd frontend
npm install

# Edit APIconfig.ts to point to your backend URL

npm run dev
# Opens at http://localhost:3000
```

### ESP32 Firmware

1. Open `ESP32 Code/Drink_Dis_V0.1/` in VS Code with PlatformIO extension.
2. Edit `src/main.cpp`:
   - Set Wi-Fi credentials (`SSID`, `PASSWORD`)
   - Set MQTT broker address (`client.setServer(...)`)
3. Build & upload:
   ```bash
   pio run --target upload
   ```
4. Connect hardware: 4 relays on pins 25, 33, 32, 18; 4 buttons on 35, 27, 14, 15; LED on pin 23; queue button on pin 22.

---

## Database Schema (MongoDB via Prisma)

```
FoodItem { id, name, misc?, description?, className?, price, category, available, imageUrl?, addOns[] }
AddOn    { id, name, url, price, foodItemId? }
UserCart { id, phoneNumber (unique), name?, rfidUID? (unique), cart[] (JSON), createdAt }
Order    { id, tableNumber, order (JSON), date, estimatedTime, status, currentStatus, paymentStatus, paymentMethod, completed, rating?, mobileNumber?, createdAt }
```

---

## Notes

- The admin dashboard is at `/admin` — links to table status, user management, order history
- Each table gets a unique QR code pointing to `/user/{tableID}`
- The MQTT dashboard at `/mqttDashboard` shows real-time MQTT traffic
- The marks/exam module loads PDFs and subject JSON data from `/public/`
- `jumbleWord.cpp` is a standalone game not integrated into the web app — compile with `g++ jumbleWord.cpp -o jumbleWord && ./jumbleWord`