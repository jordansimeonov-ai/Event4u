# 🛑 DEVELOPER GUIDE - READ BEFORE CODING

## Project Overview
This is a **Next.js** application using the App Router.

## ⚠️ CRITICAL WARNINGS

### 1. NO `index.html`
**NEVER create or edit an `index.html` file in the root directory.**
*   **Reason:** It breaks the Preview window environment and conflicts with Next.js routing.
*   **Action:** If you see an `index.html` in the root, **DELETE IT** immediately.
*   **Entry Point:** The app structure is handled entirely by `src/app/layout.tsx` and `src/app/page.tsx`.

### 2. NO PATH ALIASES
**DO NOT use the `@` symbol for imports (e.g., `@/components/...`).**
*   **Reason:** The current Preview environment cannot resolve path aliases.
*   **Action:** **ALWAYS** use relative paths (e.g., `../../services/dataService`).

### 3. Source Directory
*   All functional code, logic, and UI components must reside inside the `src/` directory.
*   Do not add source files to the root.

---
**ALWAYS consult this guide before starting work or modifying the project structure.**