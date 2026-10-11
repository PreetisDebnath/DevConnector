# Project Maintenance Log

## Project Information
- **Project Name:** DevConnector (MERN Stack Social Network for Developers)
- **Author/Owner:** Preetis Debnath
- **Repository Root:** `d:\NetworkingApp`
- **Initial Baseline Tag:** `pre-maintenance-backup` (created before modifications)

---

## Change Records

### Change ID: CHG-001
- **Date:** 2026-10-11
- **File Path:** [routes/api/users.js](file:///d:/NetworkingApp/routes/api/users.js#L59)
- **Function / Configuration Location:** `router.post('/')` user registration handler, line 59
- **Original Implementation:**
  ```javascript
  const salt = await bcrypt.genSaltSync(10);
  ```
- **Problem Identified:** `bcrypt.genSaltSync` is a synchronous blocking function improperly awaited with `await`. While it returned a string synchronously, mixing sync with async await is an anti-pattern that can trigger unexpected Promise/callback behavior in certain environments and blocks the Node event loop during salt generation.
- **Exact Modification:**
  ```javascript
  const salt = await bcrypt.genSalt(10);
  ```
- **Reason for Change:** Use proper asynchronous `bcrypt.genSalt` matching the `async/await` paradigm across the registration route and preventing event-loop freezing.
- **Previous & Replacement Dependency Versions:** `bcryptjs`: `^3.0.3` (unchanged).
- **Tests Performed:** Registration flow inspection, static type check, and server syntax execution.
- **Test Results:** Server compiles and starts cleanly without warnings; password hashing operates asynchronously.
- **Remaining Limitations:** None.

---

### Change ID: CHG-002
- **Date:** 2026-10-11
- **File Path:** [routes/api/profile.js](file:///d:/NetworkingApp/routes/api/profile.js#L151)
- **Function / Configuration Location:** `router.get('/user/:user_id')` error handling catch block, line 151
- **Original Implementation:**
  ```javascript
  if (err.kind == 'ObjectId') {
    return res.status(400).json({ msg: 'Profile not found' });
  }
  ```
- **Problem Identified:** In Mongoose v7/v8/v9, the legacy `err.kind` property on BSON casting errors is deprecated/removed in favor of `err.name === 'CastError'`. Querying with an invalid or malformed ObjectId string previously resulted in a 500 'Server Error' instead of returning the expected 400 Bad Request with `{ msg: 'Profile not found' }`.
- **Exact Modification:**
  ```javascript
  if (err.name === 'CastError') {
    return res.status(400).json({ msg: 'Profile not found' });
  }
  ```
- **Reason for Change:** Restores correct Mongoose v9 error identification for CastError when invalid MongoDB ObjectIds are provided in route parameters.
- **Previous & Replacement Dependency Versions:** `mongoose`: `^9.9.4` (unchanged).
- **Tests Performed:** Checked endpoint behavior against invalid object IDs and verified server error handling.
- **Test Results:** Passed.
- **Remaining Limitations:** None.

---

### Change ID: CHG-003
- **Date:** 2026-10-11
- **File Path:** [client/public/index.html](file:///d:/NetworkingApp/client/public/index.html#L27-L34)
- **Function / Configuration Location:** HTML `<head>` section, lines 27–34
- **Original Implementation:**
  ```html
  <title>React App</title>
  ```
- **Problem Identified:**
  1. The page title was the generic default `"React App"` instead of the project name `"DevConnector"`.
  2. All frontend components heavily depend on Font Awesome icon classes (e.g. `<i className="fas fa-user" />`, `<i className="fas fa-code" />`, `<i className="fas fa-sign-out-alt" />`, Twitter/Facebook/LinkedIn icons), but no Font Awesome CSS link or bundle was imported anywhere in `index.html` or `App.css`. Consequently, all icons rendered as invisible or broken glyphs.
- **Exact Modification:**
  ```html
  <link
    rel="stylesheet"
    href="https://use.fontawesome.com/releases/v5.15.4/css/all.css"
    integrity="sha384-DyZ88mC6Up2uqS4h/KRgHuoeGwBcD4Ng9SiP4dIRy0EXTlnuz47vAwmeGwVChigm"
    crossorigin="anonymous"
  />
  <title>DevConnector</title>
  ```
- **Reason for Change:** Restores visual rendering of navigation icons, action icons, social links, and correct application branding without modifying styling rules or component JSX.
- **Previous & Replacement Dependency Versions:** None (CDN asset).
- **Tests Performed:** Inspected client bundle and HTML response from development server.
- **Test Results:** Passed. Font Awesome styles link correctly embedded into the document head.
- **Remaining Limitations:** Requires internet access to download Font Awesome CDN assets in browser.

---

### Change ID: CHG-004
- **Date:** 2026-10-11
- **File Path:** [server.js](file:///d:/NetworkingApp/server.js#L2-L32)
- **Function / Configuration Location:** Server entry point static asset routing & `path` import
- **Original Implementation:**
  ```javascript
  const express = require('express');
  const connectDB = require('./config/db');
  ...
  app.get('/', (req, res) => res.send('API Running!'));
  ```
- **Problem Identified:** For deployment on Heroku (or any production host), Express must serve the built React frontend static files from `client/build` and route any non-API client routes to `client/build/index.html`. Without this, deploying to Heroku serves only the raw backend API string `"API Running!"` at `/`, and direct routes like `/dashboard`, `/profiles`, or `/login` return 404 Not Found.
- **Exact Modification:**
  ```javascript
  const express = require('express');
  const path = require('path');
  const connectDB = require('./config/db');
  ...
  // Serve static assets in production
  if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
  } else {
    app.get('/', (req, res) => res.send('API Running!'));
  }
  ```
- **Reason for Change:** Enables single-dyno full-stack Heroku deployment while preserving standard dev behavior when `NODE_ENV !== 'production'`.
- **Previous & Replacement Dependency Versions:** Node built-in `path`.
- **Tests Performed:** Tested dev server response at `/` (returns `"API Running!"`) and verified that `client/build` is created and resolvable.
- **Test Results:** Passed.
- **Remaining Limitations:** Requires `npm run build` inside `client/` before running in production mode.

---

### Change ID: CHG-005
- **Date:** 2026-10-11
- **File Path:** [package.json](file:///d:/NetworkingApp/package.json#L14)
- **Function / Configuration Location:** Root `scripts` section
- **Original Implementation:**
  ```json
  "scripts": {
    "start": "node server",
    "server": "nodemon server",
    "client": "npm start --prefix client",
    "dev": "concurrently \"npm run server\" \"npm run client\""
  }
  ```
- **Problem Identified:** Heroku automatically runs `heroku-postbuild` after installing root dependencies. Without this script, the React client dependencies are never installed in Heroku dynos, and `npm run build` is never run, causing the production deployment to crash or serve missing files.
- **Exact Modification:**
  ```json
  "scripts": {
    "start": "node server",
    "server": "nodemon server",
    "client": "npm start --prefix client",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "heroku-postbuild": "NPM_CONFIG_PRODUCTION=false npm install --prefix client && npm run build --prefix client"
  }
  ```
- **Reason for Change:** Provides standard MERN Heroku build automation hook ensuring `client` dependencies (including `devDependencies` required by `react-scripts`) are installed and compiled into `client/build`.
- **Previous & Replacement Dependency Versions:** None.
- **Tests Performed:** Ran `npm run build` in `client` directory to verify build script compatibility.
- **Test Results:** Client successfully builds into `client/build`.
- **Remaining Limitations:** None.

---

### Change ID: CHG-006
- **Date:** 2026-10-11
- **File Path:** [client/src/store.js](file:///d:/NetworkingApp/client/src/store.js#L6-L10)
- **Function / Configuration Location:** `configureStore` invocation, lines 6–10
- **Original Implementation:**
  ```javascript
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState
  });
  ```
- **Problem Identified:** User reported that the Redux DevTools browser extension appeared not to work correctly. In `@reduxjs/toolkit` v2+, `configureStore` enables DevTools by default in non-production environments, but explicit declaration `devTools: process.env.NODE_ENV !== 'production'` ensures deterministic behavior across bundlers and development server environments without requiring legacy `composeWithDevTools` or classic Redux migrations.
- **Exact Modification:**
  ```javascript
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
    devTools: process.env.NODE_ENV !== 'production'
  });
  ```
- **Reason for Change:** Explicitly guarantees Redux DevTools extension integration during development while disabling extension hooks cleanly in production builds for performance and security.
- **Previous & Replacement Dependency Versions:** `@reduxjs/toolkit`: `^2.13.0`, `react-redux`: `^9.3.0` (both retained).
- **Tests Performed:** Compiled client bundle and tested store dispatching and dev server loading.
- **Test Results:** Store compiles cleanly with zero Redux middleware or reducer errors.
- **Remaining Limitations:** DevTools browser extension must be installed in user's browser (Chrome/Firefox/Edge).

---

### Change ID: CHG-007
- **Date:** 2026-10-11
- **File Path:** [client/package.json](file:///d:/NetworkingApp/client/package.json#L46)
- **Function / Configuration Location:** `proxy` configuration field
- **Original Implementation:**
  ```json
  "proxy": "http://localhost:5000"
  ```
- **Problem Identified:** In Node.js 18+ and especially Node.js 24 on Windows, `localhost` resolves to IPv6 `::1` first by default (`dns.setDefaultResultOrder('verbatim')`). When the backend server listens on IPv4 loopback (`127.0.0.1:5000`) or dual-stack without IPv6 binding, Create React App Webpack Dev Server's `http-proxy-middleware` fails with `ECONNREFUSED` or returns 404 for proxied API requests made by the frontend.
- **Exact Modification:**
  ```json
  "proxy": "http://127.0.0.1:5000"
  ```
- **Reason for Change:** Guarantees deterministic IPv4 loopback resolution across all modern Node.js versions on Windows, ensuring all React frontend requests to `/api/*` seamlessly forward to the Express backend.
- **Previous & Replacement Dependency Versions:** None.
- **Tests Performed:** Sent HTTP requests with `Accept: application/json` to `http://localhost:3000/api/profile` and `http://localhost:3000/api/auth`.
- **Test Results:** Verified HTTP 200 OK proxy response returning live profile records from MongoDB, and HTTP 400 Bad Request JSON response from auth endpoint (`Invalid Credentials!`).
- **Remaining Limitations:** Only applies during local development with `react-scripts start`. In production, Express serves both API and static assets from the same origin, rendering the proxy setting inert.

---

## Concise Summary of Modified Files

1. [routes/api/users.js](file:///d:/NetworkingApp/routes/api/users.js) — Changed synchronous `bcrypt.genSaltSync` to asynchronous `await bcrypt.genSalt(10)`.
2. [routes/api/profile.js](file:///d:/NetworkingApp/routes/api/profile.js) — Replaced deprecated `err.kind == 'ObjectId'` with `err.name === 'CastError'` for Mongoose 9+ compatibility.
3. [client/public/index.html](file:///d:/NetworkingApp/client/public/index.html) — Added Font Awesome 5 CDN stylesheet link and set page title to "DevConnector".
4. [server.js](file:///d:/NetworkingApp/server.js) — Imported `path` and added production static file serving for `client/build` to enable Heroku deployment.
5. [package.json](file:///d:/NetworkingApp/package.json) — Added `"heroku-postbuild"` script to automate client dependency installation and build during Heroku deployment.
6. [client/src/store.js](file:///d:/NetworkingApp/client/src/store.js) — Added explicit `devTools: process.env.NODE_ENV !== 'production'` configuration.
7. [client/package.json](file:///d:/NetworkingApp/client/package.json) — Updated proxy target from `http://localhost:5000` to `http://127.0.0.1:5000` for reliable proxying on Node 18+/24 on Windows.
8. [client/build/](file:///d:/NetworkingApp/client/build/) — Recompiled production build artifacts.

---

## Dependencies Inspection & Changes
- **Root `package.json` Dependencies:**
  - `bcryptjs`: `^3.0.3` (retained)
  - `config`: `^5.0.1` (retained)
  - `dotenv`: `^17.4.2` (retained)
  - `express`: `^5.2.1` (retained)
  - `express-validator`: `^7.3.2` (retained)
  - `gravatar`: `^1.8.2` (retained)
  - `jsonwebtoken`: `^9.0.3` (retained)
  - `mongoose`: `^9.9.4` (retained)
  - `request`: `^2.88.2` (retained)
  - `concurrently`: `^10.0.5` (retained)
  - `nodemon`: `^3.1.14` (retained)
- **Client `package.json` Dependencies:**
  - `@reduxjs/toolkit`: `^2.13.0` (retained)
  - `react`: `^18.3.1` (retained)
  - `react-dom`: `^18.3.1` (retained)
  - `react-redux`: `^9.3.0` (retained)
  - `react-router-dom`: `^5.3.4` (retained)
  - `react-scripts`: `5.0.1` (retained)
  - `redux`: `^5.0.1` (retained)
  - `axios`: `^1.20.0` (retained)
  - `moment`: `^2.31.0` (retained)
  - `react-moment`: `^2.0.2` (retained)
- **Outcome:** Zero unnecessary package upgrades or destructive replacements were performed. All repairs were achieved through targeted code and configuration corrections.

---

### Change ID: CHG-008
- **Date:** 2026-10-11
- **File Path:** [server.js](file:///d:/NetworkingApp/server.js#L27)
- **Function / Configuration Location:** Express static fallback route for production, line 27
- **Original Implementation:**
  ```javascript
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
  ```
- **Problem Identified:** In Express 5 (`express@^5.2.1`), the underlying router uses `path-to-regexp` v8+. Plain wildcard routes written as `app.get('*', ...)` throw a fatal TypeError at startup: `TypeError: Missing parameter name at index 1: *; visit https://git.new/pathToRegexpError for info`. This caused production-mode startup to crash immediately upon initialization.
- **Exact Modification:**
  ```javascript
  app.get('{*splat}', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
  ```
- **Reason for Change:** Adheres to Express 5 / `path-to-regexp` v8 syntax for catch-all wildcards (`{*splat}`), allowing client-side React routes to resolve properly to `index.html` on direct browser visits or page refreshes without crashing the server.
- **Previous & Replacement Dependency Versions:** `express`: `^5.2.1` (retained).
- **Tests Performed:**
  1. Tested production mode startup locally with `$env:NODE_ENV="production"; $env:PORT="5001"; node server.js`.
  2. Verified root `/` returns 200 OK with HTML document and title `<title>DevConnector</title>`.
  3. Verified direct refresh of nested client routes (`/profiles` and `/dashboard`) returns 200 OK with `index.html`.
  4. Verified API endpoints (`/api/profile`) still return JSON arrays directly rather than falling back to HTML.
  5. Verified static asset serving returns 200 OK for compiled chunks (e.g. `/static/js/main.d61df680.js`).
  6. Verified production app renders completely via Chrome headless browser DOM inspection.
- **Test Results:** All tests passed. Express 5 production server operates stably.
- **Remaining Limitations:** None.

---

### Change ID: CHG-009
- **Date:** 2026-10-11
- **File Paths:**
  - [models/User.js](file:///d:/NetworkingApp/models/User.js#L25)
  - [models/Profile.js](file:///d:/NetworkingApp/models/Profile.js#L112)
  - [models/Post.js](file:///d:/NetworkingApp/models/Post.js#L55)
- **Function / Configuration Location:** Model exports (`module.exports = Model = mongoose.model(...)`)
- **Original Implementation:**
  ```javascript
  // e.g. models/User.js:
  module.exports = User = mongoose.model('user', UserSchema);
  ```
- **Problem Identified:** In JavaScript strict mode or Node environments without global declarations, assigning `User = ...` without a `let`/`var`/`const` declaration throws `TypeError: Assignment to constant variable` or ReferenceError during isolated module execution.
- **Exact Modification:**
  ```javascript
  module.exports = mongoose.model('user', UserSchema);
  ```
- **Reason for Change:** Clean exports without global variable side effects or strict-mode assignment exceptions.
- **Previous & Replacement Dependency Versions:** `mongoose`: `^9.9.4` (retained).
- **Tests Performed:** Loaded models independently and through route handlers. Verified models register under names `user`, `profile`, and `post`.
- **Test Results:** Passed.
- **Remaining Limitations:** None.

---

### Change ID: CHG-010
- **Date:** 2026-10-11
- **File Path:** [models/Post.js](file:///d:/NetworkingApp/models/Post.js#L7-L32)
- **Function / Configuration Location:** `PostSchema` ref fields for `user` on root, likes, and comments
- **Original Implementation:**
  ```javascript
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  }
  ```
- **Problem Identified:** The User model is registered with Mongoose as `'user'` (`mongoose.model('user', UserSchema)`), whereas `PostSchema` defined `ref: 'users'`. When Mongoose attempted to `.populate('user')`, it threw `MissingSchemaError: Schema hasn't been registered for model "users"`.
- **Exact Modification:**
  ```javascript
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  }
  ```
- **Reason for Change:** Aligns model ref identifier `'user'` across `PostSchema` (root user, likes.user, comments.user) and `ProfileSchema`, preventing populate crashes on Mongoose 9+.
- **Previous & Replacement Dependency Versions:** `mongoose`: `^9.9.4` (retained).
- **Tests Performed:** Queried posts with `.populate('user', 'name')`. Verified 2 existing posts retrieved with author information intact.
- **Test Results:** Passed without MissingSchemaError.
- **Remaining Limitations:** None.

---

## Functional Verification Records (In-Browser & Live API)

- **Date:** 2026-10-11
- **Testing Methodology:** Executed live browser testing via Chrome using native Chrome DevTools Protocol (CDP) WebSocket connected directly to `http://localhost:3000`.
- **Findings & Verifications:**
  1. **Rendered UI & Navigation:**
     - Landing page loads with navigation bar (`DevConnector`), main heading (`Developer Connector`), description, `Sign Up`, and `Login` action buttons.
     - Navigating to `/profiles` fetches 3 existing profiles from the database and renders 3 `.profile` cards in the DOM (top profile: "Preetis Debnath").
     - Navigating to `/login` renders clean Sign In form with email input, password input, and submit button.
  2. **Authentication & Form Submission:**
     - Submitting the login form with invalid credentials triggers API error response and Redux `SET_ALERT` dispatch, rendering `<div class="alert alert-danger">Invalid Credentials!</div>` in the DOM.
  3. **Redux DevTools & State Changes:**
     - Verified Redux store integration with DevTools protocol: connection initiated, received initial state, dispatched `SET_ALERT` (action inspected), state updated with alert record, dispatched `REMOVE_ALERT` (action inspected), and state verified cleared.
  4. **Authenticated Features (Dashboard, Posts, Comments):**
     - Dashboard loaded for user `Preetis Debnath`, verified welcome banner `Welcome Preetis Debnath`.
     - Posts route `/posts` loaded and rendered 2 existing community posts in DOM (`This is a test user's post!` and `This is my first POST!`).
     - Added test comment to post via authenticated API (`POST /api/posts/comment/:id`), verified addition, then deleted test comment (`DELETE /api/posts/comment/:id/:comment_id`) to maintain database purity.
  5. **Logout:**
     - Dispatched logout in browser, verified token removed from `localStorage`, auth state reset (`isAuthenticated: false`, `token: null`), and profile cleared.
  6. **Console Inspection:**
     - Zero critical runtime exceptions. Only 1 standard React 18 informational note regarding function component `defaultProps` in legacy component library.
  7. **Production Build Validation:**
     - `npm run build` executed and verified producing clean 117.32 kB production bundle in `client/build`.