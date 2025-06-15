import { ApiProperty } from '@nestjs/swagger';

export class CommonSuccessResponse<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: T;
}
