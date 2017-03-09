const defaultConvertFunc: ConvertFunc<any, any, any> = (src, dst, propName): any => {
    return src[propName];
}

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

/*export function MapFrom<T>(obj: IConstructor<T>, f?: (a: T) => any, promised?: boolean): (target: Object, prop: string) => void {
    return (target: any, propName: string) => {
        let cfg = new MapConfig<T, typeof target>(obj, target.prototype);
        cfg.forMember(propName, f);
    }
}*/

export class MapConfig<TSource, TDestination> {
    private static mappers = new Map<string, MapConfig<any, any>>();
    private key: string;
    private mappingPropertyOpts = new Map<string, IMappingPropertyOpts>();
    private typeConverter: TypeConvertFunc<TSource, TDestination>;
    public dst: TDestination;
    
    constructor(src: IConstructor<TSource>, dst: IConstructor<TDestination>, prefix?: string) {
        let srcName = Mapper.getClassName(src);
        let dstName = Mapper.getClassName(dst);
        this.key = `${prefix ? prefix + ':' : ''}${srcName}=>${dstName}`;
        if (MapConfig.mappers.has(this.key)) {
            throw new Error(`Mapper configuration for ${this.key} has exists. Use "prefix" for create alternative configuration.`)
        }
        MapConfig.mappers.set(this.key, this);
    }

    public static getMapConfig<TSource, TDestination>(src: TSource, dst: TDestination, prefix?: string) {
        let srcName = src['prototype'] ? src['prototype'].constructor.name : src.constructor.name;
        let dstName = dst['prototype'] ? dst['prototype'].constructor.name : dst.constructor.name;
        let key = `${prefix ? prefix + ':' : ''}${srcName}=>${dstName}`;
        let cfg: MapConfig<TSource, TDestination> = MapConfig.mappers.get(key);
        if (!cfg)
            throw new Error('Mapper not defined for ' + key);
        return cfg;
    }

    public forMember<TReturn>(prop: keyof TDestination | DefinePropertyFunc<TReturn, TDestination>, func?: ConvertFunc<TReturn, TSource, TDestination>) {
        let opts: IMappingPropertyOpts = {};
        let propName;

        if (typeof prop === 'function') {
            let execResult = /dst\.([a-zA-Z0-9_]+)\s*$/.exec(prop.toString());
            if (execResult) propName = execResult[1];
        } else {
            propName = prop;
        }

        if (typeof func === 'function') {
            opts.convertFunc = func;
        }
        this.mappingPropertyOpts.set(propName, opts);
        return this;
    }

    public convertType(func: TypeConvertFunc<TSource, TDestination>) {
        this.typeConverter = func;
        return this;
    }

    public getTypeConverter(): TypeConvertFunc<TSource, TDestination> {
        return this.typeConverter;
    }

    public getPropertyMappers(): Map<string, IMappingPropertyOpts> {
        return this.mappingPropertyOpts;
    }
}

export class Mapper {
    static isPrimitive(obj) {
        switch (typeof obj) {
            case "string":
            case "number":
            case "boolean":
                return true;
        }
        return !!(obj instanceof String || obj === String ||
            obj instanceof Number || obj === Number ||
            obj instanceof Boolean || obj === Boolean);
    }

    static isArray(object) {
        if (object === Array) {
            return true;
        } else if (typeof Array.isArray === "function") {
            return Array.isArray(object);
        }
        else {
            return !!(object instanceof Array);
        }
    }

    static createMap<TSource, TDestination>(src: IConstructor<TSource>, dst: IConstructor<TDestination>, prefix?: string): MapConfig<TSource, TDestination> {
        return new MapConfig<TSource, TDestination>(src, dst, prefix);
    }

    static mapArr<T, TResult>(src: Array<T>, dst: ({ new (): TResult } | TResult), prefix?: string): TResult[] {
        return src.map(item => {
            return Mapper.map(item, dst, prefix);
        });
    }

    static map<T, TResult>(src: T, dst: ({ new (): TResult } | TResult), prefix?: string): TResult {
        if(src === null) {
            return typeof (dst) === 'function' ? new dst() : dst;
        }
        
        if(dst === null) {
            dst = <TResult>{};
        }

        let cfg = MapConfig.getMapConfig(src, dst, prefix);
        let propertyMappers = cfg.getPropertyMappers();
        let obj;

        if (cfg.getTypeConverter()) {
            obj = cfg.getTypeConverter()(src);
        } else {
            obj = typeof (dst) === 'function' ? new dst() : dst;
        }

        for (let key of propertyMappers.keys()) {
            let opts: IMappingPropertyOpts = propertyMappers.get(key);
            let converter: ConvertFunc<any, any, any> = opts.convertFunc ? opts.convertFunc : defaultConvertFunc;
            obj[key] = converter(src, obj, key);
        }

        return obj;
    }

    static getClassName(classType) {
        if (classType && classType.name) {
            return classType.name;
        }

        if (classType && classType.constructor) {
            var className = classType.toString();
            if (className) {
                var matchParts = className.match(/function\s*(\w+)/);
                if (matchParts && matchParts.length === 2) {
                    return matchParts[1];
                }
            }
        }

        throw new Error("Unable to extract class name from type '" + classType + "'");
    };
}