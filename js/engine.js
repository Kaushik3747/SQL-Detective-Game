/* =========================================================================
   DB INIT
   ========================================================================= */
async function initDb(){
  const SQL = await initSqlJs({ locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${f}` });
  db = new SQL.Database();
  db.run(SCHEMA_SQL);
}
function runSql(sql){
  try{
    const res = db.exec(sql);
    if(res.length===0) return {columns:[], rows:[], raw:true};
    return {columns:res[0].columns, rows:res[0].values};
  }catch(e){
    return {error: e.message};
  }
}
function normalizeResult(cols, rows){
  const norm = rows.map(r => r.map(v=>String(v)).sort().join('~'));
  norm.sort();
  return norm.join('\\n');
}
function getExpected(challenge){
  if(challenge.expected) return challenge.expected;
  const r = runSql(challenge.solution);
  challenge.expected = r.error ? null : normalizeResult(r.columns, r.rows);
  return challenge.expected;
}
