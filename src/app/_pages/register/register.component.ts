import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { GlobalService } from '../../_shared/services/global.service';
import { AuthService } from '../../_shared/services/auth.service';
import { BusyService } from '../../_shared/services/busy.service';
import { DialogService } from '../../_shared/services/dialog.service';
import { CryptoService } from '../../_shared/services/crypto.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {

  usernameUsed = null;
  emailUsed = null;
  captchaRef = null;

  fg: FormGroup;
  submitted = false;

  returnUrl = '/';
  registerImg = '/assets/img/loginregister.png';
  registerInfo = 'Ayo bergabung dan masuk dalam komunitas~';

  subsUser = null;
  subsRegister = null;
  subsVerify = null;
  subsDialog = null;

  constructor(
    private fb: FormBuilder,
    public gs: GlobalService,
    private router: Router,
    private bs: BusyService,
    public route: ActivatedRoute,
    public as: AuthService,
    private ds: DialogService,
    private cs: CryptoService
  ) {
    this.gs.bannerImg = null;
    this.gs.sizeContain = false;
    this.gs.bgRepeat = false;
  }

  ngOnDestroy(): void {
    this.subsRegister?.unsubscribe();
    this.subsVerify?.unsubscribe();
    this.subsUser?.unsubscribe();
    this.subsDialog?.unsubscribe();
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/home';
    if (this.gs.isBrowser) {
      this.subsUser = this.as.currentUser.subscribe({
        next: user => {
          if (user) {
            this.router.navigateByUrl(this.returnUrl);
          } else {
            this.initForm();
          }
        }
      });
    }
  }

  get registerFormVal(): any {
    return this.fg.controls;
  }

  initForm(): void {
    this.fg = this.fb.group({
      username: [null, [Validators.required, Validators.minLength(8), Validators.pattern('^[a-z0-9]+$')]],
      name: [null, [Validators.required, Validators.pattern('^[a-zA-Z. ]+$')]],
      email: [null, [Validators.required, Validators.email, Validators.pattern(this.gs.emailRegex)]],
      password: [null, [Validators.required, Validators.minLength(8), Validators.pattern(this.gs.allKeyboardKeysRegex)]],
      agree: [null, [Validators.required]],
      'g-recaptcha-response': [null, [Validators.required, Validators.pattern(this.gs.allKeyboardKeysRegex)]],
    });
  }

  onClickedSubmit(): void {
    this.bs.busy();
    this.submitted = true;
    this.registerInfo = 'Harap Menunggu ...';
    this.usernameUsed = null;
    this.emailUsed = null;
    this.gs.log('[REGISTER_FORM_REQUEST]', this.fg.value);
    if (this.fg.invalid) {
      this.registerInfo = 'Periksa Dan Isi Kembali Data Anda!';
      this.submitted = false;
      this.bs.idle();
      return;
    }
    if (this.fg.valid) {
      this.submitted = true;
      this.subsRegister = this.as.register({
        username: this.fg.value.username,
        name: this.fg.value.name,
        email: this.fg.value.email,
        password: this.cs.hashPassword(this.fg.value.password),
        agree: this.fg.value.agree,
        'g-recaptcha-response': this.fg.value['g-recaptcha-response']
      }).subscribe({
        next: (res: any) => {
          this.bs.idle();
          this.registerInfo = res.info;
          this.bs.busy();
          this.subsVerify = this.as.verify(res.result.jwtToken).subscribe({
            next: success => {
              this.registerInfo = success.info;
              this.gs.log('[VERIFY_REGISTER_SUCCESS]', success);
              this.bs.idle();
              this.captchaRef.reset();
              this.router.navigateByUrl(this.returnUrl);
            },
            error: error => {
              this.gs.log('[VERIFY_REGISTER_ERROR]', error);
              this.bs.idle();
              this.captchaRef.reset();
              this.router.navigateByUrl('/login');
            }
          });
        },
        error: err => {
          this.gs.log('[REGISTER_FORM_ERROR]', err);
          this.bs.idle();
          this.submitted = false;
          this.captchaRef.reset();
          this.registerInfo = err.error.result.message || err.error.info;
          this.usernameUsed = err.error.result.username || null;
          this.emailUsed = err.error.result.email || null;
        }
      });
    }
  }

  captcha(captchaResponse, captchaRef): void {
    this.gs.log(`[GOOGLE_CAPTCHA] ${captchaResponse}`);
    this.captchaRef = captchaRef;
    if (captchaResponse) {
      this.fg.controls['g-recaptcha-response'].patchValue(captchaResponse);
    }
  }

  openAturanTatib(): void {
    if (this.fg.value.agree) {
      this.subsDialog = this.ds.openAturanTatibDialog('Setuju', 'Tolak').afterClosed().subscribe({
        next: re => {
          this.gs.log('[ATURAN_TATA_TERTIB_DIALOG_CLOSED]', re);
          this.fg.controls.agree.patchValue(re);
          this.subsDialog.unsubscribe();
        }
      });
    }
  }

}
