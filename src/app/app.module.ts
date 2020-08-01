import { BrowserModule, HammerModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

import { AppRoutingModule } from './app-routing.module';

import { SharedMaterialModule } from './_shared/helpers/shared-material.module';
import { MyHammerConfig } from './_shared/helpers/my-hammer.config';

import { FakeBackendProvider } from './_shared/backends/fake-backend';
import { HttpRequestInterceptor } from './_shared/interceptors/http-request.interceptor';
import { HttpErrorInterceptor } from './_shared/interceptors/http-error.interceptor';

import { LeftMenuService } from './_shared/services/left-menu.service';

import { AppComponent } from './app.component';
import { HeaderComponent } from './_shared/components/header/header.component';
import { LeftMenuComponent } from './_shared/components/left-menu/left-menu.component';
import { FooterComponent } from './_shared/components/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LeftMenuComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedMaterialModule,
    FlexLayoutModule,
    HammerModule,
    NgxSpinnerModule
  ],
  providers: [
    { provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig },
    { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    FakeBackendProvider, Title, CookieService, NgxSpinnerService, LeftMenuService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
