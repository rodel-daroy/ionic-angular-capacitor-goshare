import { TestBed } from '@angular/core/testing';

import { FunctionService } from './function.service';

describe('FunctionService', () => {
  let service: FunctionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FunctionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
