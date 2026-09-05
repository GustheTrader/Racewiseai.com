GRANT SELECT, INSERT, UPDATE, DELETE ON public.scrape_jobs TO authenticated;
GRANT ALL ON public.scrape_jobs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scrape_schedule_config TO authenticated;
GRANT ALL ON public.scrape_schedule_config TO service_role;