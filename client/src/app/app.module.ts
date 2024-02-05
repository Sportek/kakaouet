import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BackgroundComponent } from '@app/components/background/background.component';
import { GlobalLayoutComponent } from '@app/components/global-layout/global-layout.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { BankQuestionComponent } from './components/bank-question/bank-question.component';
import { ChatComponent } from './components/chat/chat.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { ImportGameComponent } from './components/import-game/import-game.component';
import { QuestionOverlayComponent } from './components/question-overlay/question-overlay.component';
import { QuizTermineComponent } from './components/quiz-termine/quiz-termine.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { SelectorComponent } from './components/selector/selector.component';
import { AdminGameHistoryComponent } from './pages/admin/admin-game-history/admin-game-history.component';
import { AdminLoginPageComponent } from './pages/admin/admin-login-page/admin-login-page.component';
import { AdminPageComponent } from './pages/admin/admin-page/admin-page.component';
import { AdminQuestionBankComponent } from './pages/admin/admin-question-bank/admin-question-bank.component';
import { CreateUpdateQuestionComponent } from './pages/admin/create/create-update-question/create-update-question.component';
import { CreateUpdateQuizComponent } from './pages/admin/create/create-update-quiz/create-update-quiz.component';
import { CreatePageComponent } from './pages/create-game/create-page/create-page.component';
import { DescriptonPageComponent } from './pages/create-game/descripton-page/descripton-page.component';
import { TestingGameComponent } from './pages/create-game/testing-game/testing-game.component';
import { Error404Component } from './pages/error/error404/error404.component';
import { GameVueComponent } from './pages/game/game-vue/game-vue.component';
import { JoinComponent } from './pages/game/join/join.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        MainPageComponent,
        BackgroundComponent,
        CreatePageComponent,
        AdminPageComponent,
        AdminLoginPageComponent,
        GlobalLayoutComponent,
        FooterComponent,
        HeaderComponent,
        AdminQuestionBankComponent,
        AdminGameHistoryComponent,
        QuizComponent,
        ImportGameComponent,
        CreateUpdateQuestionComponent,
        CreateUpdateQuizComponent,
        QuizTermineComponent,
        SelectorComponent,
        BankQuestionComponent,
        DescriptonPageComponent,
        TestingGameComponent,
        GameVueComponent,
        ChatComponent,
        Error404Component,
        JoinComponent,
        QuestionOverlayComponent,
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule, MatButtonModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
