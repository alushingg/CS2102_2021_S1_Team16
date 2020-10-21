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

CREATE OR REPLACE FUNCTION check_user()
    RETURNS TRIGGER AS
    $$ DECLARE ctx INTEGER;
    BEGIN
        SELECT COUNT(*) INTO ctx
        FROM users u
        WHERE NEW.username = u.username;
        IF ctx > 0 THEN
            RAISE EXCEPTION 'This user already exists!';
        ELSE
            RETURN NEW;
        END IF;
    END;
    $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_user ON users;
CREATE TRIGGER add_user
BEFORE INSERT ON users
FOR EACH ROW EXECUTE PROCEDURE check_user();