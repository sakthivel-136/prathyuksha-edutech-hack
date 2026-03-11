ALTER TABLE public.seat_allocations ALTER COLUMN row_number DROP NOT NULL;
ALTER TABLE public.seat_allocations ALTER COLUMN col_number DROP NOT NULL;
NOTIFY pgrst, 'reload schema';
