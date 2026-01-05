import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss'
})
export class HomePageComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly themeService = inject(ThemeService);

  readonly data = this.dashboardService.data;
  readonly theme = this.themeService.theme;
}

