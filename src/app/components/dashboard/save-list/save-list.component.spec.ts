import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SaveListComponent } from './save-list.component';

describe('SaveListComponent', () => {
  let component: SaveListComponent;
  let fixture: ComponentFixture<SaveListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveListComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SaveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
