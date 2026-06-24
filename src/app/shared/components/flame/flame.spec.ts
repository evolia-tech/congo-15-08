import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Flame } from './flame';

describe('Flame', () => {
  let component: Flame;
  let fixture: ComponentFixture<Flame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Flame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Flame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
