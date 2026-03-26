# Gexchat Angular Rewrite – Project Plan

_Last updated: 2026-03-24_

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
      - `models/` – TS interfaces for users, chats, messages, etc.
      - `services/` – cross-cutting services (auth, chat, gemini, user search, error mapping).
      - `guards/` – route guards (auth, email verification).
      - `interceptors/` – HTTP interceptors (API error mapping, auth headers if needed).
      - `firebase/` – AngularFire initialization and providers.
    - `store/`
      - `auth/` – NgRx feature: auth state, actions, reducers, selectors, effects.
      - `chat/` – NgRx feature: chats, messages, invitations, typing.
      - `ui/` – NgRx feature: search value, selected chat ID, dialogs, snackbars.
      - `app-store.module` or root `provideStore` config.
    - `features/`
      - `auth/` – login, signup, guest, verify-email pages/components.
      - `layout/` – main layout (sidebar + main content), top-level container.
      - `chat/` – chat view (messages, input, header, invitation states).
      - `sidebar/` – chat list, search, Gemini tile, user footer, settings trigger.
      - `settings/` – profile, appearance, notifications, privacy pages/dialog.
      - `gemini/` – Gemini bot view and logic.
    - `shared/`
      - `components/` – reusable UI components (buttons, avatars, layout wrappers like CenterContent).
      - `pipes/` – common pipes (e.g., date/time formatting if needed).
      - `directives/` – scroll/auto-focus helpers if useful.
  - `environments/` – `environment.ts`, `environment.development.ts` with Firebase + API base URLs.
  - `styles.scss` – global theme imports, CSS variables, scrollbars, base layout.

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

Create TypeScript interfaces in `core/models` closely mirroring the current `types.ts`:

- Users:
  - `OnlineStatus = 'online' | 'offline' | 'away'`.
  - `BaseUser` with `id`, `displayName`, `username`, optional `avatarUrl`, `status`.
  - `CurrentUser` extending `BaseUser` with `createdAt`, `chats`, `blocked`, `privacy`, `notifications`, `friends`.

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

### 7.1 AuthService (Client Auth)

Responsibilities:

- Wrap AngularFire Auth for:
  - Email/password signup and login.
  - Guest login (via custom token if still supported, or a revised guest strategy).
  - Email verification (sending verification emails and refreshing tokens).
- Expose auth state as Observables or signals:
  - `currentUser$`, `loading$`, `error$`, `emailVerified$`, `isGuest$`.
- Centralize Firebase-specific logic that was previously spread across hooks like `useAuth`, `useEmailVerification`, `useResendVerification`, and `AuthProvider`.

### 7.2 AuthApiService (Backend Auth API)

Responsibilities (talking to existing Next APIs or a future backend):

- Mirror the client wrapper in the React app:
  - `authenticate(request)` → `/auth/login`.
  - `verifySession()` → `/auth/verify-session`.
  - `logout()` → `/auth/logout`.
  - `resendVerification()` → `/auth/resend-verification`.
- Use Angular `HttpClient` and interceptors to:
  - Map backend error payloads into a consistent `ApiError` shape.
  - Optionally attach auth headers if needed later.

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

### 8.1 Routes

Define main routes to mirror the existing app:

- `/login` – login/signup/guest entry.
- `/verify` – email verification page.
- `/` – main authenticated shell (sidebar + chat or Gemini view).

### 8.2 Guards

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

### 9.1 Auth Store

```ts
export const AuthStore = signalStore(
  { providedIn: "root" },
  withState<AuthState>({ user: null, isGuest: false, emailVerified: false, loading: false, error: null }),
  withComputed(({ user, emailVerified }) => ({
    isAuthenticated: computed(() => !!user()),
    needsVerification: computed(() => !!user() && !emailVerified()),
  })),
  withMethods((store, authService = inject(AuthService)) => ({
    login: rxMethod<LoginRequest>(pipe(switchMap((req) => authService.login(req)))),
    logout: rxMethod<void>(pipe(switchMap(() => authService.logout()))),
  })),
);
```

- Coordinates `AuthService` (Firebase) and `AuthApiService` (backend).
- Triggers Router navigation as a side-effect inside `withMethods`.

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

### 10.1 Auth Feature (Login / Verify)

- Components:
  - Login/signup/guest form using Angular Reactive Forms.
  - Verification page (resend email, show status) modeled on the existing verification screen.
- Logic:
  - Use NgRx effects to call `AuthService`/`AuthApiService` and update `auth` state.
  - Route guards for preventing verified users from returning to `/login` / `/verify` unnecessarily.

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

### Phase 0: Scaffold & Platform Readiness (do first, gate everything else on this)

1. **Angular 21 baseline**: Update `package.json` to `@angular/core@^21.2.0`, replace `@angular-devkit/build-angular` with `@angular/build@^21.2.3`, set `typescript: ~5.9.2`, `zone.js: ~0.15.0`. Delete `node_modules` + `package-lock.json`, run `npm install`.
2. **Verify Angular baseline**: `npm run build` and `npm test` must pass on the default scaffold before adding any library.
3. **Angular Material**: `ng add @angular/material@21` — accepts prompts for theme/typography/animations.
4. **Tailwind CSS v4**: `npm install -D tailwindcss @tailwindcss/postcss`, create `postcss.config.mjs`, add `@import "tailwindcss"` to `styles.scss`.
5. **NgRx Signals**: `npm install @ngrx/signals@21`.
6. **AngularFire**: `npm install @angular/fire@20 firebase` (use `--legacy-peer-deps` if needed for peer conflict with Angular 21).
7. **ESLint**: `ng add @angular-eslint/schematics`.
8. **Path aliases**: Add `@core`, `@shared`, `@features/*` to `tsconfig.json` paths.
9. **Clean app shell**: Replace default `app.component.html` placeholder with a minimal `<router-outlet>`, clear `app.component.scss`, set up `app.routes.ts` stub.
10. **Gate check**: `npm run build`, `npm run lint`, `npm test` all pass.

### Phase 1: Auth & Core

11. Set up environments, Firebase config, and core theming (Material dark theme + Tailwind tokens).
12. Implement `AuthService`, `AuthApiService`, basic login page, route guards.
13. Implement `AuthStore` (Signal Store) and wire login/verify/logout flows.

### Phase 2: Shell & Chat

14. Implement shell layout and sidebar using mocked data.
15. Implement `ChatService` and `ChatStore` (load chats, select chat, view messages).
16. Add message sending, unread counts, typing indicators.

### Phase 3: Features

17. Implement Gemini feature (service + UI).
18. Implement settings, user search, and chat creation flows.
19. Refine UI, animations, error handling, and cover missing flows.

This plan is a living document — update it as you refine decisions, replace the backend, or adjust scope.
