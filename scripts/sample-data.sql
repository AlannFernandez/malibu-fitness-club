-- Datos de ejemplo para testing

-- Insertar usuarios de ejemplo (estos se crearán automáticamente con el trigger)
-- Pero podemos insertar datos adicionales

-- Insertar ejercicios de ejemplo
INSERT INTO public.exercises (name, description, category, difficulty, equipment, muscle_groups, sets_suggested, reps_suggested, rest_time, created_by) VALUES
('Press Banca con Barra', 'Ejercicio fundamental para el desarrollo del pecho. Acostado en banco, bajar la barra hasta el pecho y empujar hacia arriba.', 'fuerza', 'intermedio', 'barra', ARRAY['Pecho', 'Tríceps', 'Hombros'], '3-4', '8-12', '2-3 min', (SELECT id FROM public.users WHERE role = 'teacher' LIMIT 1)),
('Sentadilla con Barra', 'Ejercicio compuesto para piernas. Con la barra en los hombros, bajar manteniendo la espalda recta hasta que los muslos estén paralelos al suelo.', 'fuerza', 'intermedio', 'barra', ARRAY['Cuádriceps', 'Glúteos', 'Core'], '3-4', '8-15', '2-3 min', (SELECT id FROM public.users WHERE role = 'teacher' LIMIT 1)),
('Dominadas', 'Ejercicio de tracción para espalda. Colgado de una barra, subir el cuerpo hasta que la barbilla pase la barra.', 'fuerza', 'avanzado', 'barra-dominadas', ARRAY['Espalda', 'Bíceps'], '3-4', '5-12', '2-3 min', (SELECT id FROM public.users WHERE role = 'teacher' LIMIT 1)),
('Plancha', 'Ejercicio isométrico para core. Mantener posición de flexión apoyado en antebrazos.', 'core', 'principiante', 'peso-corporal', ARRAY['Core', 'Hombros'], '3', '30-60s', '60s', (SELECT id FROM public.users WHERE role = 'teacher' LIMIT 1)),
('Burpees', 'Ejercicio cardiovascular completo. Combinación de sentadilla, plancha, flexión y salto.', 'cardio', 'intermedio', 'peso-corporal', ARRAY['Full Body'], '3-4', '10-20', '60-90s', (SELECT id FROM public.users WHERE role = 'teacher' LIMIT 1));

-- Insertar membresías de ejemplo
INSERT INTO public.memberships (user_id, status, start_date, end_date, monthly_fee)
SELECT
    id,
    CASE
        WHEN RANDOM() > 0.8 THEN 'expired'
        WHEN RANDOM() > 0.9 THEN 'pending'
        ELSE 'active'
    END,
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '30 days',
    CASE
        WHEN RANDOM() > 0.5 THEN 45.00
        ELSE 55.00
    END
FROM public.users
WHERE role = 'student';

-- Insertar algunos pagos de ejemplo
INSERT INTO public.payments (membership_id, user_id, amount, payment_date, payment_method, status)
SELECT
    m.id,
    m.user_id,
    m.monthly_fee,
    CURRENT_DATE - INTERVAL '15 days',
    'card',
    'completed'
FROM public.memberships m
WHERE m.status = 'active'
LIMIT 5;

-- Insertar asistencia de ejemplo
INSERT INTO public.attendance (user_id, check_in_time, check_out_time, date)
SELECT
    u.id,
    CURRENT_DATE + TIME '09:00:00' + (RANDOM() * INTERVAL '8 hours'),
    CURRENT_DATE + TIME '10:30:00' + (RANDOM() * INTERVAL '8 hours'),
    CURRENT_DATE - (RANDOM() * INTERVAL '7 days')::INTEGER
FROM public.users u
WHERE u.role = 'student'
AND RANDOM() > 0.3; -- 70% de probabilidad de asistencia

-- Insertar objetivos de ejemplo
INSERT INTO public.user_goals (user_id, goal_type, target_value, current_value, unit, target_date, status)
SELECT
    id,
    CASE
        WHEN RANDOM() > 0.7 THEN 'weight_loss'
        WHEN RANDOM() > 0.5 THEN 'muscle_gain'
        ELSE 'strength'
    END,
    CASE
        WHEN RANDOM() > 0.5 THEN 70.0
        ELSE 80.0
    END,
    CASE
        WHEN RANDOM() > 0.5 THEN 75.0
        ELSE 85.0
    END,
    'kg',
    CURRENT_DATE + INTERVAL '90 days',
    'active'
FROM public.users
WHERE role = 'student';
