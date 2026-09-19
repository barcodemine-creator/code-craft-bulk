ALTER TABLE public.barcode_ranges
  ADD CONSTRAINT barcode_ranges_start_text_format CHECK (start_number ~ '^(\d{7}|\d{8}|\d{11}|\d{12}|\d{13})$'),
  ADD CONSTRAINT barcode_ranges_end_text_format CHECK (end_number ~ '^(\d{7}|\d{8}|\d{11}|\d{12}|\d{13})$');

ALTER TABLE public.orders
  ADD CONSTRAINT orders_start_text_format CHECK (start_number ~ '^(\d{8}|\d{12}|\d{13})$'),
  ADD CONSTRAINT orders_end_text_format CHECK (end_number ~ '^(\d{8}|\d{12}|\d{13})$');

ALTER TABLE public.order_barcodes
  ADD CONSTRAINT order_barcodes_text_format CHECK (barcode_number ~ '^(\d{8}|\d{12}|\d{13})$');

ALTER TABLE public.gepir_registry
  ADD CONSTRAINT gepir_registry_text_format CHECK (barcode_number ~ '^(\d{8}|\d{12}|\d{13})$');