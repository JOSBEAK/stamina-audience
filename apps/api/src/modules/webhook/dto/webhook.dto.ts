import { ApiProperty } from '@nestjs/swagger';

class CustomArgsDto {
  @ApiProperty({
    description: 'The unique identifier for the broadcast recipient.',
    example: 'cuid_12345',
  })
  broadcast_recipient_id: string;
}

export class SendGridEventDto {
  @ApiProperty({
    description: "The recipient's email address.",
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The UNIX timestamp of the event.',
    example: 1679582297,
  })
  timestamp: number;

  @ApiProperty({
    description: 'The type of event.',
    example: 'open',
  })
  event: string;

  @ApiProperty({
    description: 'Custom arguments passed with the email.',
    type: CustomArgsDto,
  })
  custom_args: CustomArgsDto;
}
