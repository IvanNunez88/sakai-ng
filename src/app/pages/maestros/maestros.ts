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
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ApiResponse } from '@/app/models/api-response.model';
import { Maestro, MaestroDTO } from '@/app/models/maestro.model';
import { MaestroService } from '@/app/services/maestro.service';

@Component({
    selector: 'app-maestros',
    standalone: true,
    imports: [DatePipe, FormsModule, TableModule, ButtonModule, ToastModule, ToolbarModule, InputTextModule, DialogModule, InputIconModule, IconFieldModule, ConfirmDialogModule],
    templateUrl: './maestros.html',
    styleUrl: './maestros.scss',
    providers: [MessageService, ConfirmationService]
})
export class Maestros implements OnInit {
    private readonly maestroService = inject(MaestroService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);

    maestros = signal<Maestro[]>([]);
    cargando = signal(false);
    guardando = signal(false);
    dialogo = signal(false);
    enviado = signal(false);

    // null = alta, numero = edicion
    idEdicion: number | null = null;
    form: MaestroDTO = this.formVacio();

    ngOnInit() {
        this.cargar();
    }

    cargar() {
        this.cargando.set(true);
        this.maestroService.obtenerTodos().subscribe({
            next: (resp) => {
                this.cargando.set(false);
                if (resp.status) this.maestros.set(resp.value ?? []);
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
        this.form = this.formVacio();
        this.enviado.set(false);
        this.dialogo.set(true);
    }

    editar(maestro: Maestro) {
        this.idEdicion = maestro.idMaestro;
        this.form = { nombre: maestro.nombre, aPaterno: maestro.aPaterno, aMaterno: maestro.aMaterno };
        this.enviado.set(false);
        this.dialogo.set(true);
    }

    guardar() {
        this.enviado.set(true);
        if (!this.form.nombre.trim() || !this.form.aPaterno.trim() || !this.form.aMaterno.trim()) return;

        // Crear regresa el id (number) y Actualizar un texto (string)
        const peticion: Observable<ApiResponse<number | string>> = this.idEdicion ? this.maestroService.actualizar(this.idEdicion, this.form) : this.maestroService.crear(this.form);

        this.guardando.set(true);
        peticion.subscribe({
            next: (resp) => {
                this.guardando.set(false);
                if (!resp.status) return this.aviso(resp.msg);

                this.exito(resp.msg || (typeof resp.value === 'string' ? resp.value : 'Maestro guardado'));
                this.dialogo.set(false);
                this.cargar();
            },
            error: () => {
                this.guardando.set(false);
                this.errorConexion();
            }
        });
    }

    eliminar(maestro: Maestro) {
        this.confirmationService.confirm({
            message: `¿Seguro que quieres eliminar a ${maestro.nombre} ${maestro.aPaterno}?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.maestroService.eliminar(maestro.idMaestro).subscribe({
                    next: (resp) => {
                        if (!resp.status) return this.aviso(resp.msg);
                        this.exito(resp.value ?? 'Maestro eliminado');
                        this.cargar();
                    },
                    error: () => this.errorConexion()
                });
            }
        });
    }

    private formVacio(): MaestroDTO {
        return { nombre: '', aPaterno: '', aMaterno: '' };
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
