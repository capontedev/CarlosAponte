import { CommonModule } from "@angular/common";
import { Component, ViewChild, ElementRef, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: 'app-modal',
  template: `
    <div 
      #modal 
      class="container" 
      (click)="close()"
      (keydown.enter)="close()" 
      tabindex="0">
      <div 
        class="content"  
        (click)="$event.stopPropagation()" 
        (keydown.enter)="$event.stopPropagation()" 
        tabindex="0">
        <span>¿Estas seguro de eliminar el producto {{name}}?</span>
        <div class="actions">
          <button (click)="onCancel()" type="button" class="separator cancel">Cancelar</button>
          <button (click)="onConfirm()" type="button" class="confirm">Confirmar</button>
        </div>
      </div>
    </div>
    `,
  styleUrl: "./modal.component.scss",
  standalone: true,
  imports: [
    CommonModule,
  ],
})
export class ModalComponent {
  @ViewChild("modal", { static: false }) modal?: ElementRef;

  @Input() name?: string;
  @Output() cancel: EventEmitter<void> = new EventEmitter();
  @Output() confirm: EventEmitter<void> = new EventEmitter();

  open() {
    this.modal!.nativeElement.style.display = "block";
  }

  close() {
    this.modal!.nativeElement.style.display = "none";
  }

  onCancel() {
    this.cancel.emit();
    this.close();
  }

  onConfirm() {
    this.confirm.emit();
    this.close();
  }
}
