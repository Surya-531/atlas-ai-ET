# Swapping the local store for Supabase

ATLAS AI runs out of the box on a file-backed JSON store (`/data/*.json`,
via `lib/db/jsonStore.ts`) so the whole platform works with zero external
accounts. Every repository function in `lib/store.ts` is a thin wrapper
around `readCollection` / `writeCollection`, so moving to Supabase means
re-implementing those same functions against `supabase-js` — nothing above
the repository layer (agents, API routes, UI) needs to change.

## Steps

1. Run `supabase/schema.sql` against your Supabase project (SQL editor or
   `supabase db push`). It creates `organizations`, `users`, `assets`,
   `documents`, `document_chunks`, `maintenance`, `incidents`, `compliance`,
   `conversations`, `messages`, `knowledge_entities`, `knowledge_relationships`,
   and `notifications`, matching the shapes in `lib/types.ts`.
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
3. In `lib/store.ts`, replace the body of each function with a Supabase
   call, e.g.:
   ```ts
   export async function listAssets(): Promise<Asset[]> {
     const { data } = await supabase.from("assets").select("*");
     return data ?? [];
   }
   ```
4. For vector search, either enable `pgvector` on `document_chunks.embedding`
   and query with `<->`, or point `lib/embeddings.ts` at Qdrant Cloud by
   setting `QDRANT_URL` / `QDRANT_API_KEY` (a Qdrant-backed implementation
   of `similaritySearch()` is the only function that needs to change).
5. For the knowledge graph, `knowledge_entities` / `knowledge_relationships`
   already model a graph in relational form. For real Cypher traversal,
   mirror writes to Neo4j Aura in `lib/agents/graphAgent.ts` and swap
   `lib/graphrag.ts`'s traversal helper for a Cypher query over
   `NEO4J_URI` / `NEO4J_USER` / `NEO4J_PASSWORD`.

None of this is required to run or demo the app — it's the upgrade path
from hackathon prototype to a multi-tenant production deployment.
