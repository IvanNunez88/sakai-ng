import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ApiResponse } from '@/app/models/api-response.model';
import { Alumno, AlumnoDTO } from '@/app/models/alumno.model';
import { Carrera } from '@/app/models/carrera.model';
import { AlumnoService } from '@/app/services/alumno.service';
import { CarreraService } from '@/app/services/carrera.service';

@Component({
    selector: 'app-alumnos',
    standalone: true,
    imports: [DatePipe, FormsModule, TableModule, ButtonModule, ToastModule, 
              ToolbarModule, InputTextModule, SelectModule, DialogModule, 
              TagModule, InputIconModule, IconFieldModule, ConfirmDialogModule],
    templateUrl: './alumnos.html',
    styleUrl: './alumnos.scss',
    providers: [MessageService, ConfirmationService]
})
export class Alumnos implements OnInit {
    private readonly alumnoService = inject(AlumnoService);
    private readonly carreraService = inject(CarreraService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);

    alumnos = signal<Alumno[]>([]);
    // Opciones del select de carrera
    carreras = signal<Carrera[]>([]);
    cargando = signal(false);
    guardando = signal(false);
    dialogo = signal(false);
    enviado = signal(false);

    // null = alta, numero = edicion
    idEdicion: number | null = null;
    form: AlumnoDTO = this.formVacio();

    ngOnInit() {
        this.cargar();
        this.cargarCarreras();
    }

    cargar() {
        this.cargando.set(true);
        this.alumnoService.obtenerTodos().subscribe({
            next: (resp) => {
                this.cargando.set(false);
                if (resp.status) this.alumnos.set(resp.value ?? []);
                else this.aviso(resp.msg);
            },
            error: () => {
                this.cargando.set(false);
                this.errorConexion();
            }
        });
    }

    cargarCarreras() {
        this.carreraService.obtenerTodos().subscribe({
            next: (resp) => {
                if (resp.status) this.carreras.set(resp.value ?? []);
            },
            error: () => this.errorConexion()
        });
    }

    filtrar(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    nuevo() {
        this.idEdicion = null;
        this.form = this.formVacio();
        this.enviado.set(false);
        this.dialogo.set(true);
    }

    editar(alumno: Alumno) {
        this.idEdicion = alumno.idAlumno;
        this.form = { nombre: alumno.nombre, aPaterno: alumno.aPaterno, aMaterno: alumno.aMaterno, idCarrera: alumno.idCarrera };
        this.enviado.set(false);
        this.dialogo.set(true);
    }

    guardar() {
        this.enviado.set(true);
        if (!this.form.nombre.trim() || !this.form.aPaterno.trim() || !this.form.aMaterno.trim() || !this.form.idCarrera) return;

        // Crear regresa el id (number) y Actualizar un texto (string)
        const peticion: Observable<ApiResponse<number | string>> = this.idEdicion ? this.alumnoService.actualizar(this.idEdicion, this.form) : this.alumnoService.crear(this.form);

        this.guardando.set(true);
        peticion.subscribe({
            next: (resp) => {
                this.guardando.set(false);
                if (!resp.status) return this.aviso(resp.msg);

                this.exito(resp.msg || (typeof resp.value === 'string' ? resp.value : 'Alumno guardado'));
                this.dialogo.set(false);
                this.cargar();
            },
            error: () => {
                this.guardando.set(false);
                this.errorConexion();
            }
        });
    }

    eliminar(alumno: Alumno) {
        this.confirmationService.confirm({
            message: `¿Seguro que quieres eliminar a ${alumno.nombre} ${alumno.aPaterno}?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.alumnoService.eliminar(alumno.idAlumno).subscribe({
                    next: (resp) => {
                        if (!resp.status) return this.aviso(resp.msg);
                        this.exito(resp.value ?? 'Alumno eliminado');
                        this.cargar();
                    },
                    error: () => this.errorConexion()
                });
            }
        });
    }

    private formVacio(): AlumnoDTO {
        return { nombre: '', aPaterno: '', aMaterno: '', idCarrera: 0 };
    }

    private exito(detalle: string) {
        this.messageService.add({ severity: 'success', summary: 'Listo', detail: detalle, life: 3000 });
    }

    private aviso(detalle: string) {
        this.messageService.add({ severity: 'warn', summary: 'Atención', detail: detalle, life: 4000 });
    }

    private errorConexion() {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo conectar con la API', life: 4000 });
    }
}
