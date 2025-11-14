import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { SignUp } from './sign-up';
import { AuthService } from '../../../core/auth.service';

describe('SignUp', () => {
  let component: SignUp;
  let fixture: ComponentFixture<SignUp>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['signUp']);

    await TestBed.configureTestingModule({
      imports: [SignUp, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(SignUp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark form as touched and not submit when invalid', () => {
    const markAllAsTouchedSpy = spyOn(component.form, 'markAllAsTouched').and.callThrough();

    component.submit();

    expect(markAllAsTouchedSpy).toHaveBeenCalled();
    expect(authServiceSpy.signUp).not.toHaveBeenCalled();
    expect(component.submitting).toBeFalse();
  });

  it('should submit and navigate on successful sign up', () => {
    authServiceSpy.signUp.and.returnValue(of(void 0));
    component.form.setValue({
      username: 'user123',
      password: 'password',
      confirmPassword: 'password',
    });

    component.submit();

    expect(authServiceSpy.signUp).toHaveBeenCalledOnceWith('user123', 'password');
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
    expect(component.error).toBeNull();
    expect(component.submitting).toBeFalse();
  });

  it('should set error message and stop submitting on error', () => {
    authServiceSpy.signUp.and.returnValue(
      throwError(() => ({ error: { error: 'Server error' } }))
    );
    component.form.setValue({
      username: 'user123',
      password: 'password',
      confirmPassword: 'password',
    });

    component.submit();

    expect(authServiceSpy.signUp).toHaveBeenCalledOnceWith('user123', 'password');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.error).toBe('Server error');
    expect(component.submitting).toBeFalse();
  });

  it('should set passwordMismatch error when passwords do not match', () => {
    component.form.setValue({
      username: 'user123',
      password: 'password1',
      confirmPassword: 'password2',
    });

    component.form.updateValueAndValidity();

    expect(component.form.hasError('passwordMismatch')).toBeTrue();
  });
});

