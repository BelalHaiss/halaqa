import {
  ISODateString,
  PaginationQueryType,
  PaginationResponseMeta
} from './types/api.types';

export interface LearnerContactDto {
  notes?: string;
}

export interface LearnerDto {
  id: string;
  name: string;
  role: 'STUDENT';
  timezone: string;
  contact: LearnerContactDto;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateLearnerDto {
  name: string;
  timezone: string;
  contact?: LearnerContactDto;
}

export interface UpdateLearnerDto {
  name?: string;
  timezone?: string;
  contact?: LearnerContactDto;
}

export type QueryLearnersDto = PaginationQueryType & {
  search?: string;
};

export type QueryLearnersResponseDto = {
  data: LearnerDto[];
} & PaginationResponseMeta;
