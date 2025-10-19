import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  exports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
})
export class SharedModule {}
