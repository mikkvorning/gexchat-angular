# Gexchat Angular Rewrite – Project Plan

_Last updated: 2026-04-07_

> **Status legend**: ✅ Done · 🔄 In progress · ⬜ Not started

This document describes the architecture and implementation plan for recreating the **gexchat** Next.js + React + MUI + Firebase app in **Angular 21+** with modern, commercially relevant patterns.

> **Version snapshot (locked 2026-03-24)**: Angular `21.2.x` · Angular Material `21.2.x` · Tailwind CSS `4.2.x` · NgRx Signals `21.0.x` · AngularFire `20.0.x` · TypeScript `5.9.x`

---

## 1. High-Level Goals

- Rebuild the gexchat app in Angular using:
  - Angular 21+ (standalone components, signals-first patterns, strict mode).
  - Angular Material + Tailwind CSS v4 hybrid (Material for accessible component primitives, Tailwind for layout and utility styling).
  - Firebase (Auth + Firestore) via AngularFire.
  - NgRx Signal Store + RxJS interop for global, predictable, signals-native state.
- Preserve core domain concepts and flows:
  - Email/password + guest auth, email verification.
  - Real-time chats, messages, invitations, unread counts, typing indicators.
  - Gemini bot chat as a special “virtual chat”.
  - User settings: profile, appearance, notifications, privacy.
- Treat existing Next.js API routes as an external backend (for auth and Gemini) in v1, but architect Angular so that a future NestJS / Firebase Functions backend can be swapped in with minimal front-end changes.

---

## 2. Tech Stack Overview

- **Framework**: Angular 21+ with standalone components, strict type/template checking, and signals-first APIs.
- **Routing**: Angular Router with route guards and (optional) resolvers.
- **UI**: Angular Material 21 (component primitives) + Tailwind CSS v4 (layout, spacing, utility classes). No separate theme config file — Tailwind v4 uses CSS-native configuration and automatic content detection.
- **State Management**: NgRx Signal Store (`signalStore`, `withState`, `withComputed`, `withMethods`) + RxJS interop via `rxMethod`. Classic Effects only where async orchestration warrants it. Store Devtools included.
- **Backend Integration**:
  - Firebase via AngularFire (`Auth`, `Firestore`).
  - HTTP APIs via Angular `HttpClient` pointing at the existing Next.js `/api` routes (or a later backend replacement).
- **Tooling**:
  - ESLint + Angular ESLint, Prettier (optional but recommended).
  - Path aliases (`@core`, `@shared`, `@features/*`).
  - Builder: `@angular/build` (esbuild-based, replaces `@angular-devkit/build-angular`).

---

## 3. Project Structure (Angular App)

Suggested folder structure for `gexchat-angular`:

- `src/`
  - `app/`
    - `core/`
      - `models/` ✅ – TS interfaces. Currently: `auth-form-config.model.ts`. Pending: `user.model.ts`, chat/message models.
      - `services/` ✅ partial – `snackbar.service.ts` done. Pending: `auth.service.ts`, `chat.service.ts`, etc.
      - `guards/` ⬜ – route guards (auth, email verification).
      - `interceptors/` ⬜ – HTTP interceptors (API error mapping).
      - `firebase/` ⬜ – AngularFire providers (next step).
    - `store/` ⬜ – flat files, not subdirectories. Will be `auth.store.ts`, `chat.store.ts`, `ui.store.ts`.
    - `features/`
      - `auth/` ✅ – `auth-card/` (config-driven card), `login/`, `register/`, `guest/`, `verify/`. Centralised `auth.configs.ts`.
      - `chat/` 🔄 – shell layout done (sidenav, sidebar, chat-main, chat-input, chat-messages stubs).
        - `chat-main/` 🔄 – layout done, logic pending.
        - `chat-input/` 🔄 – UI done, send logic pending.
    - `shared/`
      - `components/` ⬜
      - `pipes/` ⬜
      - `utils/` ✅ – `validators.ts` (rule/matches/getFieldError), `colors.ts`.
  - `environments/` ✅ – `environment.ts` and `environment.prod.ts` with Firebase config + `apiBaseUrl`.
  - `styles.scss` ✅ – Material theme, typography hierarchy, cyanide theme overrides, global layout.
  - `theme/cyanide-theme.scss` ✅ – single source of truth for all design tokens.
  - `tailwind.css` ✅ – `@theme` block mirrors all `--mat-sys-*` / `--app-*` tokens.

This structure mirrors the logical separation in the React app (auth, chat, settings, Gemini, shared utilities) but uses Angular DI and NgRx instead of React Context + React Query.

