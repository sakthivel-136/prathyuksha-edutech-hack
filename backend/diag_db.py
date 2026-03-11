
import asyncio
from auth import supabase as sb

async def check():
    try:
        res = sb.table('hall_ticket_publish').select('*').limit(1).execute()
        print(f"SUCCESS: Connected to hall_ticket_publish. Columns available: {list(res.data[0].keys()) if res.data else 'Table is empty'}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(check())
