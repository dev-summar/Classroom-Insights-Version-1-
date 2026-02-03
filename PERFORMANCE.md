# Backend Performance Optimizations

This document summarizes performance changes applied to the FastAPI + MongoDB backend. **No API contracts, business logic, or sync behavior were changed.**

## Response Time Goals

- **Dashboard / stats APIs**: &lt; 500 ms (stats &lt; 400 ms from cache)
- **List APIs**: &lt; 700 ms
- **Analytics**: Improved via caching and parallel DB access

---

## 1. MongoDB Indexes

Indexes are created at application startup in `main.py`. They match existing filter and sort patterns only; no schema or data meaning changed.

| Collection   | Index | Purpose |
|-------------|-------|--------|
| courses     | `(id, 1)` unique | Lookup by id |
| courses     | `(courseState, 1)` | Active course filter |
| courses     | `(courseState, 1), (name, 1)` | List with name search |
| teachers    | `(userId, 1)`, `(courseId, 1)` | Lookups and filter by course |
| teachers    | `(courseId, 1), (name, 1)` | List with search |
| students    | `(userId, 1)`, `(courseId, 1)` | Same as teachers |
| students    | `(courseId, 1), (name, 1)` | List with search |
| coursework  | `(id, 1)` unique, `(courseId, 1)` | Lookup and filter |
| coursework  | `(courseId, 1), (creationTime, 1)` | Analytics sort |
| submissions | `(id, 1)` unique, `(courseId, 1)`, `(courseWorkId, 1)` | Lookups and filters |
| submissions | `(courseId, 1), (userId, 1)` | Analytics grouping |

To ensure indexes in a separate script, run the same `db.<collection>.create_index(...)` calls from `main.py` against your MongoDB instance.

---

## 2. Query Optimizations

- **Projections**: Active course IDs and analytics coursework use `{"id": 1}` / `{"id": 1, "courseId": 1, "creationTime": 1}` to reduce data transfer.
- **N+1 removed**: `/api/courses` no longer runs per-course `distinct`/`count_documents`. Batch aggregations return unique teacher/student counts and assignment counts for the page in 3 parallel aggregations.
- **Single aggregation for list endpoints**: Students, teachers, and assignments lists already use one aggregation; they now share cached active course IDs.

---

## 3. Parallel Execution

Sync DB calls are run in threads via `asyncio.to_thread()` so independent work runs in parallel:

- **GET /api/stats**: One query for active course IDs, then four parallel calls (distinct students, distinct teachers, count coursework, count submissions).
- **GET /api/courses**: Find + count in parallel; then three parallel aggregations for teacher/student/assignment counts for the page.
- **GET /api/courses/{courseId}**: Course, teachers, students, assignments fetched in parallel.
- **GET /api/assignments/{id}**: Parent course and submissions aggregation run in parallel after assignment is loaded.
- **Analytics**: After active IDs, coursework (with projection), students aggregation, and submissions aggregation run in parallel.

---

## 4. Server-Side Caching (Read-Through)

- **In-memory TTL cache**; keys can be invalidated by prefix when sync completes.
- **Cached data**:
  - `stats`: 60 s TTL — dashboard stats.
  - `active_course_ids`: 120 s TTL — used by students, teachers, assignments lists.
  - `analytics:student_analytics`: 90 s TTL — shared by silent-students and at-risk-students.
- **Cache keys** include logical names only (no PII). TTL keeps data fresh; sync invalidates only affected prefixes.

---

## 5. Sync-Aware Cache Invalidation

When sync completes, only relevant cache keys are cleared:

- **After `/sync/courses`**: `stats`, `active_course_ids`, `analytics` (roster affects analytics).
- **After `/sync/coursework`**: `stats`, `analytics`.

Sync behavior and correctness are unchanged; cache does not affect when or how data is written.

---

## 6. Pagination

- List endpoints use indexed fields for `$match` and `$sort`; `skip`/`limit` are applied on the server.
- No change to API pagination (page/limit); same response shape and semantics.

---

## Validation

- API responses (shape and values) are unchanged.
- No frontend changes required.
- Sync logic and data correctness unchanged.
- New data still appears correctly after sync; cache TTL and invalidation keep reads consistent.