---

## 4. Environments and Configuration

### 4.1 Firebase

- Use AngularFire to initialize Firebase based on environment variables equivalent to the React app:
  - `FIREBASE_API_KEY`
  - `FIREBASE_AUTH_DOMAIN`
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_STORAGE_BUCKET`
  - `FIREBASE_MESSAGING_SENDER_ID`
  - `FIREBASE_APP_ID`

- In Angular:
  - Define these values in `environment.ts` and `environment.development.ts`.
  - Configure `provideFirebaseApp`, `provideAuth`, and `provideFirestore` in a core bootstrap file or via application-level providers.

### 4.2 API Base URLs

- Use environment config for API endpoints, e.g.:
  - `apiBaseUrl: 'https://<existing-next-host>/api'` (for auth + Gemini in v1).
- Keep this in a dedicated `AppConfig` interface so swapping to NestJS or Firebase Functions later only requires updating the environment config and possibly some URLs.

---

## 5. Theming and Global Styles

### 5.1 Angular Material Theme

- Create a dark Angular Material theme that mirrors the current MUI theme:
  - Primary/secondary: `#aaf07f` with dark text.
  - Background: dark surfaces (`#181818` / `#191919`).
  - Success: `#00ffe3`, Info: `#2196f3`.
  - Rounded components (`border-radius: 16px`).
- Use SCSS theme files to define:
  - Color palettes.
  - Typography.
  - Component-level overrides (Buttons, Inputs, AppBar equivalents, Alerts).

### 5.2 Global CSS/SCSS

- Port CSS variables and scrollbar styles from the React app’s `globals.css` into:
  - `styles.scss` for global variables (colors, spacing) and scrollbar styles.
  - Feature-level SCSS for chat message animations and layout specifics.
- Recreate animations:
  - `new-message-own` / `new-message-other` with slide-in keyframes.
  - Smooth scrolling behavior for message lists.

---

## 6. Domain Models

- ✅ `auth-form-config.model.ts` — `AuthFieldConfig`, `AuthCardConfig` for config-driven auth forms.
- ⬜ `user.model.ts` — port from React `types.ts` (next step, required for guest login):
  - `OnlineStatus = 'online' | 'offline' | 'away'`.
  - `BaseUser` with `id`, `displayName`, `username`, optional `avatarUrl`, `status`.
  - `CurrentUser` extending `BaseUser` with `createdAt`, `chats`, `blocked`, `privacy`, `notifications`, `friends`, `isGuest: boolean`.

- Chats & Messages:
  - `AcceptStatus = 'ACCEPTED' | 'PENDING' | 'REJECTED'`.
  - `Message` with `id`, `chatId`, `senderId`, `content`, `timestamp`, optional `edited`, `replyTo`, `attachments`.
  - `ChatParticipant` with `userId`, `displayName`, `unreadCount`, `acceptStatus`, optional `lastMessage`, `isTyping`.
  - `Chat` with `id`, `type: 'direct' | 'group'`, `name?`, `participants`, `createdAt`, optional `lastActivity`, `lastMessage`.
  - `ChatSummary` with `summaryId`, `type`, optional `name`, `otherParticipants`, `lastMessage?`, `unreadCount`, `updatedAt`.
  - `CreateChatRequest`, `CreateChatResponse` interfaces.

These interfaces should match Firestore shapes enforced by existing rules and documents, to simplify reuse of logic.

---

## 7. Core Services

### 7.1 AuthService ⬜

A single `AuthService` combining client Firebase auth and HTTP API calls:

- `loginAsGuest(username)` — POST `{ authType: 'guest', nickname }` to `environment.apiBaseUrl + '/auth/login'`, receives custom token, calls `signInWithCustomToken(auth, customToken)`, returns mapped `AppUser`.
- `login(email, password)` — POST `{ authType: 'login', email, password }`, establish Firebase session.
- `register(email, password)` — POST `{ authType: 'signup', email, password }`.
- `logout()` — POST `/auth/logout`, then `signOut(auth)`.
- `resendVerification()` — POST `/auth/resend-verification`.
- Uses `HttpClient` for all backend calls. Firebase client SDK (`@angular/fire/auth`) for session management only.

### 7.2 SnackbarService ✅

- ✅ `snackbar.service.ts` — semantic wrapper around `MatSnackBar` with `info`, `success`, `warning`, `error` methods and consistent defaults.

### 7.3 ChatService (Firestore + Domain Logic)

Responsibilities (adapted from the React `chatService`):

