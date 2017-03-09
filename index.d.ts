export interface IConstructor<T> {
    new (...args: any[]): T;
}
export interface IMappingPropertyOpts {
    srcPropName?: string;
    convertFunc?: ConvertFunc<any, any, any>;
    promised?: boolean;
}
export interface ConvertFunc<TReturn, TSource, TDestination> {
    (src: TSource, dst?: TDestination, propName?: string): TReturn;
}
export interface TypeConvertFunc<TSource, TDestination> {
    (src: TSource): TDestination;
}
export interface DefinePropertyFunc<TReturn, TDestination> {
    (src: TDestination): TReturn;
}
export declare class MapConfig<TSource, TDestination> {
    private static mappers;
    private key;
    private mappingPropertyOpts;
    private typeConverter;
    dst: TDestination;
    constructor(src: IConstructor<TSource>, dst: IConstructor<TDestination>, prefix?: string);
    static getMapConfig<TSource, TDestination>(src: TSource, dst: TDestination, prefix?: string): MapConfig<TSource, TDestination>;
    forMember<TReturn>(prop: keyof TDestination | DefinePropertyFunc<TReturn, TDestination>, func?: ConvertFunc<TReturn, TSource, TDestination>): this;
    convertType(func: TypeConvertFunc<TSource, TDestination>): this;
    getTypeConverter(): TypeConvertFunc<TSource, TDestination>;
    getPropertyMappers(): Map<string, IMappingPropertyOpts>;
}
export declare class Mapper {
    static isPrimitive(obj: any): boolean;
    static isArray(object: any): boolean;
    static createMap<TSource, TDestination>(src: IConstructor<TSource>, dst: IConstructor<TDestination>, prefix?: string): MapConfig<TSource, TDestination>;
    static mapArr<T, TResult>(src: Array<T>, dst: ({
        new (): TResult;
    } | TResult), prefix?: string): TResult[];
    static map<T, TResult>(src: T, dst: ({
        new (): TResult;
    } | TResult), prefix?: string): TResult;
    static getClassName(classType: any): any;
}
