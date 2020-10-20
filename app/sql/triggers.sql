CREATE OR REPLACE FUNCTION check_pet()
    RETURNS TRIGGER AS
    $$ DECLARE ctx INTEGER;
    BEGIN
        SELECT COUNT(*) INTO ctx
        FROM own_pet_belong o
        WHERE NEW.username = o.username
            AND NEW.name = o.name;
        IF ctx > 0 THEN
            RAISE EXCEPTION 'This pet already exists!';
        ELSE
            RETURN NEW;
        END IF;
    END;
    $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_pet ON own_pet_belong;
CREATE TRIGGER add_pet
BEFORE INSERT ON own_pet_belong
FOR EACH ROW EXECUTE PROCEDURE check_pet();