- Fetch and mutate Firestore data:
  - `getUserChats(userId)` → `ChatSummary[]`.
  - `getChat(chatId)` → `Chat | null`.
  - `getChatMessages(chatId)` → `Message[]`.
  - `createChat(request, currentUserId)` → `CreateChatResponse`.
  - `sendMessage(chatId, senderId, content, activeUserId?, activeChatId?)`.
  - `resetUnreadCount(chatIds, userId)`.
  - `updateTypingStatus(chatId, userId, isTyping)`.
  - `acceptChatInvitation(chatId, userId)`, `rejectChatInvitation(chatId, userId)`.
- Real-time Observables:
  - `watchUserChats(userId)` – listen to `users/{userId}` + `chats/{chatId}` for chat summaries.
  - `watchChat(chatId)` – live updates of chat metadata.
  - `watchMessages(chatId)` – live updates of messages ordered by timestamp.
  - `watchRecentMessages(userId)` – minimal last-message listeners to keep chat list fresh.

### 7.4 GeminiApiService & GeminiChatService

Responsibilities:

- `GeminiApiService`:
  - Call the existing `/api/gemini` endpoint (or its successor) via `HttpClient`.
  - Validate prompt payloads and map errors.

- `GeminiChatService`:
  - Maintain in-memory conversation messages with the Gemini bot.
  - Expose Observables for Gemini messages and loading state.
  - `sendMessage()` method that:
    - Adds user message.
    - Calls `GeminiApiService` and appends the response.

### 7.5 Utility Services

- Error mapping utility (port of `getErrorMessage`).
- Color utilities (e.g., avatar colors, text contrast).
- UI helpers (scrolling, focus management, etc.).

---

## 8. Routing and Guards

### 8.1 Routes ✅

Current routes in `app.routes.ts`:

- ✅ `/login` — login form.
- ✅ `/register` (alias: `/signup`) — registration form.
- ✅ `/guest` — guest login form.
- ✅ `/verify` — email verification page.
- ✅ `/` — main authenticated shell (Chat component).

### 8.2 Guards ⬜

- `AuthGuard`:
  - Checks `AuthService` / `auth` store for authentication.
  - Redirects unauthenticated users to `/login`.

- `EmailVerifiedGuard` (optional but recommended):
  - Distinguishes between verified and unverified users.
  - Behaves like the Next.js middleware logic:
    - Unauthenticated → `/login`.
    - Authenticated + unverified → `/verify`.
    - Authenticated + verified → `/`.

### 8.3 Resolvers (Optional)

- Route resolvers for:
  - Loading the current user profile before entering the main shell.
  - Optionally prefetching chat summaries for faster first paint.

---

## 9. NgRx Signal Store Design

All stores use `signalStore()` from `@ngrx/signals`. Reads are `computed()` or direct signal access. Mutations go through `withMethods()`. Async operations use `rxMethod()` for RxJS interop.

### 9.1 Auth Store ⬜

```ts
export const AuthStore = signalStore(
  { providedIn: "root" },
  withState<AuthState>({ user: null, isLoading: false, error: null }),
  withComputed(({ user }) => ({
    isAuthenticated: computed(() => !!user()),
    isGuest: computed(() => !!user()?.isGuest),
    needsVerification: computed(() => !!user() && !user()!.isGuest && !user()!.emailVerified),
  })),
  withMethods((store, authService = inject(AuthService), router = inject(Router)) => ({
    loginAsGuest: rxMethod<string>(pipe(switchMap((username) => authService.loginAsGuest(username)))),
    logout: rxMethod<void>(pipe(switchMap(() => authService.logout()))),
  })),
);
```

- Single `AuthService` handles both Firebase client and backend API.
- Navigation side-effects triggered inside `withMethods` via `inject(Router)`.

### 9.2 Chat Store

- State: `chats` entity-like map, `messages` entity map, `selectedChatId`, loading/error flags.
- `withEntities()` from `@ngrx/signals/entities` for chats and messages collections.
- `rxMethod()` to subscribe to `ChatService` Firestore Observables (watchUserChats, watchMessages).
- Subscriptions started on login, cleaned up on logout via lifecycle hooks in `withHooks()`.

### 9.3 UI Store

- State: `searchValue: string`, `selectedChatId: string | 'gemini-bot' | null`, dialog/modal flags, snackbar queue.
- Methods: `setSearchValue()`, `openSettings()`, `closeSettings()`, `showSnackbar()`, `hideSnackbar()`.
- Simple synchronous state — no `rxMethod` needed here.

---

## 10. Feature Areas

### 10.1 Auth Feature ✅ (UI) / ⬜ (logic)

