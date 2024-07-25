import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be open', () => {
    component.open();
    const container = fixture.debugElement.nativeElement.querySelector('.container');
    expect(container.style.display).toEqual('block');
  });

  it('should be close', () => {
    component.close();
    const container = fixture.debugElement.nativeElement.querySelector('.container');
    expect(container.style.display).toEqual('none');
  });

  it('should emit cancel', () => {
    spyOn(component.cancel, 'emit');
    const button = fixture.debugElement.nativeElement.querySelector('.cancel');
    button.dispatchEvent(new Event('click'));
    expect(component.cancel.emit).toHaveBeenCalledTimes(1);
  });

  it('should emit confirm', () => {
    spyOn(component.confirm, 'emit');
    const button = fixture.debugElement.nativeElement.querySelector('.confirm');
    button.dispatchEvent(new Event('click'));
    expect(component.confirm.emit).toHaveBeenCalledTimes(1);
  });
});
