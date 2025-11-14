import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { Login } from './login';
import { AuthService } from '../../../core/auth.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'signIn',
      'isAuthenticated',
    ]);
    authServiceSpy.isAuthenticated.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [Login, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to home when already authenticated on init', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    fixture.detectChanges(); // triggers ngOnInit

    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should mark form as touched and not submit when invalid', () => {
    fixture.detectChanges();
    const markAllAsTouchedSpy = spyOn(component.form, 'markAllAsTouched').and.callThrough();

    component.submit();

    expect(markAllAsTouchedSpy).toHaveBeenCalled();
    expect(authServiceSpy.signIn).not.toHaveBeenCalled();
    expect(component.submitting).toBeFalse();
  });

  it('should submit and navigate on successful login', () => {
    fixture.detectChanges();
    authServiceSpy.signIn.and.returnValue(of(void 0));
    component.form.setValue({
      username: 'user123',
      password: 'password',
    });

    component.submit();

    expect(authServiceSpy.signIn).toHaveBeenCalledOnceWith('user123', 'password');
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
    expect(component.error).toBeNull();
    expect(component.submitting).toBeFalse();
  });

  it('should set error message and stop submitting on error', () => {
    fixture.detectChanges();
    authServiceSpy.signIn.and.returnValue(
      throwError(() => ({ error: { error: 'Server error' } }))
    );
    component.form.setValue({
      username: 'user123',
      password: 'password',
    });

    component.submit();

    expect(authServiceSpy.signIn).toHaveBeenCalledOnceWith('user123', 'password');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.error).toBe('Server error');
    expect(component.submitting).toBeFalse();
  });
});

