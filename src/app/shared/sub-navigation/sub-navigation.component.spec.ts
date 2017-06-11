import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from '@app/shared';

import { SubNavigationComponent } from './sub-navigation.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('SubNavigationComponent', () => {
  let component: SubNavigationComponent;
  let fixture: ComponentFixture<SubNavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
