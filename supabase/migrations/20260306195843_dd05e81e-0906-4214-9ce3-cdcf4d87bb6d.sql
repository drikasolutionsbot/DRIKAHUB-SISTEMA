ALTER TABLE public.landing_config 
ADD COLUMN IF NOT EXISTS efi_cert_pem text,
ADD COLUMN IF NOT EXISTS efi_key_pem text;