- ✅ `AuthCard` — reusable, config-driven card component. Accepts `AuthCardConfig` input (signals API), dynamically builds a `FormGroup` from field configs, emits `formSubmit` output. Purely presentational — no auth service calls inside.
- ✅ `auth.configs.ts` — centralised config file exporting `LOGIN_CONFIG`, `REGISTER_CONFIG`, `GUEST_CONFIG`, `VERIFY_CONFIG`. Each config defines title, subtitle, fields (with validators), submit label, optional secondary button, optional footer link.
- ✅ Route components (`Login`, `Register`, `Guest`, `Verify`) — thin wrappers that pass config and handle `(formSubmit)` output (currently logging to console).
- ⬜ Actual auth service calls from `(formSubmit)` handlers.
- ⬜ Route guards preventing re-entry to auth routes when already logged in.

### 10.2 Shell and Layout

- Root shell component similar to the Next home page:
  - Displays loading indicator while auth is resolving.
  - Once authenticated, renders:
    - Sidebar (chat list, search, settings, account info).
    - Main content (chat view or Gemini bot view based on selection).
- Integrates global snackbar service.

### 10.3 Sidebar & Settings

- Sidebar:
  - Chat search bar bound to `ui.searchValue`.
  - Chat list showing chat summaries with unread badges and last message preview.
  - Gemini bot tile at the top.
  - Footer with current user info and settings button.

- Settings:
  - Dialog or routed pages for:
    - Profile (name, username, avatar).
    - Appearance (theme options if you expand beyond a single dark theme).
    - Notifications (enabled, sound, mute-until).
    - Privacy (status visibility, last-seen, activity visibility).

### 10.4 Chat Feature

- Chat view:
  - Header (chat name, status, participants, invitation status).
  - Message list with animations and grouping.
  - Typing indicators.
  - Input area with markdown support and send-on-Enter.

- Components reflect the React structure (Chat, ChatMessages, ChatInput, etc.) but use Angular patterns and DI.

### 10.5 Gemini Feature

- Gemini chat view:
  - Reuse chat UI components where possible.
  - Use `GeminiChatService` for messages instead of Firestore.
  - Treat `'gemini-bot'` as a special selection in `ui` or `chat` store.

### 10.6 User Search and Contact Creation

- Add-contact dialog:
  - User search via a debounced input and `UserSearchService` (Firestore + optional Fuse.js).
  - List of matched users with action to start a direct chat.
- Use `ChatService.createChat` to either find existing direct chats or create new ones.

---

## 11. Notifications and Logout

- Notifications:
  - Snackbar/toast service backed by Angular Material snackbars.
  - Show success/info/error messages using mapped error codes from the backend and Firebase.

- Logout flow:
  - NgRx effect to:
    - Call backend `/auth/logout` (if used).
    - Sign out from Firebase via `AuthService`.
    - Clear NgRx store (auth, chat, ui slices).
    - Navigate to `/login`.

---

## 12. Optional: SSR and Future Backend

- **Angular Universal (optional later)**:
  - Add SSR if desired for SEO or performance.
  - Carefully guard Firebase client calls to only run in the browser.

- **Backend evolution**:
  - Once Angular front end is solid, consider:
    - Migrating existing Next.js API routes (auth, Gemini) to NestJS or Firebase Functions.
    - Keeping the same HTTP contracts so no front-end changes are required.

---

## 13. Implementation Order

### Phase 0: Scaffold & Platform Readiness ✅

1. ✅ **Angular 21 baseline** — `@angular/core@^21.2.0`, `@angular/build@^21.2.3`, `typescript: ~5.9.2`, `zone.js: ~0.15.0`.
2. ✅ **Verify Angular baseline** — `npm run build` and `npm test` passed.
3. ✅ **Angular Material** — `@angular/material@21` with cyanide dark M3 theme.
4. ✅ **Tailwind CSS v4** — `@tailwindcss/postcss`, `tailwind.css` with token sync.
5. ✅ **NgRx Signals** — `@ngrx/signals@21` installed.
6. ✅ **AngularFire** — `@angular/fire@20` and `firebase@12` installed.
7. ✅ **Path aliases** — `@core`, `@shared`, `@features/*` in `tsconfig.json`.
8. ✅ **Clean app shell** — `<router-outlet>` only, routes defined.

### Phase 1: Auth & Core 🔄

