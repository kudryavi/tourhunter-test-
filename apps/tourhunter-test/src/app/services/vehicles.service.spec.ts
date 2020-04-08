import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VehiclesService } from './vehicles.service';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VehiclesService]
    });

    service = TestBed.inject(VehiclesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve vehicles from the API via GET', () => {
    service.loadVehicles().subscribe();
    const request = httpMock.expectOne('/api/vehicles');
    expect(request.request.method).toBe('GET');
  });

  it('should retrieve vehicles from BehaviorSublect', () => {
    service.loadVehicles().subscribe(vehicles => {
      expect(vehicles).toEqual(service.vehicles$)
    });
  });
});
