export interface Exercise {
    name: string;
    description: string;
    category: Category;
    difficulty: Dificulty
    equipment: Equipament;
    muscle_groups: [];
    sets_suggested : string,
    reps_suggested : string,
    rest_time : string,
    notes : string | null,
    created_by : string | null,
}

type Dificulty = 'principiante' | 'intermedio' | 'avanzado';

type Category = 'fuerza' | 'cardio' | 'funcional' | 'flexibilidad';

type Equipament = 'peso corporal' | 'mancuernas' | 'barra' | 'kettlebell' | 'banda elastica';