9. ✅ **Theming** — `cyanide-theme.scss`, Tailwind token sync, `mat.typography-hierarchy()`.
10. ✅ **Auth UI** — Config-driven `AuthCard`, all four route components, centralised `auth.configs.ts`.
11. ✅ **`SnackbarService`** — semantic Material snackbar wrapper.
12. ✅ **Environment config** — Firebase keys and `apiBaseUrl` set in `environment.ts`.
13. ⬜ **Firebase providers** — `firebase.providers.ts` + wire into `app.config.ts`.
14. ⬜ **`user.model.ts`** — `BaseUser`, `CurrentUser`, `OnlineStatus`.
15. ⬜ **`AuthService`** — HTTP + Firebase client auth.
16. ⬜ **`AuthStore`** — NgRx Signal Store for auth state.
17. ⬜ **Wire Guest login** — `Guest` component calls store, navigates to `/`.
18. ⬜ **Route guards** — `AuthGuard`, `EmailVerifiedGuard`.

→ See **Section 14** for the detailed Guest Login implementation plan.

### Phase 2: Shell & Chat ⬜

19. ⬜ Implement sidebar with mocked chat list.
20. ⬜ `ChatService` + `ChatStore` — load chats, select chat, view messages.
21. ⬜ Message sending, unread counts, typing indicators.

### Phase 3: Features ⬜

22. ⬜ Gemini feature (service + UI).
23. ⬜ Settings, user search, chat creation.
24. ⬜ Animations, refined error handling, missing flows.

This plan is a living document — update it as decisions are refined or scope changes.

---

## 14. Guest Login Implementation Plan ⬜

> **Goal**: wire up the first real auth flow end-to-end. Angular → Next.js API → Firebase Admin → custom token → Firebase session → navigate to `/`.

### Stack

| Layer           | Technology                      | Notes                                            |
| --------------- | ------------------------------- | ------------------------------------------------ |
| HTTP            | `HttpClient` (Angular built-in) | POST to `environment.apiBaseUrl + '/auth/login'` |
| Firebase client | `@angular/fire/auth`            | `signInWithCustomToken(auth, token)`             |
| State           | `@ngrx/signals` Signal Store    | `AuthStore` — `user`, `isLoading`, `error`       |

### Steps

**Step 1 — Firebase providers** (`src/app/core/firebase/firebase.providers.ts`)

- Export `provideFirebaseApp(() => initializeApp(environment.firebase))`, `provideAuth(() => getAuth())`, `provideFirestore(() => getFirestore())`.

**Step 2 — Bootstrap** (`src/app/app.config.ts`)

- Add `provideHttpClient()`, `provideFirebaseApp(...)`, `provideAuth(...)`, `provideFirestore(...)`.

**Step 3 — User model** (`src/app/core/models/user.model.ts`)

- Port `OnlineStatus`, `BaseUser`, `CurrentUser` from React `types.ts`. Add `isGuest: boolean` to `CurrentUser`.

**Step 4 — AuthService** (`src/app/core/services/auth.service.ts`)

- `inject(HttpClient)` + `inject(Auth)` from `@angular/fire/auth`.
- `loginAsGuest(username: string): Observable<CurrentUser>` — POST `{ authType: 'guest', nickname: username }`, `signInWithCustomToken`, map to `CurrentUser`.
- `logout(): Observable<void>` — POST `/auth/logout`, then `signOut(auth)`.

**Step 5 — AuthStore** (`src/app/store/auth.store.ts`)

- `signalStore({ providedIn: 'root' })` with `withState({ user: null, isLoading: false, error: null })`.
- `withComputed`: `isAuthenticated`, `isGuest`, `needsVerification`.
- `withMethods`: `loginAsGuest(username)` via `rxMethod`, `logout()` via `rxMethod`.

**Step 6 — Guest component** (`src/app/features/auth/guest/guest.ts`)

- Inject `AuthStore` and `Router`.
- In `onSubmit(value)`: call `authStore.loginAsGuest(value['username'])`, on success navigate to `/`.
- Bind `[isLoading]="authStore.isLoading()"` to `<app-auth-card>`.

**Step 7 — Chat home** (`src/app/features/chat/chat.ts` or `chat.html`)

- Inject `AuthStore`, show `{{ authStore.user()?.displayName }} is now logged in` while user is set and no chat is selected.

### Verification checklist

- [ ] Entering a username on `/guest` and submitting calls the Next.js API.
- [ ] A Firebase anonymous-style user is created with the given display name.
- [ ] App navigates to `/` and shows `{username} is now logged in`.
- [ ] `AuthStore.user()` is populated with a `CurrentUser` object.
- [ ] `AuthStore.isLoading()` is `true` during the request and `false` after.
- [ ] On error, `AuthStore.error()` is set and a snackbar is shown.
