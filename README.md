# Mapper-ts

Mapper-ts is a small library written in TypeScript built to rid of code that mapped one object to another. Mapping properties from source object to destination type.

## Usage example

1. Create example types:

```typescript
class A {
    public id:number = 1;
    public angleDeg: number = 120;
    public x: number = 10;
    public y: number = 20;
}

class B {
    public name!: string;
    public angleRad!: number;
    public x!: number;
    public y!: number;
}
```

2. Create map configuration

```typescript
import { Mapper } from 'mapper';

Mapper.createMap(A, B)
    .forMember(dst => dst.name, src => `shape ${src.id.toString()}`)
    .forMember(dst => dst.angleRad, src => src.angleDeg * (Math.PI/180))
    .forMember(dst => dst.x, src => src.x)
    .forMember(dst => dst.y, src => src.y)
```

3. Usage mapping

```typescript
import { Mapper } from 'mapper';

let a = new A();
let b = Mapper.map(a, B);

console.log(b instanceof B); // true
console.log(JSON.stringify(b)); // { "name": "shape 1", "angleRad": 2.0943951023931953, "x": 10, "y": 20 }
```
