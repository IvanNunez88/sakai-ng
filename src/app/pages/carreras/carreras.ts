import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ApiResponse } from '@/app/models/api-response.model';
import { Carrera, CarreraDTO } from '@/app/models/carrera.model';
import { CarreraService } from '@/app/services/carrera.service';

@Component({
    selector: 'app-carreras',
    standalone: true,
    imports: [FormsModule, TableModule, ButtonModule, ToastModule, ToolbarModule, InputTextModule, DialogModule, InputIconModule, IconFieldModule, ConfirmDialogModule],
    templateUrl: './carreras.html',
    styleUrl: './carreras.scss',
    providers: [MessageService, ConfirmationService]
})
export class Carreras implements OnInit {
    private readonly carreraService = inject(CarreraService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);

    carreras = signal<Carrera[]>([]);
    cargando = signal(false);
    guardando = signal(false);
    dialogo = signal(false);
    enviado = signal(false);

    // null = alta, numero = edicion
    idEdicion: number | null = null;
    form: CarreraDTO = { descripcion: '' };

    ngOnInit() {
        this.cargar();
    }

    cargar() {
        this.cargando.set(true);
        this.carreraService.obtenerTodos().subscribe({
            next: (resp) => {
                this.cargando.set(false);
                if (resp.status) this.carreras.set(resp.value ?? []);
                else this.aviso(resp.msg);
            },
            error: () => {
                this.cargando.set(false);
                this.errorConexion();
            }
        });
    }

    filtrar(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    nuevo() {
        this.idEdicion = null;
        this.form = { descripcion: '' };
        this.enviado.set(false);
        this.dialogo.set(true);
    }

    editar(carrera: Carrera) {
        this.idEdicion = carrera.idCarrera;
        this.form = { descripcion: carrera.descripcion };
        this.enviado.set(false);
        this.dialogo.set(true);
    }

    guardar() {
        this.enviado.set(true);
        if (!this.form.descripcion.trim()) return;

        // Crear regresa el id (number) y Actualizar un texto (string)
        const peticion: Observable<ApiResponse<number | string>> = this.idEdicion ? this.carreraService.actualizar(this.idEdicion, this.form) : this.carreraService.crear(this.form);

        this.guardando.set(true);
        peticion.subscribe({
            next: (resp) => {
                this.guardando.set(false);
                if (!resp.status) return this.aviso(resp.msg);

                this.exito(resp.msg || (typeof resp.value === 'string' ? resp.value : 'Carrera guardada'));
                this.dialogo.set(false);
                this.cargar();
            },
            error: () => {
                this.guardando.set(false);
                this.errorConexion();
            }
        });
    }

    eliminar(carrera: Carrera) {
        this.confirmationService.confirm({
            message: `¿Seguro que quieres eliminar la carrera ${carrera.descripcion}?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.carreraService.eliminar(carrera.idCarrera).subscribe({
                    next: (resp) => {
                        if (!resp.status) return this.aviso(resp.msg);
                        this.exito(resp.value ?? 'Carrera eliminada');
                        this.cargar();
                    },
                    error: () => this.errorConexion()
                });
            }
        });
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
