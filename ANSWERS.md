# SQL Detective — Answer Key

Reference solution for every challenge. The game itself accepts any query
that produces an equivalent result set, not just this exact text.

## Case 1 — The Missing Diamond (`SELECT`, `WHERE`)

**1a.** Show the name and occupation of every suspect.
```sql
SELECT name, occupation FROM suspects;
```

**1b.** Find every suspect who lives in the Warehouse District.
```sql
SELECT * FROM suspects WHERE location = 'Warehouse District';
```

**1c.** Find the suspect whose occupation is exactly 'Antiques Dealer'.
```sql
SELECT * FROM suspects WHERE occupation = 'Antiques Dealer';
```

## Case 2 — The Suspicious Employee (sorting, `LIMIT`, `LIKE`)

**2a.** List suspects older than 35, oldest first.
```sql
SELECT * FROM suspects WHERE age > 35 ORDER BY age DESC;
```

**2b.** Find the 3 youngest suspects.
```sql
SELECT * FROM suspects ORDER BY age ASC LIMIT 3;
```

**2c.** Find suspects whose occupation contains 'Consultant' or 'Curator'.
```sql
SELECT * FROM suspects WHERE occupation LIKE '%Consultant%' OR occupation LIKE '%Curator%';
```

## Case 3 — The Hidden Transaction (aggregates, `GROUP BY`, `HAVING`)

**3a.** Total transaction amount per suspect.
```sql
SELECT suspect_id, SUM(amount) AS total FROM transactions GROUP BY suspect_id;
```

**3b.** Suspects whose total transactions exceed $100,000.
```sql
SELECT suspect_id, SUM(amount) AS total FROM transactions
GROUP BY suspect_id HAVING SUM(amount) > 100000;
```

**3c.** Average transaction amount per location.
```sql
SELECT location, AVG(amount) AS avg_amt FROM transactions GROUP BY location;
```

## Case 4 — Connect the Clues (`JOIN`)

**4a.** Each piece of evidence with the suspect's name.
```sql
SELECT s.name, e.evidence_type, e.found_location
FROM evidence e INNER JOIN suspects s ON e.suspect_id = s.suspect_id;
```

**4b.** All suspects with their evidence, including suspects with none.
```sql
SELECT s.name, e.evidence_type
FROM suspects s LEFT JOIN evidence e ON s.suspect_id = e.suspect_id;
```

**4c.** Camera sightings joined to the occupation of the person seen.
```sql
SELECT c.location, c.timestamp, c.person_seen, s.occupation
FROM cameras c INNER JOIN suspects s ON c.person_seen = s.name;
```

## Case 5 — The Secret Account (subqueries)

**5a.** Transactions above the average transaction amount.
```sql
SELECT * FROM transactions WHERE amount > (SELECT AVG(amount) FROM transactions);
```

**5b.** The suspect who made the single highest transaction.
```sql
SELECT suspect_id, name FROM suspects
WHERE suspect_id = (SELECT suspect_id FROM transactions ORDER BY amount DESC LIMIT 1);
```

**5c.** Suspects who have evidence found at 'Warehouse 7'.
```sql
SELECT * FROM suspects
WHERE suspect_id IN (SELECT suspect_id FROM evidence WHERE found_location = 'Warehouse 7');
```

## Case 6 — The Crime Network (`CASE`, multi-table `JOIN`)

**6a.** Classify each transaction's risk level.
```sql
SELECT transaction_id, amount,
  CASE WHEN amount > 100000 THEN 'High'
       WHEN amount >= 10000 THEN 'Medium'
       ELSE 'Low' END AS risk_level
FROM transactions;
```

**6b.** Suspects with their evidence type and any camera sighting location.
```sql
SELECT s.name, e.evidence_type, c.location
FROM suspects s
LEFT JOIN evidence e ON s.suspect_id = e.suspect_id
LEFT JOIN cameras c ON c.person_seen = s.name;
```

**6c.** Suspects seen on camera at 'Warehouse 7' AND with a transaction over $50,000.
```sql
SELECT DISTINCT s.name
FROM suspects s
INNER JOIN cameras c ON c.person_seen = s.name
INNER JOIN transactions t ON t.suspect_id = s.suspect_id
WHERE c.location = 'Warehouse 7' AND t.amount > 50000;
```

## Case 7 — The Final Investigation (CTEs, window functions)

**7a.** Total transaction amount per suspect, via a CTE.
```sql
WITH suspect_totals AS (
  SELECT suspect_id, SUM(amount) AS total FROM transactions GROUP BY suspect_id
)
SELECT * FROM suspect_totals;
```

**7b.** Rank suspects by total transaction amount.
```sql
WITH t AS (
  SELECT suspect_id, SUM(amount) AS total FROM transactions GROUP BY suspect_id
)
SELECT suspect_id, total, RANK() OVER (ORDER BY total DESC) AS rnk FROM t;
```

**7c.** Number each suspect's transactions newest-to-oldest.
```sql
SELECT suspect_id, transaction_date, amount,
  ROW_NUMBER() OVER (PARTITION BY suspect_id ORDER BY transaction_date DESC) AS rn
FROM transactions;
```

## Final Case — Crack the Mystery

**8a.** One suspect seen on camera at Warehouse 7, with evidence at Warehouse 7,
and a transaction over $200,000.
```sql
SELECT DISTINCT s.name FROM suspects s
WHERE s.suspect_id IN (
    SELECT suspect_id FROM cameras c
    JOIN suspects s2 ON c.person_seen = s2.name
    WHERE c.location = 'Warehouse 7'
  )
  AND s.suspect_id IN (
    SELECT suspect_id FROM evidence WHERE found_location = 'Warehouse 7'
  )
  AND s.suspect_id IN (
    SELECT suspect_id FROM transactions WHERE amount > 200000
  );
```
→ Returns **Alex Morgan**.

**Final submission:**

| Field | Answer |
|---|---|
| Culprit | Alex Morgan |
| Location | Warehouse 7 |
| Motive | Financial Fraud |
| Key Evidence | Transaction #4821 |

## SQL Academy lesson answers

| Lesson | Solution |
|---|---|
| SELECT | `SELECT name, age FROM suspects;` |
| WHERE | `SELECT * FROM suspects WHERE age < 30;` |
| ORDER BY | `SELECT name, age FROM suspects ORDER BY age DESC;` |
| GROUP BY | `SELECT location, COUNT(*) AS cnt FROM suspects GROUP BY location;` |
| JOIN | `SELECT s.name, e.evidence_type FROM suspects s JOIN evidence e ON s.suspect_id = e.suspect_id;` |
| Subqueries | `SELECT * FROM transactions WHERE amount > (SELECT AVG(amount) FROM transactions);` |
| CTE | `WITH big AS (SELECT * FROM transactions WHERE amount > 10000) SELECT * FROM big;` |
| Window Functions | `SELECT name, age, RANK() OVER (ORDER BY age DESC) AS age_rank FROM suspects;` |
