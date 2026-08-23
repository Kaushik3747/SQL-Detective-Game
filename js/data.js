/* =========================================================================
   SQL DETECTIVE — game data
   ========================================================================= */
const SCHEMA_SQL = `
CREATE TABLE suspects (
  suspect_id INTEGER PRIMARY KEY, name TEXT, age INTEGER, occupation TEXT, location TEXT, alibi TEXT
);
CREATE TABLE evidence (
  evidence_id INTEGER PRIMARY KEY, suspect_id INTEGER, evidence_type TEXT, found_location TEXT, timestamp TEXT, description TEXT
);
CREATE TABLE transactions (
  transaction_id INTEGER PRIMARY KEY, suspect_id INTEGER, amount REAL, transaction_date TEXT, location TEXT, transaction_type TEXT
);
CREATE TABLE cameras (
  camera_id INTEGER PRIMARY KEY, location TEXT, timestamp TEXT, person_seen TEXT
);
CREATE TABLE locations (
  location_id INTEGER PRIMARY KEY, location_name TEXT, security_level TEXT
);

INSERT INTO suspects VALUES
(1,'Alex Morgan',34,'Antiques Dealer','Warehouse District','Says he left the gala at 9pm'),
(2,'Priya Nandan',29,'Museum Curator','Downtown','Was in the archive room all night'),
(3,'Marcus Webb',45,'Security Consultant','Harbor Side','Claims he was reviewing camera feeds'),
(4,'Elena Cross',38,'Socialite','Uptown','Says she never left the ballroom'),
(5,'Jonas Kim',41,'IT Specialist','Downtown','Was fixing the museum wifi'),
(6,'Rita Alvarez',52,'Auction House Owner','Warehouse District','Claims she went home early'),
(7,'Sam Turner',27,'Valet','Uptown','Was parking cars all evening'),
(8,'Dana Wolfe',33,'Journalist','Harbor Side','Says she was interviewing guests');

INSERT INTO locations VALUES
(1,'Grand Museum','High'),
(2,'Museum Vault','High'),
(3,'Warehouse 7','Low'),
(4,'Harbor Docks','Low'),
(5,'Downtown Plaza','Medium'),
(6,'Uptown Gala Hall','Medium');

INSERT INTO evidence VALUES
(101,1,'Fingerprint','Museum Vault','2026-03-14 22:35','Partial print lifted from vault keypad'),
(102,1,'Fiber','Warehouse 7','2026-03-14 23:52','Wool coat fiber matching suspect 1 jacket'),
(103,2,'Keycard Log','Museum Vault','2026-03-14 21:10','Curator badge used for routine archive access'),
(104,3,'Note','Harbor Docks','2026-03-14 20:15','Unsigned note referencing a buyer'),
(105,4,'Glove','Uptown Gala Hall','2026-03-14 22:00','Silk glove dropped near coat check'),
(106,6,'Fingerprint','Warehouse 7','2026-03-14 23:40','Print on a crate matching suspect 6'),
(107,5,'Cable','Museum Vault','2026-03-14 19:50','Network cable spliced near vault sensor'),
(108,1,'Receipt','Warehouse District','2026-03-15 09:12','Storage unit rental receipt, suspect 1 name'),
(109,7,'Parking Stub','Uptown Gala Hall','2026-03-14 21:45','Valet stub, unrelated vehicle'),
(110,8,'Notebook Page','Harbor Side','2026-03-14 23:05','Interview notes, no incriminating content'),
(111,3,'Access Log','Grand Museum','2026-03-14 18:30','Security review log, standard shift'),
(112,1,'Glove Fiber','Museum Vault','2026-03-14 22:38','Fiber matching glove found in suspect 1 coat pocket');

INSERT INTO transactions VALUES
(4801,4,1200.00,'2026-03-10','Downtown Plaza','Card Payment'),
(4802,7,150.00,'2026-03-11','Uptown Gala Hall','Cash'),
(4803,2,3200.00,'2026-03-09','Downtown','Wire Transfer'),
(4804,8,800.00,'2026-03-08','Harbor Side','Card Payment'),
(4805,5,2000.00,'2026-03-11','Downtown','Wire Transfer'),
(4806,3,15000.00,'2026-03-12','Harbor Docks','Wire Transfer'),
(4807,6,42000.00,'2026-03-12','Warehouse District','Wire Transfer'),
(4808,1,5000.00,'2026-03-10','Warehouse District','Cash'),
(4809,4,900.00,'2026-03-13','Uptown','Card Payment'),
(4810,6,38000.00,'2026-03-13','Warehouse 7','Wire Transfer'),
(4811,3,9000.00,'2026-03-14','Harbor Docks','Cash'),
(4812,8,650.00,'2026-03-14','Harbor Side','Card Payment'),
(4813,2,1200.00,'2026-03-14','Downtown','Card Payment'),
(4821,1,250000.00,'2026-03-15','Warehouse 7','Wire Transfer'),
(4822,1,12000.00,'2026-03-15','Warehouse District','Cash'),
(4823,5,700.00,'2026-03-15','Downtown','Card Payment'),
(4824,7,300.00,'2026-03-15','Uptown','Cash');

INSERT INTO cameras VALUES
(1,'Uptown Gala Hall','2026-03-14 20:05','Elena Cross'),
(2,'Grand Museum','2026-03-14 21:30','Priya Nandan'),
(3,'Museum Vault','2026-03-14 22:40','Alex Morgan'),
(4,'Harbor Docks','2026-03-14 20:20','Marcus Webb'),
(5,'Warehouse 7','2026-03-14 23:50','Alex Morgan'),
(6,'Warehouse District','2026-03-14 23:55','Rita Alvarez'),
(7,'Downtown Plaza','2026-03-14 19:45','Jonas Kim'),
(8,'Uptown Gala Hall','2026-03-14 21:50','Sam Turner'),
(9,'Harbor Side','2026-03-14 23:10','Dana Wolfe'),
(10,'Grand Museum','2026-03-14 22:33','Alex Morgan');
`;

