import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment content',
    example: 'This task needs to be completed by end of week',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
