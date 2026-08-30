update public.projects
set description_ro = convert_from(convert_to(description_ro, 'WIN1252'), 'UTF8')
where description_ro ~ U&'[\00C2\00C3\00C4\00C5\00C8]';
