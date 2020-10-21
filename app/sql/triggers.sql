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

CREATE OR REPLACE FUNCTION check_period()
    RETURNS TRIGGER AS
    $$ DECLARE ctx INTEGER;
    BEGIN
        SELECT COUNT(*) INTO ctx
        FROM period p
        WHERE NEW.start_date = p.start_date
            AND NEW.end_date = p.end_date;
        IF ctx > 0 THEN
            RETURN NULL;
        ELSE
            RETURN NEW;
        END IF;
    END;
    $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_period ON period;
CREATE TRIGGER add_period
BEFORE INSERT ON period
FOR EACH ROW EXECUTE PROCEDURE check_period();

CREATE OR REPLACE FUNCTION check_bid()
    RETURNS TRIGGER AS
    $$ DECLARE ctx INTEGER;
    DECLARE ft INTEGER;
    DECLARE ok INTEGER;
    DECLARE rating INTEGER;
    BEGIN
        SELECT COUNT(*) INTO ctx
        FROM take_care t
        WHERE t.username = NEW.username
            AND t.name = NEW.name
            AND ((t.start_date >= NEW.start_date AND t.start_date <= NEW.end_date)
            OR (t.end_date >= NEW.start_date AND t.end_date <= NEW.end_date));

        IF ctx > 0 THEN
            RAISE EXCEPTION 'WRONG PERIOD';
        ELSE
            SELECT COUNT(*) INTO ft
            FROM full_time
            WHERE username = NEW.ctuname;

            SELECT COUNT(*) INTO ok
            FROM take_care t
            WHERE t.ctuname = NEW.ctuname
                AND ((t.start_date >= NEW.start_date AND t.start_date <= NEW.end_date)
                    OR (t.end_date >= NEW.start_date AND t.end_date <= NEW.end_date));
            IF ft > 0 THEN
         		IF ok < 5 THEN
         		    RETURN NEW;
         		ELSE
         		    RAISE EXCEPTION 'EXCEED 5 FT';
         		END IF;
            ELSE
                SELECT AVG(t.rating) INTO rating
                FROM take_care t
                GROUP BY t.ctuname
                HAVING t.ctuname = NEW.ctuname;
                IF rating < 4 AND ok < 2 THEN
                    RETURN NEW;
                ELSIF rating >= 4 AND ok < 5 THEN
                    RETURN NEW;
                ELSE
                    RAISE EXCEPTION 'EXCEED 2 OR 5 PT';
                END IF;
            END IF;
        END IF;
    END;
    $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_bid ON take_care;
CREATE TRIGGER add_bid
BEFORE INSERT ON take_care
FOR EACH ROW EXECUTE PROCEDURE check_bid();