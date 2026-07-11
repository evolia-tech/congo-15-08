import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Newletters } from './newletters';

describe('Newletters', () => {
  let component: Newletters;
  let fixture: ComponentFixture<Newletters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Newletters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Newletters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
