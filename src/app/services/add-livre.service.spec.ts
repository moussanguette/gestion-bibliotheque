import { TestBed } from '@angular/core/testing';

import { AddLivreService } from './add-livre.service';

describe('AddLivreService', () => {
  let service: AddLivreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddLivreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
