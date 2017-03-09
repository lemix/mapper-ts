"use strict";
const defaultConvertFunc = (src, dst, propName) => {
    return src[propName];
};
class MapConfig {
    constructor(src, dst, prefix) {
        this.mappingPropertyOpts = new Map();
        let srcName = Mapper.getClassName(src);
        let dstName = Mapper.getClassName(dst);
        this.key = `${prefix ? prefix + ':' : ''}${srcName}=>${dstName}`;
        if (MapConfig.mappers.has(this.key)) {
            throw new Error(`Mapper configuration for ${this.key} has exists. Use "prefix" for create alternative configuration.`);
        }
        MapConfig.mappers.set(this.key, this);
    }
    static getMapConfig(src, dst, prefix) {
        let srcName = src['prototype'] ? src['prototype'].constructor.name : src.constructor.name;
        let dstName = dst['prototype'] ? dst['prototype'].constructor.name : dst.constructor.name;
        let key = `${prefix ? prefix + ':' : ''}${srcName}=>${dstName}`;
        let cfg = MapConfig.mappers.get(key);
        if (!cfg)
            throw new Error('Mapper not defined for ' + key);
        return cfg;
    }
    forMember(prop, func) {
        let opts = {};
        let propName;
        if (typeof prop === 'function') {
            let execResult = /dst\.([a-zA-Z0-9_]+)\s*$/.exec(prop.toString());
            if (execResult)
                propName = execResult[1];
        }
        else {
            propName = prop;
        }
        if (typeof func === 'function') {
            opts.convertFunc = func;
        }
        this.mappingPropertyOpts.set(propName, opts);
        return this;
    }
    convertType(func) {
        this.typeConverter = func;
        return this;
    }
    getTypeConverter() {
        return this.typeConverter;
    }
    getPropertyMappers() {
        return this.mappingPropertyOpts;
    }
}
MapConfig.mappers = new Map();
exports.MapConfig = MapConfig;
class Mapper {
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
        }
        else if (typeof Array.isArray === "function") {
            return Array.isArray(object);
        }
        else {
            return !!(object instanceof Array);
        }
    }
    static createMap(src, dst, prefix) {
        return new MapConfig(src, dst, prefix);
    }
    static mapArr(src, dst, prefix) {
        return src.map(item => {
            return Mapper.map(item, dst, prefix);
        });
    }
    static map(src, dst, prefix) {
        if (src === null) {
            return typeof (dst) === 'function' ? new dst() : dst;
        }
        if (dst === null) {
            dst = {};
        }
        let cfg = MapConfig.getMapConfig(src, dst, prefix);
        let propertyMappers = cfg.getPropertyMappers();
        let obj;
        if (cfg.getTypeConverter()) {
            obj = cfg.getTypeConverter()(src);
        }
        else {
            obj = typeof (dst) === 'function' ? new dst() : dst;
        }
        for (let key of propertyMappers.keys()) {
            let opts = propertyMappers.get(key);
            let converter = opts.convertFunc ? opts.convertFunc : defaultConvertFunc;
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
    }
    ;
}
exports.Mapper = Mapper;
//# sourceMappingURL=index.js.map