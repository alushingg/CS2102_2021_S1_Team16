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

CREATE OR REPLACE FUNCTION check_leave()
    RETURNS TRIGGER AS
    $$ DECLARE yr INTEGER;
    DECLARE ctx_a1 INTEGER;
    DECLARE ctx_a2 INTEGER;
    DECLARE prev DATE;
    DECLARE i INTEGER;
    DECLARE d DATE;
    DECLARE ctx INTEGER := 0;
    
    BEGIN
        IF NEW.username IN (SELECT * FROM part_time) THEN
            RAISE EXCEPTION 'Only full timer need to apply for leave!';
        ELSIF NEW.date IN (SELECT date FROM apply_leave a WHERE a.username = NEW.username) THEN
            RAISE EXCEPTION 'Leave already applied on this date!';
        ELSIF 1 = (SELECT 1 FROM take_care t WHERE NEW.username = t.ctuname AND (NEW.date >= t.start_date AND NEW.date <= t.end_date)) THEN
            RAISE EXCEPTION 'There is a job on this date!';
        ELSE
            yr := EXTRACT(year FROM NEW.date);
        
            /* find number of leave before NEW.date */
            SELECT COUNT(*) INTO ctx_a1
            FROM apply_leave a
            WHERE NEW.username = a.username
                AND EXTRACT(year FROM a.date) = yr
                AND NEW.date - a.date > 0;

            /* find number of leave after NEW.date */
            SELECT COUNT(*) INTO ctx_a2
            FROM apply_leave a
            WHERE NEW.username = a.username
                AND EXTRACT(year FROM a.date) = yr
                AND NEW.date - a.date < 0;

            prev := DATE(yr::TEXT || '-01-01');
            i := 0;
            LOOP
                EXIT WHEN i = ctx_a1;
                d := (SELECT a.date FROM apply_leave a WHERE NEW.username = a.username AND EXTRACT(year FROM a.date) = yr AND NEW.date - a.date > 0 ORDER BY a.date ASC LIMIT 1 OFFSET i);
                IF (d - prev - 1) >= 300 THEN
                    ctx := ctx + 2;
                ELSIF (d - prev - 1) >= 150 THEN
                    ctx := ctx + 1;
                END IF;
                prev := d;
                i := i + 1;
            END LOOP;
            IF (NEW.date - prev - 1) >= 300 THEN
                ctx := ctx + 2;
            ELSIF (NEW.date - prev - 1) >= 150 THEN
                ctx := ctx + 1;
            END IF;

            prev := NEW.date;
            i := 0;
            LOOP
                EXIT WHEN i = ctx_a2;
                d := (SELECT a.date FROM apply_leave a WHERE NEW.username = a.username AND EXTRACT(year FROM a.date) = yr AND NEW.date - a.date < 0 ORDER BY a.date ASC LIMIT 1 OFFSET i);
                IF (d - prev - 1) >= 300 THEN
                    ctx := ctx + 2;
                ELSIF (d - prev - 1) >= 150 THEN
                    ctx := ctx + 1;
                END IF;
                prev := d;
                i := i + 1;
            END LOOP;
            IF (DATE(yr::TEXT || '-12-31') - prev - 1) >= 300 THEN
                ctx := ctx + 2;
            ELSIF (DATE(yr::TEXT || '-12-31') - prev - 1) >= 150 THEN
                ctx := ctx + 1;
            END IF;

            IF ctx < 2 THEN
                RAISE EXCEPTION 'Cannot Apply for leave! 2 * 150 consecutive working days in a year not met!';
            ELSE
                RETURN NEW;
            END IF;
        END IF;
    END;
    $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_leave ON apply_leave;
CREATE TRIGGER add_leave
BEFORE INSERT ON apply_leave
FOR EACH ROW EXECUTE PROCEDURE check_leave();

CREATE OR REPLACE FUNCTION check_availability()
    RETURNS TRIGGER AS
    $$ DECLARE ctx INTEGER;
    BEGIN
        IF NEW.username IN (SELECT * FROM full_time) THEN
            RAISE EXCEPTION 'Only part timer need to specify availability!';
        ELSE
            SELECT COUNT(*) INTO ctx
            FROM specify_availability sa
            WHERE NEW.username = sa.username
                AND NEW.date = sa.date;
            IF ctx > 0 THEN
                RAISE EXCEPTION 'Availability already specified on this date!';
            ELSE
              RETURN NEW;
            END IF;
        END IF;
    END;
    $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_availability ON specify_availability;
CREATE TRIGGER add_availability
BEFORE INSERT ON specify_availability
FOR EACH ROW EXECUTE PROCEDURE check_availability();

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

CREATE OR REPLACE FUNCTION check_type()
    RETURNS TRIGGER AS
    $$ DECLARE ctx INTEGER;
    BEGIN
        SELECT COUNT(*) INTO ctx
        FROM can_care c
        WHERE NEW.username = c.username
            AND NEW.type = c.type;
        IF ctx > 0 THEN
            RAISE EXCEPTION 'You can already care for this type!';
        ELSE
            RETURN NEW;
        END IF;
    END;
    $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_type ON can_care;
CREATE TRIGGER add_type
BEFORE INSERT ON can_care
FOR EACH ROW EXECUTE PROCEDURE check_type();

CREATE OR REPLACE FUNCTION check_petowner()
    RETURNS TRIGGER AS
    $$ DECLARE ctx_a INTEGER;
    DECLARE ctx_p INTEGER;
    BEGIN
        SELECT COUNT(*) INTO ctx_a
        FROM pcs_admin a
        WHERE NEW.username = a.username;

        SELECT COUNT(*) INTO ctx_p
        FROM pet_owner p
        WHERE NEW.username = p.username;

        IF ctx_a > 0 THEN
            RAISE EXCEPTION 'Admin cannot be a pet owner!';
        ELSE
            IF ctx_p > 0 THEN
                RAISE EXCEPTION 'This pet owner already exists!';
            ELSE
                RETURN NEW;
            END IF;
        END IF;
    END;
    $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_petowner ON pet_owner;
CREATE TRIGGER add_petowner
BEFORE INSERT ON pet_owner
FOR EACH ROW EXECUTE PROCEDURE check_petowner();

CREATE OR REPLACE FUNCTION check_price()
    RETURNS TRIGGER AS
    $$ DECLARE baseprice INTEGER;
    DECLARE rating INTEGER;
    BEGIN
        SELECT AVG(t.rating) INTO rating
        FROM take_care t
        WHERE t.ctuname = NEW.username;
        
        SELECT c.base_price INTO baseprice
        FROM category c
        WHERE c.type = NEW.type;
        
        IF rating >= 4 AND (NEW.price IS NULL OR NEW.price >= baseprice) THEN
            RETURN NEW;
        ELSIF (rating < 4 OR rating IS NULL) AND NEW.price IS NULL THEN
            RETURN NEW;
        ELSIF (rating < 4 OR rating IS NULL) THEN
            RAISE EXCEPTION 'Your rating is too low!';
        ELSE
            RAISE EXCEPTION 'Price should be higher than base price $%!', baseprice;
        END IF;
    END;
    $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_price on can_care; 
CREATE TRIGGER add_price
BEFORE INSERT OR UPDATE ON can_care
FOR EACH ROW EXECUTE PROCEDURE check_price();
