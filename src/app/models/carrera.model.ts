export interface Carrera {
    idCarrera: number;
    descripcion: string;
}

// Se usa para Crear y Actualizar (IdCarrera va en la ruta)
export interface CarreraDTO {
    descripcion: string;
}
