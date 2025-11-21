import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ResponseMessage } from 'src/decorator/customize';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get()
  @ResponseMessage('Thống kê tổng hợp Dashboard')
  async getFullStats() {
    return this.dashboardService.getFullDashboard();
  }
}
