import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeLivre } from './liste-livre';

describe('ListeLivre', () => {
  let component: ListeLivre;
  let fixture: ComponentFixture<ListeLivre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeLivre]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeLivre);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
