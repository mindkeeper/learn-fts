# Full-Text Search & Fuzzy Matching Documentation

Complete guide to implementing PostgreSQL Full-Text Search (FTS) and Trigram fuzzy matching with Prisma.

## 📚 Documentation Structure

### 1. [FTS & TRGM Complete Guide](./FTS-AND-TRGM-GUIDE.md)
**Comprehensive deep dive into both technologies**

**Topics Covered:**
- What is Full-Text Search (FTS)?
- Core FTS concepts: tsvector, tsquery, ranking
- What is Trigram matching (pg_trgm)?
- Similarity functions and thresholds
- Detailed comparison: FTS vs Trigram
- When to use each approach
- Complete Prisma implementation guide
- Performance optimization strategies
- Production best practices

**Best for:** Understanding the theory and fundamentals

---

### 2. [Practical Examples](./PRACTICAL-EXAMPLES.md)
**Real-world implementation patterns and use cases**

**Contains:**
- 5 common search patterns (Basic, Tiered, Autocomplete, etc.)
- 5 real-world use cases:
  - E-commerce product search
  - User deduplication
  - Multi-language search
  - Geographic search
  - Document search with highlighting
- SQL query examples (phrase, boolean, prefix, weighted)
- Performance optimization patterns
- Troubleshooting common issues
- Benchmark data

**Best for:** Copy-paste implementations and solving specific problems

---

### 3. [Quick Reference](./QUICK-REFERENCE.md)
**Cheat sheet for quick lookups**

**Includes:**
- Quick start guide
- FTS function reference table
- Trigram function reference table
- Common query templates
- Decision tree flowchart
- Score interpretation guide
- Prisma snippets
- Troubleshooting checklist
- Language configs reference

**Best for:** Quick lookups and reminders

---

## 🚀 Getting Started

### Prerequisites
- PostgreSQL database
- Prisma ORM
- Basic SQL knowledge

### Quick Setup (5 minutes)

1. **Enable pg_trgm extension**
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

2. **Update your Prisma schema**
```prisma
model News {
  id           String   @id @default(cuid())
  title        String
  description  String?
  searchVector Unsupported("tsvector")?

  @@index([searchVector], type: Gin)
  @@index([title(ops: raw("gin_trgm_ops"))], type: Gin)
}
```

3. **Create migration with trigger**
```sql
-- See FTS-AND-TRGM-GUIDE.md Step 3 for complete migration
```

4. **Implement search service**
```typescript
// See PRACTICAL-EXAMPLES.md Pattern 1 for implementation
```

---

## 🎯 Which Document Should I Read?

### "I want to understand HOW it works"
→ Read [FTS & TRGM Complete Guide](./FTS-AND-TRGM-GUIDE.md)
- Explains the internals
- Theory and concepts
- Comparison and trade-offs

### "I want to implement search NOW"
→ Read [Practical Examples](./PRACTICAL-EXAMPLES.md)
- Ready-to-use code
- Specific use cases
- Production patterns

### "I forgot the syntax"
→ Use [Quick Reference](./QUICK-REFERENCE.md)
- Function signatures
- Operator reference
- Quick lookups

