import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterLivre } from './ajouter-livre';

describe('AjouterLivre', () => {
  let component: AjouterLivre;
  let fixture: ComponentFixture<AjouterLivre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjouterLivre]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjouterLivre);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
