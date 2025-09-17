import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutLivreComponent } from './ajout-livre.component';

describe('AjoutLivreComponent', () => {
  let component: AjoutLivreComponent;
  let fixture: ComponentFixture<AjoutLivreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjoutLivreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjoutLivreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
