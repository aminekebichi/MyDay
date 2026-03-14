# MyDay

A unified daily planning dashboard that consolidates your tasks, meetings, and deadlines into one real-time interface — checklist, weekly overview, and calendar in one place.

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [User Personas](#user-personas)
- [User Stories](#user-stories)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Team](#team)

---

## About

Managing tasks, deadlines, meetings, and assignments happens across disconnected tools with no single, coherent view of the day. **MyDay** gives every user a unified planning dashboard where they can log tasks, schedule meetings, and track deadlines across three core views:

- **Daily To-Do Checklist** — Surfaces today's most actionable items.
- **Weekly Schedule Overview** — Highlights key events and approaching deadlines at a glance.
- **Calendar View** — Maps out the full shape of the current week.

Every interaction — adding a task, marking something complete, or logging a new event — is reflected **instantly across all views in real time**. The interface is designed to stay out of the user's way: inputs are quick, layouts are scannable, and the dashboard adapts fluidly as the week evolves.

---

## Features

- 📝 **Quick Task Entry** — Add assignments, deadlines, and to-dos in seconds.
- 📅 **Unified Calendar** — See your entire week at a glance in a responsive calendar view.
- ✅ **Interactive Checklist** — Check off completed tasks and watch your to-do list update in real time.
- 🔄 **Real-Time Sync** — All three views stay perfectly in sync with every change.
- 🚀 **Instant Dashboard** — Your current week loads pre-populated so you can get oriented immediately.
- 🎯 **Priority Insights** — The weekly overview highlights upcoming events and approaching deadlines to help you prioritize.

---

## User Personas

| Persona | Description |
|---|---|
| 🎓 **The Overwhelmed Student** | Juggles coursework, group projects, and personal commitments across multiple platforms and just wants one place to see everything without switching between apps. |
| 💼 **The Busy Professional** | Moves between back-to-back meetings and needs a fast, frictionless way to log tasks and know exactly what needs to happen today. |
| 🗓️ **The Forgetful Planner** | Loses track of deadlines and recurring obligations and needs a reliable, always-current view of the week to stay on top of things. |

---

## User Stories

- As a **new user**, I want to create an account and set up my profile so that my dashboard is personalized and ready to use.
- As a **student**, I want to add assignments and deadlines quickly so that they appear on my checklist and calendar without extra steps.
- As a **busy user**, I want to log meetings and events in seconds so that my weekly overview stays accurate without disrupting my flow.
- As a **daily planner**, I want to check off completed tasks so that my to-do list reflects what is actually left to do today.
- As a **schedule-aware user**, I want all three views to update in real time whenever I make a change so that I never see stale or conflicting information.
- As an **overwhelmed student**, I want a weekly overview that highlights my most important upcoming events and deadlines so that I can prioritize without digging through every entry.
- As a **returning user**, I want my dashboard to load with my current week already populated so that I can get oriented immediately without any setup.

---

## Tech Stack

*To be determined.*

---

## Getting Started

1. **Install dependencies**: `npm install`
2. **Setup database**: `npx prisma db push`
3. **Seed data**: `npx prisma db seed`
4. **Run dev server**: `npm run dev`

### Test Accounts

| Role | Username | Password |
|---|---|---|
| **Admin** | `admin` | `admin` |
| **User (Amine)** | `amine` | `admin` |
| **User (Sarah)** | `sarah` | `sarah` |
| **User (Bob)** | `bob` | `bob` |

---

## Team

| Name | GitHub |
|---|---|
| Amine Kebichi | [@aminekebichi](https://github.com/aminekebichi) |
| Nicholas Annunziata | [@nca0716](https://github.com/nca0716) |
---
Demo Youtube Link: https://www.youtube.com/watch?v=_T5EbpoYrGs&feature=youtu.be
---
Blog Post: 

MyDay: Your Live Calendar Dashboard
The Problem: Too Many Places to Look

Modern productivity tools are supposed to make life easier, but a lot of the time they end up doing the opposite. Tasks live in one app, calendar events live somewhere else, reminders show up through notifications, and notes get scattered across different systems. When you actually try to figure out what you need to do today, you often end up jumping between multiple tools just to piece together the full picture.

The idea behind MyDay was to reduce that fragmentation. Instead of switching between a to-do list, a calendar, and whatever system someone uses for planning their week, we wanted one place that could show everything together and stay updated in real time. The result was a small productivity dashboard built around three main views. There is a horizontally scrolling calendar for looking ahead, a focused task list for the current day, and a short weekly summary that gives a quick sense of how busy the upcoming days look.

From the start, the goal was not to build a huge productivity platform. We wanted something fast and simple that could answer the basic question most people ask at the start of the day: what do I actually need to get done today?

Choosing the Stack

To build the project quickly while still keeping the architecture clean, we chose a stack that balanced speed of development with flexibility for future changes.

The application itself is built with Next.js using the App Router architecture. One advantage of this approach is that it allows server-side data fetching to be handled directly within the framework. Instead of relying heavily on client-side requests, the server can fetch the data needed for a page and send only the relevant information to the browser. This reduces the amount of JavaScript that has to run on the client and helps keep the application responsive.

Using Next.js also made it convenient to keep the API routes and frontend code in the same project. The app/api directory handles the backend logic while the rest of the application manages the interface. For a project like MyDay, where the frontend and backend are closely connected, this setup simplifies development and deployment.

For persistence we used Prisma with SQLite. SQLite worked well for this stage of the project because it requires almost no infrastructure to set up. Everything runs locally and the database file is managed directly by the application. Prisma sits on top of that database and provides a clean interface for interacting with the data.

One advantage of Prisma is that it keeps the data layer flexible. If the project eventually moves to a cloud environment, switching from SQLite to something like PostgreSQL would mainly involve configuration changes rather than rewriting database logic.

Managing State with Zustand

One of the more important architectural decisions involved how the application would manage state across different parts of the interface. We used Zustand as the central state management solution.

Rather than keeping separate state inside each component, MyDay uses a shared store that contains the list of items currently loaded in the application. Components subscribe only to the parts of that state they need. This makes it easier to keep the calendar view and the task list synchronized without constantly passing data between components.

For example, if a user marks a task as completed in the task list, the calendar immediately reflects that change. The number of tasks shown on a specific day updates automatically because both components are referencing the same underlying data.

This approach ended up being much simpler than trying to coordinate multiple pieces of state across different views.

Making the Interface Feel Instant

One of the most important parts of a productivity tool is responsiveness. If a user checks off a task and nothing happens for half a second while the system waits for a server response, the interface starts to feel slow.

To avoid that problem, MyDay uses a pattern called optimistic updates. When a user creates or modifies a task, the change appears immediately in the interface. At the same time, a request is sent to the server to store the change in the database.

If the request succeeds, the interface stays exactly as it is. If something fails, the application rolls back the change and shows an error message. This pattern keeps the interface feeling immediate even though the actual database update happens asynchronously.

Handling Recurring Tasks

Recurring tasks are surprisingly tricky to implement. A simple approach would be to create a new database row for every occurrence of a repeating task, but that can quickly lead to thousands of entries for something like a weekly event.

Instead of storing every occurrence, MyDay stores the recurrence rule itself. When the application requests tasks for a specific time window, the server calculates the instances that fall within that window and generates them dynamically.

These generated instances are sometimes called virtual items. They exist only in the data returned to the client and are not permanently stored in the database.

Each instance receives a predictable identifier based on the original task ID and the specific date. That makes it possible for the frontend to interact with a specific occurrence without needing to create separate database records for every instance.

This approach keeps the database small while still allowing recurring tasks to behave like normal items in the interface.

Building the Horizontal Calendar

One of the main visual components in MyDay is the horizontal calendar strip that runs across the top of the dashboard.

Instead of using a traditional vertical calendar layout, the interface displays days along a horizontal timeline that users can scroll through. The component renders a window that extends roughly one year into the past and one year into the future.

To keep performance reasonable, the application creates a map that indexes tasks by date. Each day card in the calendar can quickly check which tasks belong to it by looking up that date in the map rather than filtering the entire dataset repeatedly.

Scrolling behavior was designed to feel natural on both desktop and mobile devices. Touch input uses native horizontal scrolling, while desktop users can move through the calendar using the mouse wheel.

The result is a timeline that feels continuous rather than broken into separate pages.

Adding a Bit of Personality

Many productivity tools feel extremely mechanical. Everything is just lists, numbers, and checkboxes.

To give MyDay a little more personality, we added a weekly summary feature that generates a short comment about how busy the upcoming week appears. The system analyzes the number and priority of tasks scheduled and selects a message from a set of templates.

If the week looks packed, the message might comment on how ambitious the schedule seems. If there are very few tasks scheduled, it might jokingly question whether the user actually has nothing planned.

This feature does not rely on a language model or external API. Instead it uses a simple template system that generates messages based on conditions in the data.

While it is a small detail, it helps make the interface feel slightly more human.

Lessons from Development

Development did not go perfectly from the beginning. At one point during the project we ran into a major merge conflict that affected several of the API routes and parts of the authentication system.

Fixing the issue required restoring and reorganizing some of the project structure. Although it was frustrating at the time, it also gave us an opportunity to improve the way sessions were handled. The earlier version relied heavily on simple identifiers stored locally. During the recovery process we replaced that system with a more structured token-based approach.

Situations like this are fairly common in software projects, and in this case the problem actually helped push the architecture in a better direction.

Accessibility Considerations

Accessibility was something we tried to keep in mind while building the interface.

Interactive elements use standard HTML components such as buttons whenever possible so that keyboard navigation works correctly without requiring additional configuration. Tasks and categories are also labeled clearly so that color alone is not responsible for conveying meaning.

We also added support for reduced motion preferences. Users who have motion effects disabled at the operating system level will see simpler transitions instead of the animated movements used in the default interface.

These adjustments help make sure the application remains usable for a wider range of people.

Looking Ahead

The current version of MyDay functions as a working prototype, but there are several directions the project could expand.

One obvious improvement would be adding cloud synchronization so tasks remain consistent across multiple devices. Because Prisma already abstracts the database layer, moving from SQLite to a hosted database would be relatively straightforward.

Another potential feature would be shared calendars or collaborative lists for small teams or student groups. That would require expanding the authentication system and introducing permissions for shared items.

The weekly overview system could also evolve into a more detailed analysis of productivity patterns over time.

Final Thoughts

Building MyDay ended up being a useful exercise in combining a few simple tools into a cohesive system that feels responsive and easy to use.

Next.js provided the structure for the full stack application, Prisma handled the data layer, and Zustand made it possible to keep different parts of the interface synchronized without complicated state management.

The result is a small but functional productivity dashboard that demonstrates how lightweight tools can still produce a polished user experience when the architecture is designed carefully.

At its core, MyDay is built around a simple goal: reducing the friction involved in figuring out what needs to happen today
