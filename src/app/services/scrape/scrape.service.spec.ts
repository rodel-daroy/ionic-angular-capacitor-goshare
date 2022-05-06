import { TestBed } from '@angular/core/testing';

import { ScrapeService } from './scrape.service';

describe('ScrapeService', () => {
  let service: ScrapeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrapeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
