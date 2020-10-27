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

CREATE OR REPLACE FUNCTION check_leave()
    RETURNS TRIGGER AS
    $$ DECLARE ctx_a INTEGER;
    DECLARE ctx_c INTEGER;
    BEGIN
        SELECT COUNT(*) INTO ctx_a
        FROM apply_leave a
        WHERE NEW.username = a.username;

        SELECT COUNT(*) INTO ctx_c
        FROM part_time p
        WHERE NEW.username = p.username;

        IF ctx_a > 65 THEN
            RAISE EXCEPTION 'Cannot Apply for more leave';
        ELSE
            IF ctx_c > 0 THEN
                RAISE EXCEPTION 'Only full timer need to apply for leave';
            ELSE
                RETURN NEW;
            END IF;
        END IF;
    END;
    $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS applyleave ON apply_leave;
CREATE TRIGGER applyleave
BEFORE INSERT ON apply_leave
FOR EACH ROW EXECUTE PROCEDURE check_leave();

CREATE OR REPLACE FUNCTION check_caretaker()
    RETURNS TRIGGER AS
    $$ DECLARE ctx_a INTEGER;
    DECLARE ctx_c INTEGER;
    BEGIN
        SELECT COUNT(*) INTO ctx_a
        FROM pcs_admin a
        WHERE NEW.username = a.username;

        SELECT COUNT(*) INTO ctx_c
        FROM care_taker c
        WHERE NEW.username = c.username;

        IF ctx_a > 0 THEN
            RAISE EXCEPTION 'Admin cannot be a care taker!';
        ELSE
            IF ctx_c > 0 THEN
                RAISE EXCEPTION 'This care taker already exists!';
            ELSE
                RETURN NEW;
            END IF;
        END IF;
    END;
    $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_caretaker ON care_taker;
CREATE TRIGGER add_caretaker
BEFORE INSERT ON care_taker
FOR EACH ROW EXECUTE PROCEDURE check_caretaker();

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
    DECLARE cat INTEGER;
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
            RAISE EXCEPTION 'Clash with existing orders!';
        ELSE
            SELECT COUNT(*) INTO cat
            FROM own_pet_belong o
            WHERE o.username = NEW.username
                AND o.name = NEW.name
                AND o.type IN (SELECT c.type
                                FROM can_care c
                                WHERE c.username = NEW.ctuname);

            IF cat = 0 THEN
                RAISE EXCEPTION 'Sorry... Care taker cannot care for pet type. Please choose another caretaker.';
            ELSE
                SELECT COUNT(*) INTO ok
                FROM take_care t
                WHERE t.ctuname = NEW.ctuname
                    AND ((t.start_date >= NEW.start_date AND t.start_date <= NEW.end_date)
                        OR (t.end_date >= NEW.start_date AND t.end_date <= NEW.end_date));
                IF (NEW.ctuname IN (SELECT * FROM full_time)) THEN
                    IF 1 = (SELECT 1 FROM apply_leave a WHERE a.username = NEW.ctuname AND (a.date >= NEW.start_date AND a.date <= NEW.end_date)) THEN
                        RAISE EXCEPTION 'Caretaker is on leave.';
                    END IF;
                    IF ok < 5 THEN
                        RETURN NEW;
                    ELSE
                        RAISE EXCEPTION 'Sorry... Care taker not available. Please choose another caretaker.';
                    END IF;
                ELSE
                    SELECT AVG(t.rating) INTO rating
                    FROM take_care t
                    WHERE t.ctuname = NEW.ctuname;
                    IF (rating IS NULL OR rating < 4) AND ok < 2 THEN
                        RETURN NEW;
                    ELSIF rating >= 4 AND ok < 5 THEN
                        RETURN NEW;
                    ELSE
                        RAISE EXCEPTION 'Sorry... Care taker not available. Please choose another caretaker.';
                    END IF;
                END IF;
            END IF;
        END IF;
    END;
    $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_bid ON take_care;
CREATE TRIGGER add_bid
BEFORE INSERT ON take_care
FOR EACH ROW EXECUTE PROCEDURE check_bid();