### "I have a specific problem"
→ Check [Practical Examples - Troubleshooting](./PRACTICAL-EXAMPLES.md#troubleshooting)
- Common issues and solutions
- Debug commands
- Performance fixes

---

## 📖 Learning Path

### Beginner Path
1. Read [Quick Reference - Quick Start](./QUICK-REFERENCE.md#-quick-start)
2. Implement basic search from [Practical Examples - Pattern 1](./PRACTICAL-EXAMPLES.md#pattern-1-basic-hybrid-search)
3. Test with sample data
4. Read [FTS Guide - When to Use What](./FTS-AND-TRGM-GUIDE.md#when-to-use-what) for understanding

### Intermediate Path
1. Read [FTS Complete Guide - Core Concepts](./FTS-AND-TRGM-GUIDE.md#core-concepts)
2. Implement use case from [Practical Examples](./PRACTICAL-EXAMPLES.md#common-use-cases)
3. Add GIN indexes
4. Optimize with [Performance Patterns](./PRACTICAL-EXAMPLES.md#performance-patterns)

### Advanced Path
1. Read full [FTS & TRGM Complete Guide](./FTS-AND-TRGM-GUIDE.md)
2. Implement hybrid search with custom scoring
3. Add caching layer
4. Performance tuning with [Optimization Guide](./FTS-AND-TRGM-GUIDE.md#performance-optimization)
5. Multi-language support

---

## 🔍 Common Scenarios

| Scenario | Solution | Document |
|----------|----------|----------|
| Basic text search | FTS only | [Guide](./FTS-AND-TRGM-GUIDE.md#use-fts-when) |
| Search with typos | Trigram fuzzy | [Examples](./PRACTICAL-EXAMPLES.md#pattern-2-tiered-search-fast--fallback) |
| Product search | Hybrid FTS+Fuzzy | [Examples](./PRACTICAL-EXAMPLES.md#use-case-1-e-commerce-product-search) |
| Autocomplete | Trigram word_similarity | [Examples](./PRACTICAL-EXAMPLES.md#pattern-3-autocomplete-with-trigrams) |
| Find duplicates | High threshold trigram | [Examples](./PRACTICAL-EXAMPLES.md#use-case-2-user-search-with-deduplication) |
| Multi-language | FTS with configs | [Examples](./PRACTICAL-EXAMPLES.md#use-case-3-multi-language-search) |
| Phrase search | FTS phrase query | [Reference](./QUICK-REFERENCE.md#6-phrase-search) |
| Slow queries | Add GIN indexes | [Guide](./FTS-AND-TRGM-GUIDE.md#performance-optimization) |

---

## 💡 Key Concepts at a Glance

### Full-Text Search (FTS)
- **What:** Linguistic, semantic search
- **How:** tsvector + tsquery + GIN index
- **Best for:** Natural language, exact stems
- **Pros:** Fast, language-aware, boolean logic
- **Cons:** No typo tolerance

### Trigram Matching
- **What:** Character-based fuzzy matching
- **How:** 3-character sequences comparison
- **Best for:** Typos, partial matches
- **Pros:** Typo-tolerant, language-agnostic
- **Cons:** Slower, no stemming

### Hybrid Approach
- **What:** Combine both methods
- **How:** FTS (70%) + Trigram (30%)
- **Best for:** Production search
- **Pros:** Best of both worlds
- **Cons:** More complex, higher resource usage

---

## 📊 Performance Expectations

### With Proper Indexes (GIN)
| Dataset Size | FTS Query | Trigram Query | Hybrid Query |
|--------------|-----------|---------------|--------------|
| 1K rows | <10ms | <20ms | <30ms |
| 10K rows | <20ms | <50ms | <70ms |
| 100K rows | <30ms | <100ms | <150ms |
| 1M rows | <50ms | <200ms | <300ms |

### Without Indexes (DON'T DO THIS!)
- Sequential scan: 5-30 seconds for 1M rows
- **Always use GIN indexes!**

---

## 🛠️ Tools & Resources

### Testing Tools
```sql
-- Test FTS
SELECT to_tsvector('english', 'your text here');
SELECT to_tsquery('english', 'your query');

-- Test Trigram
SELECT show_trgm('your text');
SELECT similarity('text1', 'text2');

-- Test Query Plan
EXPLAIN ANALYZE SELECT ...;
```

### Monitoring
```sql
-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE tablename = 'your_table';

-- Check index size
SELECT pg_size_pretty(pg_relation_size('index_name'));

-- Find slow queries
SELECT query, mean_exec_time FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 10;
```

---

## 🔗 External Resources

### Official Documentation
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [pg_trgm Extension](https://www.postgresql.org/docs/current/pgtrgm.html)
- [Prisma Raw Queries](https://www.prisma.io/docs/orm/prisma-client/queries/raw-database-access)

### Community Resources
- [PostgreSQL FTS Tutorial](https://www.compose.com/articles/mastering-postgresql-tools-full-text-search-and-phrase-search/)
- [Trigram Matching Explained](https://www.postgresql.org/docs/current/pgtrgm.html)

---

## 📝 Examples from This Implementation

Our news search implementation (`/news/search`) demonstrates:
- ✅ Hybrid FTS + Trigram search
- ✅ Weighted scoring (70% FTS, 30% Fuzzy)
- ✅ Category filtering
- ✅ Pagination support
- ✅ GIN indexes on multiple fields
- ✅ Automatic tsvector maintenance with triggers
- ✅ Individual similarity scores in response

**Endpoint:** `GET /news/search?q=<query>&categories=<slugs>&page=1&limit=20`

**See implementation:**
- Service: `src/news/news.service.ts`
- Schema: `prisma/schema.prisma`
- Migration: `prisma/migrations/.../migration.sql`

---

## 🤝 Contributing

Found an issue or want to improve the docs?
- Report issues or suggest improvements
- Share your use cases and patterns
- Contribute examples

---

## 📄 License

This documentation is part of the learn-fts project.

---

**Last Updated:** 2025-12-22
**Project:** learn-fts
**Documentation Version:** 1.0
