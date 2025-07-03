export interface Exercise {
    name: string;
    description: string;
    category: 'fuerza' | 'cardio' | 'funcional' | 'flexibilidad';
    difficulty:'principiante' | 'intermedio' | 'avanzado';
    equipment: 'peso corporal' | 'mancuernas' | 'barra' | 'kettlebell' | 'banda elastica';
    muscle_groups: [];
    sets_suggested : string,
    reps_suggested : string,
    rest_time : string,
    notes : string | null,
    created_by : string | null,
}

