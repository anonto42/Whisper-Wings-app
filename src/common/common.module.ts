import { Module } from '@nestjs/common';
import { UtilsService } from './utils/utils.service';
import { TemplatesService } from './templates/templates.service';

@Module({
  providers: [UtilsService,TemplatesService],
  exports: [UtilsService,TemplatesService],  // Make sure to export it
})
export class CommonModule {}
