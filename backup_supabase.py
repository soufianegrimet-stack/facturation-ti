import os, json, datetime, urllib.request

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

def fetch(table):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{table}?order=id",
        headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    )
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read())

today = datetime.date.today().strftime("%Y-%m-%d")
invoices = fetch("invoices")
clients = fetch("clients")
backup = {"date_backup": today, "nb_factures": len(invoices), "nb_clients": len(clients), "invoices": invoices, "clients": clients}
os.makedirs("backups", exist_ok=True)
with open(f"backups/backup_{today}.json", "w", encoding="utf-8") as f:
    json.dump(backup, f, ensure_ascii=False, indent=2, default=str)
print(f"Backup OK — {len(invoices)} factures | {len(clients)} clients | {today}")
