import { IsNotEmpty, IsOptional } from 'class-validator';

export class FileNameDto {
  @IsOptional()
  originalName?: string;

  @IsNotEmpty()
  fileURL: string;

  @IsOptional()
  mimetype: string;

  @IsOptional()
  size?: number;
}
