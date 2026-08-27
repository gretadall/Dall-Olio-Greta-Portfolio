-- 0025's title match missed 6 live entries: four language entries carry a
-- flag emoji prefix, one title differs in capitalization/apostrophe style,
-- and one ("Tutti gli sport") didn't exist yet when 0025 was written.
-- Matched with ilike/wildcards to sidestep emoji/quote encoding issues.

update entries set brain_area = 'linguistic' where title ilike '%inglese';
update entries set brain_area = 'linguistic' where title ilike '%tedesco';
update entries set brain_area = 'linguistic' where title ilike '%spagnolo';
update entries set brain_area = 'linguistic' where title ilike '%francese';
update entries set brain_area = 'associative' where title ilike 'the first athlete%journal';
update entries set brain_area = 'motor' where title ilike 'tutti gli sport';
