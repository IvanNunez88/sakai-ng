export interface Alumno {
    idAlumno: number;
    nombre: string;
    aPaterno: string;
    aMaterno: string;
    idCarrera: number;
    fecRegistro: string;
    carrera: string;
}

// Se usa para Crear y Actualizar (IdAlumno va en la ruta)
export interface AlumnoDTO {
    nombre: string;
    aPaterno: string;
    aMaterno: string;
    idCarrera: number;
}