const TABLE_INFO = [
  {name:'suspects', cols:['suspect_id','name','age','occupation','location','alibi']},
  {name:'evidence', cols:['evidence_id','suspect_id','evidence_type','found_location','timestamp','description']},
  {name:'transactions', cols:['transaction_id','suspect_id','amount','transaction_date','location','transaction_type']},
  {name:'cameras', cols:['camera_id','location','timestamp','person_seen']},
  {name:'locations', cols:['location_id','location_name','security_level']},
];
const RELATIONSHIPS = [
  'suspects.suspect_id → evidence.suspect_id',
  'suspects.suspect_id → transactions.suspect_id',
  'cameras.person_seen → suspects.name',
  'evidence.found_location → locations.location_name'
];

function ch(id, concept, prompt, solution, hints, xp){
  return {id, concept, prompt, solution, hints, xp, expected:null};
}

const LEVELS = [
  {
    id:1, num:'CASE FILE №1', title:'The Missing Diamond', difficulty:'Beginner',
    concepts:['SELECT','WHERE'], est:'10 min',
    story:`The Crown Diamond vanished from the Grand Museum during last night's gala. Eight guests remain on the suspect list. Start by getting familiar with who you're dealing with.`,
    challenges:[
      ch('1a','SELECT','Show the name and occupation of every suspect.','SELECT name, occupation FROM suspects;',
        ['Every suspect is a row in one table — start simple.','You need the suspects table, and just two columns: name and occupation.','SELECT name, occupation FROM suspects;'],100),
      ch('1b','WHERE','Find every suspect who lives in the Warehouse District.','SELECT * FROM suspects WHERE location = \'Warehouse District\';',
        ['A WHERE clause filters rows by a condition.','Filter suspects on the location column.','SELECT * FROM suspects WHERE location = \'Warehouse District\';'],100),
      ch('1c','WHERE','Find the suspect whose occupation is exactly \'Antiques Dealer\'.','SELECT * FROM suspects WHERE occupation = \'Antiques Dealer\';',
        ['One suspect matches this occupation exactly.','Filter the suspects table on occupation.','SELECT * FROM suspects WHERE occupation = \'Antiques Dealer\';'],100),
    ]
  },
  {
    id:2, num:'CASE FILE №2', title:'The Suspicious Employee', difficulty:'Beginner',
    concepts:['ORDER BY','LIMIT','LIKE','Comparisons'], est:'12 min',
    story:`One suspect's file stands out — but you'll need to sort, filter and narrow the list to see who.`,
    challenges:[
      ch('2a','ORDER BY','List all suspects older than 35, ordered from oldest to youngest.','SELECT * FROM suspects WHERE age > 35 ORDER BY age DESC;',
        ['Combine a WHERE filter with sorting.','age > 35, then ORDER BY age DESC.','SELECT * FROM suspects WHERE age > 35 ORDER BY age DESC;'],100),
      ch('2b','LIMIT','Find the 3 youngest suspects.','SELECT * FROM suspects ORDER BY age ASC LIMIT 3;',
        ['Sort ascending by age, then cap the results.','ORDER BY age ASC, then LIMIT 3.','SELECT * FROM suspects ORDER BY age ASC LIMIT 3;'],100),
      ch('2c','LIKE','Find suspects whose occupation contains the word \'Consultant\' or \'Curator\'.','SELECT * FROM suspects WHERE occupation LIKE \'%Consultant%\' OR occupation LIKE \'%Curator%\';',
        ['LIKE with % wildcards matches partial text.','Two LIKE conditions joined with OR.','SELECT * FROM suspects WHERE occupation LIKE \'%Consultant%\' OR occupation LIKE \'%Curator%\';'],100),
    ]
  },
  {
    id:3, num:'CASE FILE №3', title:'The Hidden Transaction', difficulty:'Intermediate',
    concepts:['SUM','AVG','GROUP BY','HAVING'], est:'15 min',
    story:`Bank records show unusual money movement around the night of the theft. Aggregate the transactions to see who's been spending big.`,
    challenges:[
      ch('3a','GROUP BY / SUM','Show each suspect_id with their total transaction amount.','SELECT suspect_id, SUM(amount) AS total FROM transactions GROUP BY suspect_id;',
        ['Group rows by suspect, then total the amounts.','GROUP BY suspect_id, SUM(amount).','SELECT suspect_id, SUM(amount) AS total FROM transactions GROUP BY suspect_id;'],100),
      ch('3b','HAVING','Find suspects whose total transactions exceed $100,000.','SELECT suspect_id, SUM(amount) AS total FROM transactions GROUP BY suspect_id HAVING SUM(amount) > 100000;',
        ['HAVING filters after grouping, unlike WHERE.','GROUP BY suspect_id, then HAVING SUM(amount) > 100000.','SELECT suspect_id, SUM(amount) AS total FROM transactions GROUP BY suspect_id HAVING SUM(amount) > 100000;'],100),
      ch('3c','AVG','Find the average transaction amount for each location.','SELECT location, AVG(amount) AS avg_amt FROM transactions GROUP BY location;',
        ['Group by location this time, not suspect.','GROUP BY location, AVG(amount).','SELECT location, AVG(amount) AS avg_amt FROM transactions GROUP BY location;'],100),
    ]
  },
  {
    id:4, num:'CASE FILE №4', title:'Connect the Clues', difficulty:'Intermediate',
    concepts:['INNER JOIN','LEFT JOIN'], est:'15 min',
    story:`Evidence means nothing without a name attached. Join the tables to connect physical clues to the people who left them.`,
    challenges:[
      ch('4a','INNER JOIN','List each piece of evidence with the suspect\'s name and evidence_type.','SELECT s.name, e.evidence_type, e.found_location FROM evidence e INNER JOIN suspects s ON e.suspect_id = s.suspect_id;',
        ['Join evidence to suspects on the shared suspect_id.','INNER JOIN suspects s ON e.suspect_id = s.suspect_id.','SELECT s.name, e.evidence_type, e.found_location FROM evidence e INNER JOIN suspects s ON e.suspect_id = s.suspect_id;'],100),
      ch('4b','LEFT JOIN','Show all suspects with their evidence type, including suspects with no evidence at all.','SELECT s.name, e.evidence_type FROM suspects s LEFT JOIN evidence e ON s.suspect_id = e.suspect_id;',
        ['LEFT JOIN keeps every row from the left table.','LEFT JOIN evidence e ON s.suspect_id = e.suspect_id.','SELECT s.name, e.evidence_type FROM suspects s LEFT JOIN evidence e ON s.suspect_id = e.suspect_id;'],100),
      ch('4c','JOIN','List camera sightings together with the occupation of the person seen (match cameras.person_seen to suspects.name).','SELECT c.location, c.timestamp, c.person_seen, s.occupation FROM cameras c INNER JOIN suspects s ON c.person_seen = s.name;',
        ['This time the join key is a name, not an id.','ON c.person_seen = s.name.','SELECT c.location, c.timestamp, c.person_seen, s.occupation FROM cameras c INNER JOIN suspects s ON c.person_seen = s.name;'],100),
    ]
  },
  {
    id:5, num:'CASE FILE №5', title:'The Secret Account', difficulty:'Advanced',
    concepts:['Subqueries'], est:'18 min',
    story:`Someone's spending is far above average. Use a subquery to compare each suspect against the crowd.`,
    challenges:[
      ch('5a','Subquery','Find every transaction with an amount greater than the average of all transactions.','SELECT * FROM transactions WHERE amount > (SELECT AVG(amount) FROM transactions);',
        ['Compute the average in a subquery first.','WHERE amount > (SELECT AVG(amount) FROM transactions).','SELECT * FROM transactions WHERE amount > (SELECT AVG(amount) FROM transactions);'],100),
      ch('5b','Subquery','Find the suspect_id and name of whoever made the single highest transaction.','SELECT suspect_id, name FROM suspects WHERE suspect_id = (SELECT suspect_id FROM transactions ORDER BY amount DESC LIMIT 1);',
        ['First find the suspect_id of the max transaction, then look up the name.','A subquery can return a single suspect_id to filter suspects.','SELECT suspect_id, name FROM suspects WHERE suspect_id = (SELECT suspect_id FROM transactions ORDER BY amount DESC LIMIT 1);'],100),
      ch('5c','Subquery / IN','Find suspects who have evidence located at \'Warehouse 7\'.','SELECT * FROM suspects WHERE suspect_id IN (SELECT suspect_id FROM evidence WHERE found_location = \'Warehouse 7\');',
        ['Use IN with a subquery that returns matching suspect_ids.','SELECT suspect_id FROM evidence WHERE found_location = \'Warehouse 7\'.','SELECT * FROM suspects WHERE suspect_id IN (SELECT suspect_id FROM evidence WHERE found_location = \'Warehouse 7\');'],100),
    ]
  },
  {
    id:6, num:'CASE FILE №6', title:'The Crime Network', difficulty:'Advanced',
    concepts:['CASE','Multi-table JOIN'], est:'20 min',
    story:`The network of accomplices is coming into focus. Classify the money and cross-reference cameras, evidence and transactions together.`,
    challenges:[
      ch('6a','CASE','Classify every transaction as \'High\' (amount > 100000), \'Medium\' (10000-100000) or \'Low\' (under 10000) in a column called risk_level.','SELECT transaction_id, amount, CASE WHEN amount > 100000 THEN \'High\' WHEN amount >= 10000 THEN \'Medium\' ELSE \'Low\' END AS risk_level FROM transactions;',
        ['CASE WHEN ... THEN ... lets you label rows conditionally.','Three branches: High, Medium, Low.','SELECT transaction_id, amount, CASE WHEN amount > 100000 THEN \'High\' WHEN amount >= 10000 THEN \'Medium\' ELSE \'Low\' END AS risk_level FROM transactions;'],100),
      ch('6b','Multi-JOIN','List each suspect\'s name together with their evidence_type and any camera location they were seen at.','SELECT s.name, e.evidence_type, c.location FROM suspects s LEFT JOIN evidence e ON s.suspect_id = e.suspect_id LEFT JOIN cameras c ON c.person_seen = s.name;',
        ['You need three tables in one query.','Two LEFT JOINs from suspects: one to evidence, one to cameras.','SELECT s.name, e.evidence_type, c.location FROM suspects s LEFT JOIN evidence e ON s.suspect_id = e.suspect_id LEFT JOIN cameras c ON c.person_seen = s.name;'],100),
      ch('6c','Advanced filter','Find suspects seen on camera at \'Warehouse 7\' who also made a transaction over $50,000.','SELECT DISTINCT s.name FROM suspects s INNER JOIN cameras c ON c.person_seen = s.name INNER JOIN transactions t ON t.suspect_id = s.suspect_id WHERE c.location = \'Warehouse 7\' AND t.amount > 50000;',
        ['This needs suspects joined to both cameras and transactions.','Filter on c.location and t.amount together.','SELECT DISTINCT s.name FROM suspects s INNER JOIN cameras c ON c.person_seen = s.name INNER JOIN transactions t ON t.suspect_id = s.suspect_id WHERE c.location = \'Warehouse 7\' AND t.amount > 50000;'],100),
    ]
  },
  {
    id:7, num:'CASE FILE №7', title:'The Final Investigation', difficulty:'Advanced',
    concepts:['CTE','Window Functions','RANK'], est:'20 min',
    story:`Almost there, detective. Rank the suspects by financial activity using modern SQL tools — CTEs and window functions.`,
    challenges:[
      ch('7a','CTE','Using a CTE named suspect_totals, list each suspect_id with their total transaction amount.','WITH suspect_totals AS (SELECT suspect_id, SUM(amount) AS total FROM transactions GROUP BY suspect_id) SELECT * FROM suspect_totals;',
        ['A CTE is a named temporary result set defined with WITH.','WITH suspect_totals AS (SELECT suspect_id, SUM(amount) AS total FROM transactions GROUP BY suspect_id).','WITH suspect_totals AS (SELECT suspect_id, SUM(amount) AS total FROM transactions GROUP BY suspect_id) SELECT * FROM suspect_totals;'],100),
      ch('7b','Window / RANK','Rank suspects by total transaction amount, highest first, using RANK() OVER.','WITH t AS (SELECT suspect_id, SUM(amount) AS total FROM transactions GROUP BY suspect_id) SELECT suspect_id, total, RANK() OVER (ORDER BY total DESC) AS rnk FROM t;',
        ['RANK() OVER (ORDER BY ...) assigns a rank based on a sort order.','Build the totals in a CTE first, then apply RANK() OVER (ORDER BY total DESC).','WITH t AS (SELECT suspect_id, SUM(amount) AS total FROM transactions GROUP BY suspect_id) SELECT suspect_id, total, RANK() OVER (ORDER BY total DESC) AS rnk FROM t;'],100),
      ch('7c','Window / ROW_NUMBER','For each suspect, number their transactions from newest to oldest using ROW_NUMBER() OVER, partitioned by suspect_id.','SELECT suspect_id, transaction_date, amount, ROW_NUMBER() OVER (PARTITION BY suspect_id ORDER BY transaction_date DESC) AS rn FROM transactions;',
        ['PARTITION BY resets the numbering for each suspect.','ROW_NUMBER() OVER (PARTITION BY suspect_id ORDER BY transaction_date DESC).','SELECT suspect_id, transaction_date, amount, ROW_NUMBER() OVER (PARTITION BY suspect_id ORDER BY transaction_date DESC) AS rn FROM transactions;'],100),
    ]
  },
];

