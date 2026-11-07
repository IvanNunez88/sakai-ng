export interface Maestro {
    idMaestro: number;
    nombre: string;
    aPaterno: string;
    aMaterno: string;
    fecRegistro: string;
}

// Se usa para Crear y Actualizar (IdMaestro va en la ruta)
export interface MaestroDTO {
    nombre: string;
    aPaterno: string;
    aMaterno: string;
}
