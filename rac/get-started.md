# 🚀 Getting Started with RaC (Requirements-as-Code)

Welcome to your RaC workspace! This folder uses a structured, schema-driven format to describe apps declaratively — ready for AI assistants to build, simulate, and test your ideas.
Let RaC help your AI “cook” your app, step by step.

## 🧠 Tech Agnostic RaC – System Prompt for Full-Stack Web Applications

> 💡 RaC helps consolidate the specification of your app — state, logic, behavior, and tests — into a **single structured source of truth**. Instead of spreading requirements across documents, UI mockups, and backend code, RaC expresses everything declaratively in `.rac.yaml` files.
>
> With the help of LLMs, you can now **focus development time on the specification**, and let automation generate tech-specific implementations from that source of truth.

You are contributing to a full-stack web application using a **Tech-Agnostic Requirements-as-Code (RaC)** system.  

The entire system is modeled declaratively using YAML files, organized by purpose:
- `state/` — data structures (frontend & backend)
- `events/` — user/system actions (sync/async, frontend/backend)
- `logic/` — core system rules, validation, time, security
- `ui/` — abstract UI reactions and component states
- `data/` — static configuration, schemas, game or app structure
- `tests/` — simulations and validations
- `bindings/` — technology-specific mappings (React, Express, DBs, etc.)
- `docs/` — embedded system documentation (optional)

## ✅ Functional Scope

- Define **frontend and backend logic** separately, but consistently  
- Support **sync and async event flows** (e.g., form submits, background jobs)  
- Represent **user and system events** with clear preconditions and actions  
- Track **data flow** between frontend ↔ backend using RaC-linked states  
- Ensure **state files** capture all relevant fields with roles and access notes  
- Support **API contracts** without locking to specific frameworks  

## 🔐 Security & Monitoring

- Capture **access control**, **data validation**, and **security checks** inside `logic/`  
- Include **audit trails**, **monitoring triggers**, and **logging events** as RaC components  
- Make sensitive actions explicitly gated (e.g., `"requires: admin"`)  

## 🧪 Testing & Documentation

- Each RaC unit (event, logic, UI) must be **covered by at least one test case**  
- Tests simulate real user/system behavior with clear **setup, action, expected outcome**  
- Document behavior inline or in `docs/` (e.g., `security-model.rac.yaml`, `api-map.rac.yaml`)  

## 📦 Tech-Agnostic Bindings

- Add concrete tech bindings only under `/bindings/` (e.g., React, Express, SQL, Bolt.new)  
- Bindings must **not leak implementation details** into RaC core logic  
- Keep binding layers modular, swappable, and version-controlled  

## 💡 You Must:

- Maintain **declarative clarity** — no embedded imperative code  
- Support **extensibility** — new logic must not break existing flows  
- Focus on **readability** for developers, AI systems, and non-technical users  
- Enable **progressive refinement** — from abstract design → tested logic → tech bindings  

Use this prompt to build RaC definitions that simulate, describe, and power full-stack behavior — independent of technology choices but ready for real-world execution.

---

## 📚 Using Schema Files

Each folder under `rac/` (like `state/`, `events/`, `logic/`, etc.) should contain `.rac.yaml` files that conform to a standard schema. These schemas are stored in the `/schemas/` subfolder and ensure consistency, validation, and tool compatibility.

Here’s how to use them:

1. 📂 Open the `/schemas/` folder to review the schema file that matches the folder you're working on (e.g., `state.schema.rac.yaml` for `state/`).
2. ✍️ When creating a new `.rac.yaml` file, follow the structure and required fields defined in the schema.
3. ✅ Use AI tools (like Cursor, Bolt.new, or RaC CLI) that understand these schemas to:
   - Validate the file
   - Offer autocompletion or suggestions
   - Simulate or preview flows

Each schema defines:
- `fields` and types
- Required vs optional entries
- Enum values (e.g., `event.type = user | system`)
- Metadata and versioning conventions

By adhering to these schemas, you ensure your RaC definitions are:
- Machine-readable
- LLM-friendly
- Easy to simulate, bind, or transform

---

## 🔄 Data Workflow Principle

RaC enforces **strict separation of concerns**. The data flow follows this pattern:

1. **UI triggers an event** — via form, button, or system timer (defined in `ui/` and `events/`)
2. **Event declares intent** — defines what should happen (defined in `events/`) but does not implement logic
3. **Logic evaluates conditions** — rules and validations (defined only in `logic/`)
4. **State is updated** — if logic passes, `events/` perform allowed updates to `state/`

### 🛑 Rules:
- Logic (`logic/`) is **read-only** — no state changes allowed
- State updates **only occur** inside `events/` via `actions: update | create | delete`
- Each `.rac.yaml` must follow its corresponding schema to ensure consistency

This architecture guarantees:
- Declarative clarity
- Modular, testable design
- Reliable simulation before implementation
