import { CreateStyleDto } from './create-style.dto';
declare const UpdateStyleDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateStyleDto>>;
export declare class UpdateStyleDto extends UpdateStyleDto_base {
    name?: string;
}
export {};