const FINAL_CASE = {
  id:8, num:'FINAL CASE', title:'Crack the Mystery', difficulty:'Advanced',
  concepts:['Everything'], est:'20 min',
  story:`Every clue points somewhere. Write one query that proves it: find whoever was seen on camera at 'Warehouse 7', has evidence found at 'Warehouse 7', AND made a transaction over $200,000. There should be exactly one name left standing.`,
  challenge: ch('8a','Combine it all','Find the suspect name(s) who: appear on camera at \'Warehouse 7\' AND have evidence found at \'Warehouse 7\' AND made a transaction over $200,000.',
    `SELECT DISTINCT s.name FROM suspects s
     WHERE s.suspect_id IN (SELECT suspect_id FROM cameras c JOIN suspects s2 ON c.person_seen = s2.name WHERE c.location = 'Warehouse 7')
       AND s.suspect_id IN (SELECT suspect_id FROM evidence WHERE found_location = 'Warehouse 7')
       AND s.suspect_id IN (SELECT suspect_id FROM transactions WHERE amount > 200000);`,
    ['Three separate conditions must all be true for the same suspect_id.','Use three IN (subquery) conditions joined with AND, on suspects.suspect_id.','Intersect camera sightings, evidence, and transactions — all filtered to Warehouse 7 / $200,000 — on the same suspect_id.'], 300),
  answer:{ culprit:'Alex Morgan', location:'Warehouse 7', motive:'Financial Fraud', evidence:'Transaction #4821' }
};

const ACHIEVEMENTS = [
  {id:'first', icon:'🕵️', name:'First Case Solved', cond:s=>s.solvedChallenges.length>=1},
  {id:'speed', icon:'⚡', name:'Query Speedster', cond:s=>s.fastSolve},
  {id:'join', icon:'🔗', name:'JOIN Master', cond:s=>levelComplete(s,4)},
  {id:'agg', icon:'📊', name:'Aggregation Expert', cond:s=>levelComplete(s,3)},
  {id:'sub', icon:'🧠', name:'Subquery Specialist', cond:s=>levelComplete(s,5)},
  {id:'ninja', icon:'🔥', name:'SQL Ninja', cond:s=>s.streak>=5},
  {id:'crown', icon:'👑', name:'Database Detective', cond:s=>[1,2,3,4,5,6,7].every(id=>levelComplete(s,id))},
  {id:'master', icon:'💎', name:'Master Investigator', cond:s=>s.finalSolved},
];
function levelComplete(s, levelId){
  const lvl = LEVELS.find(l=>l.id===levelId);
  if(!lvl) return false;
  return lvl.challenges.every(c=>s.solvedChallenges.includes(c.id));
}
