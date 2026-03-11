
import psycopg2
import logging

logging.basicConfig(level=logging.INFO)

def check_schema():
    conn_params = {
        'dbname': 'postgres',
        'user': 'postgres',
        'password': r'$7VPyJLRc%z#6#?',
        'host': 'db.dxnekibukrxopunrtjgk.supabase.co',
        'port': 5432
    }
    try:
        conn = psycopg2.connect(**conn_params)
        cur = conn.cursor()
        
        # Check if table exists
        cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hall_ticket_publish');")
        exists = cur.fetchone()[0]
        logging.info(f"Table 'hall_ticket_publish' exists: {exists}")
        
        if exists:
            cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'hall_ticket_publish';")
            columns = cur.fetchall()
            logging.info("Table columns:")
            for col in columns:
                logging.info(f" - {col[0]}: {col[1]}")
        else:
            logging.warning("Table 'hall_ticket_publish' does NOT exist.")
            
        cur.close()
        conn.close()
    except Exception as e:
        logging.error(f"Error checking schema: {e}")

if __name__ == "__main__":
    check_schema()
